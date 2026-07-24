import { fetchText, fetchApi } from '@libs/fetch';
import { load as loadCheerio } from 'cheerio';
import { Plugin } from '@typings/plugin';
import { NovelStatus } from '@libs/novelStatus';
import { Filters, FilterTypes } from '@libs/filterInputs';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export class NovelPhoenixPlugin implements Plugin.PluginBase {
  id = 'novelphoenix';
  name = 'Novel Phoenix';
  icon = 'src/en/novelphoenix/icon.png';
  site = 'https://novelphoenix.com/';
  version = '2.0.1';

  async popularNovels(
    pageNo: number,
    {
      showLatestNovels,
      filters,
    }: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    const page = Math.max(1, pageNo || 1);
    const genre = filters?.genre?.value || 'all';
    const status = filters?.status?.value || 'all';
    const order = showLatestNovels
      ? 'sort-new'
      : filters?.order?.value || 'sort-popular';

    const url = `${this.site}genre-${genre}/${order}/status-${status}/all-novel?page=${page}`;
    const html = await fetchText(url, { headers: { 'User-Agent': USER_AGENT } });
    return this.parseNovelList(html);
  }

  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    if (pageNo > 1) return [];

    const url = `${this.site}ajax/searchLive?keyword=${encodeURIComponent(searchTerm)}`;
    const res = await fetchApi(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const json = (await res.json()) as {
      data?: Array<{
        title: string;
        slug: string;
        image?: string;
      }>;
    };

    const items: Plugin.NovelItem[] = [];
    if (json && Array.isArray(json.data)) {
      for (const item of json.data) {
        if (!item.title || !item.slug) continue;
        let cover = item.image || '';
        if (cover && !cover.startsWith('http')) {
          cover = cover.startsWith('/')
            ? `${this.site}${cover.replace(/^\//, '')}`
            : `${this.site}cover/${cover}`;
        }
        items.push({
          name: item.title,
          path: `novel/${item.slug}`,
          cover,
        });
      }
    }

    return items;
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    let cleanPath = novelPath.replace(/^\//, '');
    if (!cleanPath.endsWith('/')) cleanPath += '/';

    const fullUrl = cleanPath.startsWith('http')
      ? cleanPath
      : `${this.site}${cleanPath}`;

    const html = await fetchText(fullUrl, { headers: { 'User-Agent': USER_AGENT } });
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
      '.status-name, .status, .novel-info .status, .badge, .tag',
    )
      .text()
      .toLowerCase();

    let status = NovelStatus.Unknown;
    if (rawStatus.includes('ongoing')) status = NovelStatus.Ongoing;
    else if (rawStatus.includes('completed') || rawStatus.includes('complete'))
      status = NovelStatus.Completed;
    else if (rawStatus.includes('hiatus') || rawStatus.includes('paused'))
      status = NovelStatus.OnHiatus;

    const summaryParagraphs: string[] = [];
    $('.summary-content p, .description p, .summary p').each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        summaryParagraphs.push(text);
      }
    });

    let summary = '';
    if (summaryParagraphs.length > 0) {
      summary = summaryParagraphs.join('\n\n');
    } else {
      summary = $(
        '.summary-content, .description, .novel-detail, .summary',
      )
        .first()
        .text()
        .trim();
    }

    const chapters = await this.fetchAllChapters(novelPath);

    const novel: Plugin.SourceNovel = {
      path: cleanPath,
      name: title,
      cover,
      author,
      status,
      genres: genres.join(', '),
      summary,
      chapters,
    };

    return novel;
  }

  async fetchAllChapters(slug: string): Promise<Plugin.ChapterItem[]> {
    let cleanSlug = slug.replace(/^\//, '').replace(/\/$/, '');
    if (cleanSlug.startsWith('http')) {
      cleanSlug = cleanSlug.replace(/^https?:\/\/[^\/]+\//, '');
    }
    cleanSlug = cleanSlug.replace(/^\//, '').replace(/\/$/, '');
    if (cleanSlug.startsWith('novel/')) {
      cleanSlug = cleanSlug.replace(/^novel\//, '');
    }

    const baseUrl = `${this.site}novel/${cleanSlug}/chapters`;
    const firstHtml = await fetchText(`${baseUrl}?page=1`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    let $first = loadCheerio(firstHtml);

    let firstChapters = this.parseChapterLinks($first);

    if (firstChapters.length === 0) {
      const mainHtml = await fetchText(`${this.site}novel/${cleanSlug}`, {
        headers: { 'User-Agent': USER_AGENT },
      });
      $first = loadCheerio(mainHtml);
      firstChapters = this.parseChapterLinks($first);
    }

    let maxPage = 1;
    $first('.pagination a, ul.pagination li a, a[href*="page="]').each(
      (_, el) => {
        const href = $first(el).attr('href') || '';
        const m = href.match(/page=(\d+)/i);
        if (m) {
          const p = parseInt(m[1], 10);
          if (p > maxPage) maxPage = p;
        }
      },
    );

    if (maxPage <= 1) {
      return this.deduplicateChapters(firstChapters);
    }

    const pagesToFetch: number[] = [];
    for (let p = 2; p <= maxPage; p++) {
      pagesToFetch.push(p);
    }

    const BATCH_SIZE = 2;
    const remainingChapters: Plugin.ChapterItem[] = [];

    for (let i = 0; i < pagesToFetch.length; i += BATCH_SIZE) {
      const batch = pagesToFetch.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async page => {
          try {
            const html = await fetchText(`${baseUrl}?page=${page}`, {
              headers: { 'User-Agent': USER_AGENT },
            });
            const $ = loadCheerio(html);
            return this.parseChapterLinks($);
          } catch {
            return [];
          }
        }),
      );
      remainingChapters.push(...batchResults.flat());
      if (i + BATCH_SIZE < pagesToFetch.length) {
        await new Promise(res => setTimeout(res, 50));
      }
    }

    const rawAll = [...firstChapters, ...remainingChapters];
    return this.deduplicateChapters(rawAll);
  }

  async parseChapter(chapterPath: string): Promise<string> {
    let cleanPath = chapterPath.replace(/^\//, '');
    const fullUrl = cleanPath.startsWith('http')
      ? cleanPath
      : `${this.site}${cleanPath}`;

    const html = await fetchText(fullUrl, {
      headers: { 'User-Agent': USER_AGENT },
    });
    const $ = loadCheerio(html);

    const contentContainer = $(
      '#chapter-container, .chapter-content, .content, #content, .chapter-body',
    ).first();

    contentContainer
      .find(
        'script, style, ins, .ads, .ad-container, .adsbygoogle, .chapter-review, .restore-scroll',
      )
      .remove();

    const chapterText = contentContainer.html() || '';
    return chapterText;
  }

  private parseChapterLinks($: returnType<typeof loadCheerio>): Plugin.ChapterItem[] {
    const chapters: Plugin.ChapterItem[] = [];

    const links = $('.chapter-list a[href*="/chapter-"], .list-chapter a[href*="/chapter-"]');
    const targetLinks = links.length > 0 ? links : $('a[href*="/chapter-"]');

    targetLinks.each((i, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      if (!href) return;

      const cleanHref = href.replace(/^\//, '');
      const numMatch = cleanHref.match(/chapter-(\d+)/i);
      const chapterNumber = numMatch ? parseInt(numMatch[1], 10) : i + 1;

      let name =
        $el.find('.chapter-title, .title').text().trim() ||
        $el.text().trim();

      name = name.replace(/\s*\d+\s*(years?|months?|days?|hours?|mins?|minutes?)\s*ago\s*$/i, '').trim();
      name = name.replace(/^\d+/, '').trim();
      if (!name) name = `Chapter ${chapterNumber}`;

      chapters.push({
        name,
        path: cleanHref,
        chapterNumber,
      });
    });

    return chapters;
  }

  private deduplicateChapters(rawChapters: Plugin.ChapterItem[]): Plugin.ChapterItem[] {
    rawChapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
    const seenPaths = new Set<string>();
    const cleanChapters: Plugin.ChapterItem[] = [];

    for (const ch of rawChapters) {
      if (!seenPaths.has(ch.path)) {
        seenPaths.add(ch.path);
        cleanChapters.push(ch);
      }
    }

    return cleanChapters;
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
        let path = href.replace(/^\//, '');
        novels.push({
          name: title,
          path,
          cover,
        });
      }
    });

    return novels;
  }

  filters = {
    order: {
      value: 'sort-popular',
      label: 'Order by',
      options: [
        { label: 'Popular', value: 'sort-popular' },
        { label: 'New', value: 'sort-new' },
        { label: 'Updates', value: 'sort-update' },
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

export default new NovelPhoenixPlugin();
