import { fetchText } from '@libs/fetch';
import { load as loadCheerio } from 'cheerio';
import { Plugin } from '@typings/plugin';
import { NovelStatus } from '@libs/novelStatus';

export class LightNovelWorldPlugin implements Plugin.PluginBase {
    id = "lightnovelworld";
    name = "LightNovelWorld";
    icon = "src/en/lightnovelworld/icon.png";
    site = "https://lightnovelworld.org";
    version = "1.0.2";

    async popularNovels(
        pageNo: number,
        options?: Plugin.PopularNovelsOptions
    ): Promise<Plugin.NovelItem[]> {
        const page = Math.max(1, pageNo || 1);
        const order = (options && options.showLatestNovels) ? 'updates' : 'popular';
        const url = `${this.site}/genre-all/?order=${order}&page=${page}`;
        const html = await fetchText(url);
        return this.parseNovelList(html);
    }

    async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
        const cleanPath = novelPath.endsWith('/') ? novelPath : `${novelPath}/`;
        const fullUrl = cleanPath.startsWith('http') 
            ? cleanPath 
            : `${this.site}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;

        const html = await fetchText(fullUrl);
        const $ = loadCheerio(html);

        const title = $('.novel-title, h1.title, .novel-name, h1, .book-title').first().text().trim() || 'Untitled Novel';

        const imgEl = $('.cover img, .novel-cover img, .book-cover img, img.cover, .card-cover img, .novel-cover-container img').first();
        const rawCover = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';
        const cover = rawCover.startsWith('http') 
            ? rawCover 
            : `${this.site}${rawCover.startsWith('/') ? '' : '/'}${rawCover}`;

        const summary = $('.summary-content, .summary .content, .description, .novel-summary, .synopsis, .novel-description').first().text().trim() || '';

        let author = $('.author a, .novel-author a, .author-name, .novel-author').first().text().trim();
        if (!author) {
            author = $('.novel-author').text().replace(/^author:\s*/i, '').trim() || 'Unknown Author';
        }

        const rawStatus = $('.status-badge, .novel-status, .status-label, .status').first().text().trim().toLowerCase();
        let status = NovelStatus.Unknown;
        if (rawStatus.includes('ongoing')) {
            status = NovelStatus.Ongoing;
        } else if (rawStatus.includes('completed') || rawStatus.includes('complete')) {
            status = NovelStatus.Completed;
        } else if (rawStatus.includes('hiatus') || rawStatus.includes('paused')) {
            status = NovelStatus.OnHiatus;
        }

        const genres: string[] = [];
        $('.genres a, .categories a, .genre-item, .tags a, .genre-tag').each((_, el) => {
            const g = $(el).text().trim();
            if (g && !genres.includes(g)) {
                genres.push(g);
            }
        });

        // Fetch dedicated chapters list page (/novel/name/chapters/)
        const chaptersUrl = `${fullUrl.replace(/\/$/, '')}/chapters/`;
        const chaptersHtml = await fetchText(chaptersUrl);
        const $chap = loadCheerio(chaptersHtml);

        const chapters: Plugin.ChapterItem[] = [];

        $chap('.chapter-card, .chapter-item, .chapter-list li').each((idx, el) => {
            const item = $chap(el);
            const titleText = item.find('.chapter-title, h3, .title, span.name').text().trim() || item.text().trim();
            const onClickAttr = item.attr('onclick') || '';
            const matchPath = onClickAttr.match(/'([^']+)'/);

            let chapPath = matchPath ? matchPath[1] : (item.is('a') ? item.attr('href') : item.find('a').first().attr('href')) || '';
            if (chapPath.startsWith(this.site)) {
                chapPath = chapPath.substring(this.site.length);
            }
            const releaseTime = item.find('.chapter-time, .release-time, time, span.time, p.chapter-time').text().trim() || undefined;

            if (titleText && chapPath) {
                chapters.push({
                    name: titleText,
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

        const html = await fetchText(fullUrl);
        const $ = loadCheerio(html);

        const container = $('#chapterText, .chapter-text, #chapter-container, .chapter-content, #chapter-body, .chr-c, #chr-content').first();
        if (!container.length) {
            return '<p>No content found.</p>';
        }

        container.find('script, style, ins, .ads, .ad-container, .ad-wrapper, .watermark, #ad-banner, iframe, .ad-box, .pub-ad, .chapter-ad-container').remove();
        container.find('*').each((_, el) => {
            const attribs = el.attribs || {};
            for (const attr in attribs) {
                if (attr.startsWith('on') || attr === 'style') {
                    $(el).removeAttr(attr);
                }
            }
        });

        const content = container.html()?.trim() || '<p>No content found.</p>';
        return content.replace(/[\u200B-\u200D\uFEFF]/g, '');
    }

    async searchNovels(
        searchTerm: string,
        pageNo: number
    ): Promise<Plugin.NovelItem[]> {
        if (!searchTerm || !searchTerm.trim()) return [];
        const page = Math.max(1, pageNo || 1);
        const url = `${this.site}/search/?q=${encodeURIComponent(searchTerm.trim())}&page=${page}`;
        const html = await fetchText(url);
        return this.parseNovelList(html);
    }

    parseNovelList(html: string): Plugin.NovelItem[] {
        const $ = loadCheerio(html);
        const novels: Plugin.NovelItem[] = [];

        $('.recommendation-card, .boost-shelf-card, .novel-item, .novel-card').each((_, el) => {
            const item = $(el);
            const linkEl = item.find("a[href*='/novel/']").first();
            const rawPath = linkEl.attr('href') || '';
            const titleEl = item.find('.card-title, .novel-title, .title, h3').first();
            const name = titleEl.text().trim() || linkEl.attr('title') || '';

            const imgEl = item.find('img.skel-img, .card-cover img, img').first();
            const rawCover = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';

            if (name && rawPath) {
                let cleanPath = rawPath;
                if (cleanPath.startsWith(this.site)) {
                    cleanPath = cleanPath.substring(this.site.length);
                }
                const cover = rawCover.startsWith('http') 
                    ? rawCover 
                    : `${this.site}${rawCover.startsWith('/') ? '' : '/'}${rawCover}`;

                novels.push({
                    name,
                    cover,
                    path: cleanPath,
                });
            }
        });

        return novels;
    }
}

export default new LightNovelWorldPlugin();
