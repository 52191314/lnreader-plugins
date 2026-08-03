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
  version = '1.0.5';
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
    options?: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    if (pageNo === 1) {
      this.novelList.clear();
    }

    const genreVal = options?.filters?.genres?.value;
    const genre =
      Array.isArray(genreVal) && genreVal.length > 0
        ? genreVal[0]
        : typeof genreVal === 'string' && genreVal
          ? genreVal
          : 'genre-all';

    const orderVal = options?.filters?.order?.value;
    const order =
      typeof orderVal === 'string' && orderVal
        ? orderVal
        : options?.showLatestNovels
          ? 'sort-new'
          : 'sort-popular';

    const statusVal = options?.filters?.status?.value;
    const status =
      typeof statusVal === 'string' && statusVal ? statusVal : 'status-all';

    const langVal = options?.filters?.language?.value;
    const language =
      typeof langVal === 'string' && langVal ? langVal : 'all-novel';

    const url = `${this.site}${genre}/${order}/${status}/${language}?page=${pageNo}`;
    const loadedCheerio = await this.getCheerio(url, false);

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
    order: {
      value: 'sort-popular',
      label: 'Order by',
      options: [
        { label: 'Popular', value: 'sort-popular' },
        { label: 'New', value: 'sort-new' },
        { label: 'Latest Release', value: 'sort-latest-release' },
      ],
      type: FilterTypes.Picker,
    },
    status: {
      value: 'status-all',
      label: 'Status',
      options: [
        { label: 'All', value: 'status-all' },
        { label: 'Ongoing', value: 'status-ongoing' },
        { label: 'Completed', value: 'status-completed' },
      ],
      type: FilterTypes.Picker,
    },
    language: {
      value: 'all-novel',
      label: 'Language',
      options: [
        { label: 'All', value: 'all-novel' },
        { label: 'Chinese', value: 'chinese-novel' },
        { label: 'Japanese', value: 'japanese-novel' },
        { label: 'English', value: 'english-novel' },
      ],
      type: FilterTypes.Picker,
    },
    genres: {
      value: [],
      label: 'Genres',
      options: [
        { label: 'Action', value: 'genre-action' },
        { label: 'Adult', value: 'genre-adult' },
        { label: 'Adventure', value: 'genre-adventure' },
        { label: 'Anime', value: 'genre-anime' },
        { label: 'Arts', value: 'genre-arts' },
        { label: 'Comedy', value: 'genre-comedy' },
        { label: 'Drama', value: 'genre-drama' },
        { label: 'Eastern', value: 'genre-eastern' },
        { label: 'Ecchi', value: 'genre-ecchi' },
        { label: 'Fan-fiction', value: 'genre-fan-fiction' },
        { label: 'Fantasy', value: 'genre-fantasy' },
        { label: 'Game', value: 'genre-game' },
        { label: 'Gender Bender', value: 'genre-gender-bender' },
        { label: 'Harem', value: 'genre-harem' },
        { label: 'Historical', value: 'genre-historical' },
        { label: 'Horror', value: 'genre-horror' },
        { label: 'Isekai', value: 'genre-isekai' },
        { label: 'Josei', value: 'genre-josei' },
        { label: 'Lgbt+', value: 'genre-lgbt' },
        { label: 'Magic', value: 'genre-magic' },
        { label: 'Magical Realism', value: 'genre-magical-realism' },
        { label: 'Manhua', value: 'genre-manhua' },
        { label: 'Martial Arts', value: 'genre-martial-arts' },
        { label: 'Mature', value: 'genre-mature' },
        { label: 'Mecha', value: 'genre-mecha' },
        { label: 'Military', value: 'genre-military' },
        { label: 'Modern Life', value: 'genre-modern-life' },
        { label: 'Movies', value: 'genre-movies' },
        { label: 'Mystery', value: 'genre-mystery' },
        { label: 'Other', value: 'genre-other' },
        { label: 'Psychological', value: 'genre-psychological' },
        { label: 'Realistic Fiction', value: 'genre-realistic-fiction' },
        { label: 'Reincarnation', value: 'genre-reincarnation' },
        { label: 'Romance', value: 'genre-romance' },
        { label: 'School Life', value: 'genre-school-life' },
        { label: 'Sci-fi', value: 'genre-sci-fi' },
        { label: 'Seinen', value: 'genre-seinen' },
        { label: 'Shoujo', value: 'genre-shoujo' },
        { label: 'Shoujo Ai', value: 'genre-shoujo-ai' },
        { label: 'Shounen', value: 'genre-shounen' },
        { label: 'Shounen Ai', value: 'genre-shounen-ai' },
        { label: 'Slice of Life', value: 'genre-slice-of-life' },
        { label: 'Smut', value: 'genre-smut' },
        { label: 'Sports', value: 'genre-sports' },
        { label: 'Supernatural', value: 'genre-supernatural' },
        { label: 'System', value: 'genre-system' },
        { label: 'Tragedy', value: 'genre-tragedy' },
        { label: 'Urban', value: 'genre-urban' },
        { label: 'Urban Life', value: 'genre-urban-life' },
        { label: 'Video Games', value: 'genre-video-games' },
        { label: 'War', value: 'genre-war' },
        { label: 'Wuxia', value: 'genre-wuxia' },
        { label: 'Xianxia', value: 'genre-xianxia' },
        { label: 'Xuanhuan', value: 'genre-xuanhuan' },
        { label: 'Yaoi', value: 'genre-yaoi' },
        { label: 'Yuri', value: 'genre-yuri' },
      ],
      type: FilterTypes.CheckboxGroup,
    },
  } satisfies Filters;
}

export default new NovelPhoenix();
