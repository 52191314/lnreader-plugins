import { fetchText, fetchApi } from '@libs/fetch';
import { load as loadCheerio } from 'cheerio';
import { Plugin } from '@typings/plugin';
import { NovelStatus } from '@libs/novelStatus';
import { Filters, FilterTypes } from '@libs/filterInputs';

export class LightNovelWorldPlugin implements Plugin.PluginBase {
  id = 'lightnovelworld';
  name = 'LightNovelWorld';
  icon = 'src/en/lightnovelworld/icon.png';
  site = 'https://lightnovelworld.org/';
  version = '1.0.0';

  async popularNovels(
    pageNo: number,
    {
      showLatestNovels,
      filters,
    }: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    const genre = filters.genre.value;
    const status = filters.status.value;
    const order = showLatestNovels ? 'updates' : filters.order.value;
    const url = `${this.site}genre-${genre}/?status=${status}&order=${order}&page=${pageNo}`;
    const html = await fetchText(url);
    return this.parseNovelList(html);
  }

  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    if (pageNo > 1) return [];

    const url = `${this.site}search?keyword=${encodeURIComponent(searchTerm)}`;
    const html = await fetchText(url);
    return this.parseNovelList(html);
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const fullUrl = novelPath.startsWith('http')
      ? novelPath
      : `${this.site}${novelPath}`;

    const html = await fetchText(fullUrl);
    const $ = loadCheerio(html);

    const title =
      $('.novel-title, h1.title, .novel-name, h1, .book-title')
        .first()
        .text()
        .trim() || 'Untitled';

    let cover =
      $('meta[property="og:image"]').attr('content') ||
      $('.novel-cover img, .fixed-img img, .novel-info img')
        .first()
        .attr('src') ||
      $('.novel-cover img, .fixed-img img, .novel-info img')
        .first()
        .attr('data-src') ||
      '';

    if (cover && !cover.startsWith('http')) {
      cover = `${this.site}${cover.replace(/^\//, '')}`;
    }

    let author =
      $('.author-name, .author a, .novel-info .author, a[href*="/author/"]')
        .first()
        .text()
        .trim() || '';

    author = author.replace(/^Author:\s*/i, '').trim();

    const genres: string[] = [];
    $('a[href*="/genre/"], .genre-item, .categories a').each((_, el) => {
      const g = $(el).text().trim();
      if (g && !genres.includes(g) && g.toLowerCase() !== 'all') {
        genres.push(g);
      }
    });

    const rawStatus = $(
      '.status-badge, .novel-status, .status-label, .status, .badge, .tag',
    )
      .text()
      .toLowerCase();

    let status = NovelStatus.Unknown;
    if (rawStatus.includes('ongoing')) status = NovelStatus.Ongoing;
    else if (rawStatus.includes('completed') || rawStatus.includes('complete'))
      status = NovelStatus.Completed;
    else if (rawStatus.includes('hiatus') || rawStatus.includes('paused'))
      status = NovelStatus.OnHiatus;

    const summaryContainer = $('.summary-content').first();
    const summaryParagraphs: string[] = [];

    summaryContainer.find('p').each((_, el) => {
      const pText = $(el).text().trim();
      if (!pText) return;

      if (pText.startsWith('–') || pText.startsWith('-')) {
        if (summaryParagraphs.length > 0) {
          summaryParagraphs[summaryParagraphs.length - 1] += ` ${pText}`;
        } else {
          summaryParagraphs.push(pText);
        }
      } else {
        summaryParagraphs.push(pText);
      }
    });

    let summary = '';
    if (summaryParagraphs.length > 0) {
      summary = summaryParagraphs.join('\n\n');
    } else {
      summary = summaryContainer.text().trim();
    }

    const novel: Plugin.SourceNovel = {
      path: novelPath,
      name: title,
      cover,
      author,
      status,
      genres: genres.join(', '),
      summary,
    };

    return novel;
  }

  async fetchAllChapters(slug: string): Promise<Plugin.ChapterItem[]> {
    let cleanSlug = slug.replace(/^\//, '').replace(/\/$/, '');
    if (cleanSlug.startsWith('novel/')) {
      cleanSlug = cleanSlug.replace(/^novel\//, '');
    }

    const LIMIT = 500;
    const apiBase = `${this.site}api/novel/${cleanSlug}/chapters/?limit=${LIMIT}`;

    const firstRes = await fetchApi(`${apiBase}&offset=0`);
    const firstJson = (await firstRes.json()) as {
      chapters: Array<{ number: number; title: string; display_name?: string }>;
      total_chapters: number;
    };

    const total = firstJson.total_chapters || firstJson.chapters.length;
    const allChapters: Plugin.ChapterItem[] = [];

    const offsets: number[] = [];
    for (let offset = LIMIT; offset < total; offset += LIMIT) {
      offsets.push(offset);
    }

    const remainingResults = await Promise.all(
      offsets.map(async offset => {
        try {
          const res = await fetchApi(`${apiBase}&offset=${offset}`);
          const json = (await res.json()) as {
            chapters: Array<{
              number: number;
              title: string;
              display_name?: string;
            }>;
          };
          return json.chapters || [];
        } catch {
          return [];
        }
      }),
    );

    const rawChapters = [...firstJson.chapters, ...remainingResults.flat()];

    for (const ch of rawChapters) {
      const num = ch.number;
      const name = (ch.title || `Chapter ${num}`).trim();
      allChapters.push({
        name,
        path: `novel/${cleanSlug}/chapter/${num}/`,
        chapterNumber: num,
      });
    }

    allChapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
    return allChapters;
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const fullUrl = chapterPath.startsWith('http')
      ? chapterPath
      : `${this.site}${chapterPath}`;

    const html = await fetchText(fullUrl);
    const $ = loadCheerio(html);

    const contentContainer = $(
      '#chapter-container, .chapter-content, .content, #content, .chapter-body',
    ).first();

    contentContainer
      .find(
        'script, style, ins, .ads, .ad-container, .adsbygoogle, .chapter-review, .restore-scroll',
      )
      .remove();

    return contentContainer.html() || '';
  }

  private parseNovelList(html: string): Plugin.NovelItem[] {
    const $ = loadCheerio(html);
    const novels: Plugin.NovelItem[] = [];

    $('.novel-item, .book-item, .novel-list .item').each((_, el) => {
      const $el = $(el);
      const $a = $el.find('a').first();
      const href = $a.attr('href');
      const title =
        $el.find('.novel-title, .title, h3, h4').first().text().trim() ||
        $a.attr('title') ||
        '';

      let cover =
        $el.find('img').first().attr('data-src') ||
        $el.find('img').first().attr('src') ||
        '';

      if (cover && !cover.startsWith('http')) {
        cover = `${this.site}${cover.replace(/^\//, '')}`;
      }

      if (title && href) {
        const path = href.replace(/^\//, '');
        novels.push({ name: title, path, cover });
      }
    });

    return novels;
  }

  filters = {
    order: {
      value: 'popular',
      label: 'Order by',
      options: [
        { label: 'Popular', value: 'popular' },
        { label: 'New', value: 'new' },
        { label: 'Updates', value: 'updates' },
      ],
      type: FilterTypes.Picker,
    },
    status: {
      value: 'all',
      label: 'Status',
      options: [
        { label: 'All', value: 'all' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
      ],
      type: FilterTypes.Picker,
    },
    genre: {
      value: 'all',
      label: 'Genre',
      options: [
        { label: 'All', value: 'all' },
        { label: 'Action', value: 'action' },
        { label: 'Adult', value: 'adult' },
        { label: 'Adventure', value: 'adventure' },
        { label: 'Anime', value: 'anime' },
        { label: 'Arts', value: 'arts' },
        { label: 'Comedy', value: 'comedy' },
        { label: 'Drama', value: 'drama' },
        { label: 'Eastern', value: 'eastern' },
        { label: 'Ecchi', value: 'ecchi' },
        { label: 'Fanfiction', value: 'fanfiction' },
        { label: 'Fantasy', value: 'fantasy' },
        { label: 'Harem', value: 'harem' },
        { label: 'Historical', value: 'historical' },
        { label: 'Horror', value: 'horror' },
        { label: 'Josei', value: 'josei' },
        { label: 'Magic', value: 'magic' },
        { label: 'Martial Arts', value: 'martial-arts' },
        { label: 'Mecha', value: 'mecha' },
        { label: 'Mystery', value: 'mystery' },
        { label: 'Psychological', value: 'psychological' },
        { label: 'Romance', value: 'romance' },
        { label: 'School Life', value: 'school-life' },
        { label: 'Sci-fi', value: 'sci-fi' },
        { label: 'Seinen', value: 'seinen' },
        { label: 'Shoujo', value: 'shoujo' },
        { label: 'Shoujo Ai', value: 'shoujo-ai' },
        { label: 'Shounen', value: 'shounen' },
        { label: 'Shounen Ai', value: 'shounen-ai' },
        { label: 'Slice of Life', value: 'slice-of-life' },
        { label: 'Smut', value: 'smut' },
        { label: 'Sports', value: 'sports' },
        { label: 'Supernatural', value: 'supernatural' },
        { label: 'Tragedy', value: 'tragedy' },
        { label: 'Wuxia', value: 'wuxia' },
        { label: 'Xianxia', value: 'xianxia' },
        { label: 'Xuanhuan', value: 'xuanhuan' },
        { label: 'Yaoi', value: 'yaoi' },
      ],
      type: FilterTypes.Picker,
    },
  };
}

export default new LightNovelWorldPlugin();
