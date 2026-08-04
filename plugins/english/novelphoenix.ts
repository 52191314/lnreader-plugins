import { CheerioAPI, load } from 'cheerio';
import { fetchApi } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { NovelStatus } from '@libs/novelStatus';
import { Filters, FilterTypes } from '@libs/filterInputs';
import { defaultCover } from '@/types/constants';

const STATUS_MAP: Record<string, string> = {
  ongoing: NovelStatus.Ongoing,
  completed: NovelStatus.Completed,
  complete: NovelStatus.Completed,
  hiatus: NovelStatus.OnHiatus,
  paused: NovelStatus.OnHiatus,
  cancelled: NovelStatus.Cancelled,
  dropped: NovelStatus.Cancelled,
  unknown: NovelStatus.Unknown,
};

class NovelPhoenix implements Plugin.PagePlugin {
  id = 'novelphoenix';
  name = 'NovelPhoenix';
  version = '1.1.1';
  icon = 'src/english/novelphoenix/icon.png';
  site = 'https://novelphoenix.com/';
  novelList = new Set<string>();

  // Browser headers are required: the site's Cloudflare returns 403 for
  // non-browser User-Agents.
  headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Referer: 'https://novelphoenix.com/',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  async getCheerio(url: string, search: boolean): Promise<CheerioAPI> {
    const r = await fetchApi(url, { headers: this.headers });
    if (!r.ok && search != true)
      throw new Error(
        'Could not reach site (' + r.status + ') try to open in webview.',
      );
    const $ = load(await r.text());

    const title = $('title').text();
    if (
      title.includes('Cloudflare') ||
      title.includes('Just a moment') ||
      title.includes('Attention Required') ||
      title.includes('Access denied')
    ) {
      throw new Error('Cloudflare is blocking requests. Try again later.');
    }

    return $;
  }

  parseNovels(
    loadedCheerio: CheerioAPI,
    selector = '.novel-item',
    isFirstPage = false,
  ): Plugin.NovelItem[] {
    const novels: Plugin.NovelItem[] = [];

    const elements = loadedCheerio(selector).toArray();
    for (const el of elements) {
      const $el = loadedCheerio(el);

      const novelName =
        $el.find('a').attr('title') ?? $el.find('h4').text().trim();
      const novelPath =
        $el.children('a').attr('href') ?? $el.find('h4 a').attr('href');

      if (!novelPath) continue;

      const path = new URL(novelPath, this.site).pathname.substring(1);

      if (!isFirstPage) {
        if (this.novelList.has(path)) continue;
        this.novelList.add(path);
      } else {
        this.novelList.add(path);
      }

      const imgElement = $el.find('.novel-cover > img');
      const rawSrc = imgElement.attr('data-src') ?? imgElement.attr('src');
      const novelCover = rawSrc
        ? new URL(rawSrc, this.site).href
        : defaultCover;

      novels.push({
        name: novelName,
        cover: novelCover,
        path,
      });
    }

    return novels;
  }

  async popularNovels(
    pageNo: number,
    {
      showLatestNovels,
      filters,
    }: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    if (pageNo === 1) {
      this.novelList.clear();
    }

    // The site's advanced-search form requires the full parameter set; a
    // partial query returns an empty result page. Always send every param.
    const url = this.site + 'search-adv';
    const params = new URLSearchParams();

    for (const language of filters.language.value) {
      params.append('country_id[]', language);
    }
    params.append('ctgcon', filters.genre_operator.value);
    for (const genre of filters.genres.value) {
      params.append('categories[]', genre);
    }
    params.append('totalchapter', filters.chapters.value);
    params.append('ratcon', filters.rating_operator.value);
    params.append('rating', filters.rating.value);
    params.append('status', filters.status.value);
    params.append('sort', showLatestNovels ? 'date' : filters.sort.value);
    params.append('tagcon', 'and');
    params.append('page', pageNo.toString());

    const loadedCheerio = await this.getCheerio(
      `${url}?${params.toString()}`,
      false,
    );

    return this.parseNovels(loadedCheerio, '.novel-item', pageNo === 1);
  }

  async parseNovel(
    novelPath: string,
  ): Promise<Plugin.SourceNovel & { totalPages: number }> {
    const $ = await this.getCheerio(this.site + novelPath, false);
    const baseUrl = this.site;

    const novel: Partial<Plugin.SourceNovel & { totalPages: number }> = {
      path: novelPath,
      totalPages: 1,
    };

    novel.name =
      $('.novel-title').text().trim() ??
      $('.cover > img').attr('alt') ??
      'No Titled Found';
    const coverUrl =
      $('.cover > img').attr('data-src') ?? $('.cover > img').attr('src');

    if (coverUrl) {
      novel.cover = new URL(coverUrl, baseUrl).href;
    } else {
      novel.cover = defaultCover;
    }

    novel.genres = $('.categories .property-item')
      .map((_, el) => $(el).text())
      .toArray()
      .join(',');

    const summary = $('.summary .content');
    summary.find('.expand').remove();
    summary.find('br').replaceWith('\n');
    summary.find('p').before('\n').after('\n\n');

    novel.summary =
      summary
        .text()
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        ?.replace(/\n{3,}/g, '\n\n')
        .trim() || 'Summary Not Found';

    novel.author = $('.author .property-item > span').text();

    const rawStatus =
      $('.header-stats .ongoing').text() ||
      $('.header-stats .completed').text() ||
      'Unknown';
    novel.status = STATUS_MAP[rawStatus.toLowerCase()] ?? NovelStatus.Unknown;

    novel.rating = parseFloat($('.nub').text().trim());

    const totalChapters = $('.header-stats i.icon-book-open')
      .parent()
      .text()
      .trim();
    novel.totalPages = Math.ceil(parseInt(totalChapters) / 100) || 1;
    if (novel.totalPages === 1) {
      novel.chapters = (await this.parsePage(novelPath, '1')).chapters;
    }

    return novel as Plugin.SourceNovel & { totalPages: number };
  }

  async parsePage(novelPath: string, page: string): Promise<Plugin.SourcePage> {
    const url = `${this.site}${novelPath}/chapters?page=${page}`;
    const loadedCheerio = await this.getCheerio(url, false);

    const chapters = loadedCheerio('.chapter-list li')
      .map((_, ele) => {
        const chapterName =
          loadedCheerio(ele).find('a').attr('title') || 'No Title Found';
        const chapterPath = loadedCheerio(ele).find('a').attr('href');

        if (!chapterPath) return null;

        return {
          name: chapterName,
          path: new URL(chapterPath, this.site).pathname.substring(1),
          releaseTime:
            loadedCheerio(ele).find('.chapter-update').attr('datetime') ||
            loadedCheerio(ele).find('.chapter-update').text().trim(),
        };
      })
      .get()
      .filter(chapter => chapter !== null) as Plugin.ChapterItem[];

    return {
      chapters,
    };
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const url = this.site + chapterPath;
    const loadedCheerio = await this.getCheerio(url, false);

    const chapterText = loadedCheerio('#content');
    chapterText
      .find(
        'script, style, ins, iframe, .ads, .ad-container, .nf-ads, .watermark, div.text-center, #restore-scroll-btn',
      )
      .remove();
    chapterText.find('[style]').removeAttr('style');

    return chapterText.html()?.replace(/&nbsp;/g, ' ') || '';
  }

  async searchNovels(
    searchTerm: string,
    page: number,
  ): Promise<Plugin.NovelItem[]> {
    if (page === 1) {
      this.novelList.clear();
    }
    const params = new URLSearchParams();
    params.append('keyword', searchTerm);
    params.append('page', page.toString());
    const url = `${this.site}search?${params.toString()}`;
    const result = await fetchApi(url, { headers: this.headers });
    const body = await result.text();

    const loadedCheerio = load(body);

    return this.parseNovels(
      loadedCheerio,
      '.novel-list.chapters .novel-item',
      page === 1,
    );
  }

  filters = {
    sort: {
      value: 'rank-top',
      label: 'Sort Results By',
      options: [
        { label: 'Rank (Top)', value: 'rank-top' },
        { label: 'Rating Score (Top)', value: 'rating-score-top' },
        { label: 'Review Count (Most)', value: 'review' },
        { label: 'Comment Count (Most)', value: 'comment' },
        { label: 'Bookmark Count (Most)', value: 'bookmark' },
        { label: 'Today Views (Most)', value: 'today-view' },
        { label: 'Monthly Views (Most)', value: 'monthly-view' },
        { label: 'Total Views (Most)', value: 'total-view' },
        { label: 'Title (A>Z)', value: 'abc' },
        { label: 'Title (Z>A)', value: 'cba' },
        { label: 'Last Updated (Newest)', value: 'date' },
        { label: 'Chapter Count (Most)', value: 'chapter-count-most' },
      ],
      type: FilterTypes.Picker,
    },
    status: {
      value: '-1',
      label: 'Translation Status',
      options: [
        { label: 'All', value: '-1' },
        { label: 'Completed', value: '1' },
        { label: 'Ongoing', value: '0' },
      ],
      type: FilterTypes.Picker,
    },
    genre_operator: {
      value: 'and',
      label: 'Genres (And/Or/Exclude)',
      options: [
        { label: 'AND', value: 'and' },
        { label: 'OR', value: 'or' },
        { label: 'EXCLUDE', value: 'exclude' },
      ],
      type: FilterTypes.Picker,
    },
    genres: {
      value: [],
      label: 'Genres',
      options: [
        { label: 'Action', value: '3' },
        { label: 'Adult', value: '28' },
        { label: 'Adventure', value: '4' },
        { label: 'Anime', value: '46' },
        { label: 'Arts', value: '47' },
        { label: 'Comedy', value: '5' },
        { label: 'Drama', value: '24' },
        { label: 'Eastern', value: '44' },
        { label: 'Ecchi', value: '26' },
        { label: 'Fan-fiction', value: '48' },
        { label: 'Fantasy', value: '6' },
        { label: 'Game', value: '19' },
        { label: 'Gender Bender', value: '25' },
        { label: 'Harem', value: '7' },
        { label: 'Historical', value: '12' },
        { label: 'Horror', value: '37' },
        { label: 'Isekai', value: '49' },
        { label: 'Josei', value: '2' },
        { label: 'Lgbt+', value: '45' },
        { label: 'Magic', value: '50' },
        { label: 'Magical Realism', value: '51' },
        { label: 'Manhua', value: '52' },
        { label: 'Martial Arts', value: '15' },
        { label: 'Mature', value: '8' },
        { label: 'Mecha', value: '34' },
        { label: 'Military', value: '53' },
        { label: 'Modern Life', value: '54' },
        { label: 'Movies', value: '55' },
        { label: 'Mystery', value: '16' },
        { label: 'Other', value: '64' },
        { label: 'Psychological', value: '9' },
        { label: 'Realistic Fiction', value: '56' },
        { label: 'Reincarnation', value: '43' },
        { label: 'Romance', value: '1' },
        { label: 'School Life', value: '21' },
        { label: 'Sci-fi', value: '20' },
        { label: 'Seinen', value: '10' },
        { label: 'Shoujo', value: '38' },
        { label: 'Shoujo Ai', value: '57' },
        { label: 'Shounen', value: '17' },
        { label: 'Shounen Ai', value: '39' },
        { label: 'Slice of Life', value: '13' },
        { label: 'Smut', value: '29' },
        { label: 'Sports', value: '42' },
        { label: 'Supernatural', value: '18' },
        { label: 'System', value: '58' },
        { label: 'Tragedy', value: '32' },
        { label: 'Urban', value: '63' },
        { label: 'Urban Life', value: '59' },
        { label: 'Video Games', value: '60' },
        { label: 'War', value: '61' },
        { label: 'Wuxia', value: '31' },
        { label: 'Xianxia', value: '23' },
        { label: 'Xuanhuan', value: '22' },
        { label: 'Yaoi', value: '14' },
        { label: 'Yuri', value: '62' },
      ],
      type: FilterTypes.CheckboxGroup,
    },
    language: {
      value: [],
      label: 'Language',
      options: [
        { label: 'Chinese', value: '1' },
        { label: 'Japanese', value: '3' },
        { label: 'English', value: '4' },
      ],
      type: FilterTypes.CheckboxGroup,
    },
    rating_operator: {
      value: 'min',
      label: 'Rating (Min/Max)',
      options: [
        { label: 'Min', value: 'min' },
        { label: 'Max', value: 'max' },
      ],
      type: FilterTypes.Picker,
    },
    rating: {
      value: '0',
      label: 'Rating',
      options: [
        { label: 'All', value: '0' },
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
        { label: '5', value: '5' },
      ],
      type: FilterTypes.Picker,
    },
    chapters: {
      value: '0',
      label: 'Chapters',
      options: [
        { label: 'All', value: '0' },
        { label: '50-100', value: '50,100' },
        { label: '100-200', value: '100,200' },
        { label: '200-500', value: '200,500' },
        { label: '500-1000', value: '500,1000' },
        { label: '>1000', value: '1001,1000000' },
      ],
      type: FilterTypes.Picker,
    },
  } satisfies Filters;
}

export default new NovelPhoenix();
