import { fetchText } from '@libs/fetch';
import { Plugin } from '@typings/plugin';
import { load as parseHTML } from 'cheerio';
import { NovelStatus } from '@libs/novelStatus';

export class LightNovelWorldPlugin implements Plugin.PluginBase {
  id = 'lightnovelworld';
  name = 'LightNovelWorld';
  icon = 'src/en/lightnovelworld/icon.png';
  site = 'https://lightnovelworld.org';
  version = '1.0.0';

  async popularNovels(
    pageNo: number,
    options?: Plugin.PopularNovelsOptions,
  ): Promise<Plugin.NovelItem[]> {
    const page = Math.max(1, pageNo || 1);
    const category = options?.showLatestNovels ? 'latest' : 'popular';
    const url = `${this.site}/browse/${category}?page=${page}`;

    const body = await fetchText(url);
    return this.parseNovelList(body);
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const fullUrl = novelPath.startsWith('http')
      ? novelPath
      : `${this.site}${novelPath.startsWith('/') ? '' : '/'}${novelPath}`;

    const body = await fetchText(fullUrl);
    const $ = parseHTML(body);

    const title = $('.novel-title, h1.title, .novel-name, h1')
      .first()
      .text()
      .trim() || 'Untitled Novel';

    const imgEl = $('.cover img, .novel-cover img, .book-cover img, img.cover').first();
    const rawCover = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';
    const cover = rawCover.startsWith('http')
      ? rawCover
      : `${this.site}${rawCover.startsWith('/') ? '' : '/'}${rawCover}`;

    const summary = $('.summary .content, .description, .novel-summary, .summary-content, .synopsis')
      .first()
      .text()
      .trim() || '';

    let author = $('.author a, .novel-author, .author-name').first().text().trim();
    if (!author) {
      author = $('.author').text().replace(/^author:\s*/i, '').trim() || 'Unknown Author';
    }

    const rawStatus = $('.novel-status, .status-label, .status').first().text().trim().toLowerCase();
    let status = NovelStatus.Unknown;
    if (rawStatus.includes('ongoing')) {
      status = NovelStatus.Ongoing;
    } else if (rawStatus.includes('completed') || rawStatus.includes('complete')) {
      status = NovelStatus.Completed;
    } else if (rawStatus.includes('hiatus') || rawStatus.includes('paused')) {
      status = NovelStatus.OnHiatus;
    }

    const genres: string[] = [];
    $('.genres a, .categories a, .genre-item, .tags a').each((_, el) => {
      const g = $(el).text().trim();
      if (g && !genres.includes(g)) {
        genres.push(g);
      }
    });

    const chapters: Plugin.ChapterItem[] = [];
    let chapterEls = $('.chapter-list li, ul.chapters li, .chapter-item');
    if (chapterEls.length === 0) {
      chapterEls = $('.chapter-list a');
    }

    chapterEls.each((idx, el) => {
      const item = $(el);
      const linkEl = item.is('a') ? item : item.find('a').first();
      const chapName = linkEl.find('.chapter-title, .title, span.name').text().trim() || linkEl.text().trim();
      let chapPath = linkEl.attr('href') || '';

      if (chapPath.startsWith(this.site)) {
        chapPath = chapPath.substring(this.site.length);
      }

      const releaseTime = item.find('.chapter-time, .release-time, time, span.time').text().trim() || undefined;

      if (chapName && chapPath) {
        chapters.push({
          name: chapName,
          path: chapPath,
          releaseTime,
          chapterNumber: idx + 1,
        });
      }
    });

    return {
      path: novelPath,
      name: title,
      cover,
      summary,
      author,
      status,
      genres: genres.join(', '),
      chapters,
    };
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const fullUrl = chapterPath.startsWith('http')
      ? chapterPath
      : `${this.site}${chapterPath.startsWith('/') ? '' : '/'}${chapterPath}`;

    const body = await fetchText(fullUrl);
    const $ = parseHTML(body);

    const container = $('#chapter-container, .chapter-content, #chapter-body, .chapter-text, .chr-c, #chr-content').first();

    if (!container.length) {
      return '<p>No content found.</p>';
    }

    // Clean up unwanted elements
    container
      .find('script, style, ins, .ads, .ad-container, .ad-wrapper, .watermark, #ad-banner, iframe, .ad-box, .pub-ad')
      .remove();

    // Strip inline listeners and style attributes
    container.find('*').each((_, el) => {
      const attribs = (el as any).attribs || {};
      for (const attr of Object.keys(attribs)) {
        if (attr.startsWith('on') || attr === 'style') {
          $(el).removeAttr(attr);
        }
      }
    });

    const cleanHtml = container.html()?.trim() || '<p>No content found.</p>';
    return cleanHtml.replace(/[\u200B-\u200D\uFEFF]/g, '');
  }

  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    if (!searchTerm || !searchTerm.trim()) {
      return [];
    }
    const page = Math.max(1, pageNo || 1);
    const url = `${this.site}/search?q=${encodeURIComponent(searchTerm.trim())}&page=${page}`;

    const body = await fetchText(url);
    return this.parseNovelList(body);
  }

  private parseNovelList(html: string): Plugin.NovelItem[] {
    const $ = parseHTML(html);
    const novels: Plugin.NovelItem[] = [];

    const items = $('.novel-item, .novel-card, .novel-list li, .novel-item-item');

    items.each((_, el) => {
      const item = $(el);
      const titleEl = item.find('.novel-title, .title, h3.title a, .novel-name, a.novel-title').first();
      const linkEl = item.find("a[href*='/novel/']").first();
      const imgEl = item.find('img.cover, img.novel-cover, img').first();

      const name = titleEl.text().trim() || linkEl.attr('title')?.trim() || linkEl.text().trim();
      let rawPath = linkEl.attr('href') || titleEl.attr('href') || '';
      const rawCover = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';

      if (name && rawPath) {
        if (rawPath.startsWith(this.site)) {
          rawPath = rawPath.substring(this.site.length);
        }

        const cover = rawCover.startsWith('http')
          ? rawCover
          : `${this.site}${rawCover.startsWith('/') ? '' : '/'}${rawCover}`;

        novels.push({
          name,
          cover,
          path: rawPath,
        });
      }
    });

    return novels;
  }
}

export default new LightNovelWorldPlugin();
