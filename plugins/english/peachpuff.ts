import { Plugin } from '@/types/plugin';
import { fetchApi } from '@libs/fetch';
import { CheerioAPI, load as parseHTML } from 'cheerio';

class PeachPuffTranslations implements Plugin.PluginBase {
  id = 'peachpuff';
  name = 'Peach Puff Translations';
  site = 'https://peachpuff.in/';
  version = '1.0.1';
  icon = 'src/english/peachpuff/icon.png';

  coversCache?: Map<string, string>;

  /**
   * Covers are served through Jetpack's image CDN with resize query params
   * (https://i0.wp.com/peachpuff.in/...?resize=200%2C266&ssl=1); drop the CDN
   * prefix and the query string to get the origin URL.
   */
  cleanCover(src?: string): string | undefined {
    if (!src) return undefined;
    return src
      .replace('i0.wp.com/', '')
      .replace(/^http:/, 'https:')
      .split('?')[0];
  }

  /** Absolute hrefs from the site become site-relative paths. */
  novelPath(href: string | undefined): string | undefined {
    if (!href) return undefined;
    return href.replace(this.site, '').replace(/\/+$/, '');
  }

  /**
   * Novel covers are only reachable from each novel page, but WordPress's
   * REST API maps every attached media item to its parent page in one call —
   * fetch pages + media and join them on the post id. The homepage lists are
   * plain links, so without this the browse/search screens have no covers.
   */
  async getNovelCovers(): Promise<Map<string, string>> {
    if (this.coversCache) return this.coversCache;
    const covers = new Map<string, string>();
    try {
      const [pages, media] = await Promise.all([
        fetchApi(
          `${this.site}wp-json/wp/v2/pages?per_page=100&_fields=id,link`,
        ).then(res => res.json()),
        fetchApi(
          `${this.site}wp-json/wp/v2/media?per_page=100&_fields=id,post,source_url`,
        ).then(res => res.json()),
      ]);
      const pageLinks = new Map(
        (pages as { id: number; link: string }[]).map(page => [
          page.id,
          page.link,
        ]),
      );
      // First (oldest) attached image per post is the cover.
      const mediaItems = media as {
        id: number;
        post?: number;
        source_url: string;
      }[];
      mediaItems.sort((a, b) => a.id - b.id);
      for (const item of mediaItems) {
        const path = item.post
          ? this.novelPath(pageLinks.get(item.post))
          : undefined;
        if (path && !covers.has(path)) covers.set(path, item.source_url);
      }
    } catch {
      // wp-json unreachable — browse/search fall back to cover-less items.
    }
    this.coversCache = covers;
    return covers;
  }

  /** Every novel is a plain link in the homepage's status-grouped lists. */
  parseNovels(loadedCheerio: CheerioAPI): Plugin.NovelItem[] {
    const novels: Plugin.NovelItem[] = [];
    loadedCheerio('ul.wp-block-list li a[title]').each((_, element) => {
      const path = this.novelPath(loadedCheerio(element).attr('href'));
      if (!path) return;
      const name =
        loadedCheerio(element).attr('title') ||
        loadedCheerio(element).text().trim();
      novels.push({ name, path });
    });
    return novels;
  }

  // No dedicated browse page exists; the homepage lists every novel grouped
  // by status (Ongoing / Completed / Dropped) in plain link lists.
  async popularNovels(): Promise<Plugin.NovelItem[]> {
    const body = await fetchApi(this.site).then(res => res.text());
    const novels = this.parseNovels(parseHTML(body));
    const covers = await this.getNovelCovers();
    for (const novel of novels) novel.cover = covers.get(novel.path);
    return novels;
  }

  async searchNovels(searchTerm: string): Promise<Plugin.NovelItem[]> {
    // WP search also returns static pages and chapter posts, so filter the
    // canonical homepage list instead.
    const query = searchTerm.toLowerCase();
    return (await this.popularNovels()).filter(novel =>
      novel.name.toLowerCase().includes(query),
    );
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const body = await fetchApi(this.site + novelPath).then(res => res.text());
    const loadedCheerio = parseHTML(body);

    const novel: Plugin.SourceNovel = {
      path: novelPath,
      name: loadedCheerio('div.entry-title h2').first().text().trim(),
    };

    novel.cover = this.cleanCover(
      loadedCheerio('figure.wp-block-image img').first().attr('src'),
    );

    // Title/Author/Total Chapters live in one paragraph as <strong> labels.
    loadedCheerio('p.wp-block-paragraph strong').each((_, element) => {
      const key = loadedCheerio(element).text().trim().toLowerCase();
      if (key === 'author:') {
        novel.author = loadedCheerio(element).nextUntil('strong').text().trim();
      }
    });

    // Synopsis sits between the "Description:" label and the TOC heading.
    // Keep the site's paragraph breaks: one blank line between paragraphs,
    // and honor <br> within a paragraph.
    const descriptionLabel = loadedCheerio(
      'p.wp-block-paragraph strong:contains("Description:")',
    ).first();
    if (descriptionLabel.length) {
      const summary = descriptionLabel
        .parent()
        .nextUntil('h4.wp-block-heading')
        .map((_, element) => {
          const paragraph = loadedCheerio(element);
          paragraph.find('br').replaceWith('\n');
          return paragraph.text().trim();
        })
        .get()
        .filter(Boolean)
        .join('\n\n');
      if (summary) novel.summary = summary;
    }

    // All chapters are on the novel page in one list.
    const chapters: Plugin.ChapterItem[] = [];
    loadedCheerio('.lcp_catlist li a').each((_, element) => {
      const path = this.novelPath(loadedCheerio(element).attr('href'));
      if (!path) return;
      chapters.push({
        name: loadedCheerio(element).text().trim(),
        path,
      });
    });
    novel.chapters = chapters;

    return novel;
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const body = await fetchApi(this.site + chapterPath).then(res =>
      res.text(),
    );
    const loadedCheerio = parseHTML(body);
    // Prev/TOC/Next buttons render inside the content container; they are
    // navigation, not chapter content.
    loadedCheerio('.category-post-dropdown-container').remove();
    loadedCheerio('script, style').remove();

    return loadedCheerio('.entry-content').html() ?? '';
  }
}

export default new PeachPuffTranslations();
