import { Plugin } from '@/types/plugin';
import { fetchApi } from '@libs/fetch';
import { CheerioAPI, load as parseHTML } from 'cheerio';

class PeachPuffTranslations implements Plugin.PluginBase {
  id = 'peachpuff';
  name = 'Peach Puff Translations';
  site = 'https://peachpuff.in/';
  version = '1.0.0';
  icon = 'src/english/peachpuff/icon.png';

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
    return this.parseNovels(parseHTML(body));
  }

  async searchNovels(searchTerm: string): Promise<Plugin.NovelItem[]> {
    // WP search also returns static pages and chapter posts, so filter the
    // canonical homepage list instead.
    const body = await fetchApi(this.site).then(res => res.text());
    const query = searchTerm.toLowerCase();
    return this.parseNovels(parseHTML(body)).filter(novel =>
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
    const descriptionLabel = loadedCheerio(
      'p.wp-block-paragraph strong:contains("Description:")',
    ).first();
    if (descriptionLabel.length) {
      const summary = descriptionLabel
        .parent()
        .nextUntil('h4.wp-block-heading')
        .map((_, element) => loadedCheerio(element).text().trim())
        .get()
        .filter(Boolean)
        .join('\n');
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
