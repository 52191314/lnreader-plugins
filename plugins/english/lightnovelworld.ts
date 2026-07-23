import { fetchText } from '@libs/fetch';
import { load as loadCheerio } from 'cheerio';
import { Plugin } from '@typings/plugin';
import { NovelStatus } from '@libs/novelStatus';

export class LightNovelWorldPlugin implements Plugin.PluginBase {
    id = "lightnovelworld";
    name = "LightNovelWorld";
    icon = "src/en/lightnovelworld/icon.png";
    site = "https://lightnovelworld.org";
    version = "1.0.1";

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
        const fullUrl = novelPath.startsWith('http') 
            ? novelPath 
            : `${this.site}${novelPath.startsWith('/') ? '' : '/'}${novelPath}`;

        const html = await fetchText(fullUrl);
        const $ = loadCheerio(html);

        const title = $('.novel-title, h1.title, .novel-name, h1, .book-title').first().text().trim() || 'Untitled Novel';

        const imgEl = $('.cover img, .novel-cover img, .book-cover img, img.cover, .card-cover img').first();
        const rawCover = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';
        const cover = rawCover.startsWith('http') 
            ? rawCover 
            : `${this.site}${rawCover.startsWith('/') ? '' : '/'}${rawCover}`;

        const summary = $('.summary .content, .description, .novel-summary, .summary-content, .synopsis, .novel-desc').first().text().trim() || '';

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
        $('.genres a, .categories a, .genre-item, .tags a, .genre-pill').each((_, el) => {
            const g = $(el).text().trim();
            if (g && !genres.includes(g)) {
                genres.push(g);
            }
        });

        const chapters: Plugin.ChapterItem[] = [];
        let chapterEls = $('.chapter-list li, ul.chapters li, .chapter-item');
        if (chapterEls.length === 0) {
            chapterEls = $('.chapter-list a, .chapters-list a');
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

        const html = await fetchText(fullUrl);
        const $ = loadCheerio(html);

        const container = $('#chapter-container, .chapter-content, #chapter-body, .chapter-text, .chr-c, #chr-content').first();
        if (!container.length) {
            return '<p>No content found.</p>';
        }

        container.find('script, style, ins, .ads, .ad-container, .ad-wrapper, .watermark, #ad-banner, iframe, .ad-box, .pub-ad').remove();
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
