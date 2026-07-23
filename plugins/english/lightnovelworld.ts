import { fetchText, fetchApi } from '@libs/fetch';
import { load as loadCheerio } from 'cheerio';
import { Plugin } from '@typings/plugin';
import { NovelStatus } from '@libs/novelStatus';

export class LightNovelWorldPlugin implements Plugin.PluginBase {
    id = "lightnovelworld";
    name = "LightNovelWorld";
    icon = "src/en/lightnovelworld/icon.png";
    site = "https://lightnovelworld.org/";
    version = "1.1.6";

    async popularNovels(
        pageNo: number,
        options?: Plugin.PopularNovelsOptions
    ): Promise<Plugin.NovelItem[]> {
        const page = Math.max(1, pageNo || 1);
        const order = (options && options.showLatestNovels) ? 'updates' : 'popular';
        const url = `${this.site}genre-all/?order=${order}&page=${page}`;
        const html = await fetchText(url);
        return this.parseNovelList(html);
    }

    /**
     * Chapter list API returns:
     * - title: full chapter name
     * - display_name: UI-truncated name with trailing "..."
     * Always prefer title (same idea as NovelFire's a[title]).
     */
    async fetchAllChapters(slug: string): Promise<Plugin.ChapterItem[]> {
        // JSON API — up to 500 chapters per call, faster than HTML scraping
        const LIMIT = 500;
        const apiBase = `${this.site}api/novel/${slug}/chapters/?limit=${LIMIT}`;

        // Fetch page 0 to learn total_chapters
        const firstRes = await fetchApi(`${apiBase}&offset=0`);
        const firstJson = await firstRes.json() as {
            chapters: Array<{ number: number; title: string; display_name?: string }>;
            total_chapters: number;
            has_more: boolean;
        };

        const total = firstJson.total_chapters || firstJson.chapters.length;
        const allChapters: Plugin.ChapterItem[] = [];

        // Queue remaining offsets and fetch all in parallel
        const offsets: number[] = [];
        for (let offset = LIMIT; offset < total; offset += LIMIT) {
            offsets.push(offset);
        }

        const remainingResults = await Promise.all(
            offsets.map(async (offset) => {
                try {
                    const res = await fetchApi(`${apiBase}&offset=${offset}`);
                    const json = await res.json() as {
                        chapters: Array<{ number: number; title: string; display_name?: string }>;
                    };
                    return json.chapters || [];
                } catch (err) {
                    console.error(`Failed to fetch chapters at offset ${offset}:`, err);
                    return [];
                }
            })
        );

        // Merge first page + remaining, convert to ChapterItem[]
        const rawChapters = [
            ...firstJson.chapters,
            ...remainingResults.flat(),
        ];

        for (const ch of rawChapters) {
            const num = ch.number;
            // Never use display_name when title is present — display_name ends with "..."
            const name = (ch.title || `Chapter ${num}`).trim();
            allChapters.push({
                name,
                path: `novel/${slug}/chapter/${num}/`,
                chapterNumber: num,
            });
        }

        // Sort ascending by chapter number
        allChapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
        return allChapters;
    }

    async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
        // Normalise: no leading slash (site ends with '/'), must end with '/'
        let cleanPath = novelPath.replace(/^\//, '');
        if (!cleanPath.endsWith('/')) cleanPath += '/';

        const fullUrl = cleanPath.startsWith('http')
            ? cleanPath
            : `${this.site}${cleanPath}`;

        const html = await fetchText(fullUrl);
        const $ = loadCheerio(html);

        const title = $('.novel-title, h1.title, .novel-name, h1, .book-title').first().text().trim() || 'Untitled Novel';

        const imgEl = $('.cover img, .novel-cover img, .book-cover img, img.cover, .card-cover img, .novel-cover-container img').first();
        const rawCover = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';
        const cover = rawCover ? new URL(rawCover, this.site).href : '';

        const summaryEl = $('.summary-content, .novel-summary, .synopsis, .summary .content').first();
        summaryEl.find('br').replaceWith('\n');
        const paragraphs = summaryEl.find('p').map((_, el) => $(el).text().trim()).get().filter(Boolean);
        let summary = '';
        if (paragraphs.length > 0) {
            for (const p of paragraphs) {
                if (summary && (p.startsWith('–') || p.startsWith('-'))) {
                    summary += ' ' + p;
                } else {
                    summary += (summary ? '\n\n' : '') + p;
                }
            }
        } else {
            summary = summaryEl.text().trim();
        }

        const author = $('.author a, .novel-author a, .author-name, .novel-author').first().text().trim() || 'Unknown Author';
        const rawStatus = $('.status-badge, .novel-status, .status-label, .status').first().text().trim().toLowerCase();
        let status = NovelStatus.Unknown;
        if (rawStatus.includes('ongoing')) status = NovelStatus.Ongoing;
        else if (rawStatus.includes('completed') || rawStatus.includes('complete')) status = NovelStatus.Completed;
        else if (rawStatus.includes('hiatus') || rawStatus.includes('paused')) status = NovelStatus.OnHiatus;

        const genres: string[] = [];
        $('.genres a, .categories a, .genre-item, .tags a, .genre-tag').each((_, el) => {
            const g = $(el).text().trim();
            if (g && !genres.includes(g)) {
                genres.push(g);
            }
        });

        // Extract clean slug (e.g. shadow-slave)
        const slug = cleanPath.replace(/^novel\//, '').replace(/\/$/, '');
        let chapters: Plugin.ChapterItem[] = [];

        if (slug) {
            try {
                chapters = await this.fetchAllChapters(slug);
            } catch (error) {
                console.error('Failed to fetch chapter list:', error);
            }
        }

        return {
            path: cleanPath,
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
        const cleanChapPath = chapterPath.replace(/^\//, '');
        const fullUrl = cleanChapPath.startsWith('http')
            ? cleanChapPath
            : `${this.site}${cleanChapPath}`;

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
        const url = `${this.site}api/search/?q=${encodeURIComponent(searchTerm.trim())}`;
        try {
            const res = await fetchApi(url);
            const json = await res.json() as { novels?: Array<any> };
            if (!json || !Array.isArray(json.novels)) {
                return [];
            }
            return json.novels.map((item: any) => {
                const rawCover = item.cover_path || '';
                const cover = rawCover ? new URL(rawCover, this.site).href : '';
                
                const slug = item.slug || '';
                const path = slug ? `novel/${slug}/` : '';

                return {
                    name: item.title || 'Untitled',
                    cover,
                    path,
                };
            }).filter((item: Plugin.NovelItem) => !!item.path && !!item.name);
        } catch {
            return [];
        }
    }

    parseNovelList(html: string): Plugin.NovelItem[] {
        const $ = loadCheerio(html);
        const novels: Plugin.NovelItem[] = [];
        const seen = new Set<string>();

        $('.ranking-card, .recommendation-card, .boost-shelf-card, .novel-item, .novel-card').each((_, el) => {
            const item = $(el);
            const linkEl = item.is('a[href*="/novel/"]')
                ? item
                : item.find("a[href*='/novel/']").first();
            let rawPath = linkEl.attr('href') || item.find('a.card-link').attr('href') || '';

            if (!rawPath) return;

            // Prefer full name from attributes (NovelFire-style), then visible text
            const titleEl = item.find('.card-title, .novel-title, .boost-shelf-title, .title, h3').first();
            const name =
                linkEl.attr('title')?.trim() ||
                item.find('a[title]').first().attr('title')?.trim() ||
                item.find('img[alt]').first().attr('alt')?.trim() ||
                titleEl.text().trim() ||
                '';

            const imgEl = item.find('img.skel-img, .card-cover img, img').first();
            const rawCover =
                imgEl.attr('src') ||
                imgEl.attr('data-src') ||
                imgEl.attr('data-lazy-src') ||
                item.find('[data-bg-image]').attr('data-bg-image') ||
                '';

            if (name && rawPath) {
                // Strip leading slash — site already ends with '/'
                let cleanPath = rawPath.startsWith('http') ? new URL(rawPath).pathname : rawPath;
                cleanPath = cleanPath.replace(/^\//, '');
                if (!cleanPath.endsWith('/')) cleanPath += '/';
                if (seen.has(cleanPath)) return;
                seen.add(cleanPath);

                const cover = rawCover ? new URL(rawCover, this.site).href : '';

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
