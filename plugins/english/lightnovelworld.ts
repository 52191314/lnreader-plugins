import { fetchText, fetchApi } from '@libs/fetch';
import { load as loadCheerio } from 'cheerio';
import { Plugin } from '@typings/plugin';
import { NovelStatus } from '@libs/novelStatus';

export class LightNovelWorldPlugin implements Plugin.PluginBase {
    id = "lightnovelworld";
    name = "LightNovelWorld";
    icon = "src/en/lightnovelworld/icon.png";
    site = "https://lightnovelworld.org/";
    version = "1.1.4";

    async popularNovels(
        pageNo: number,
        options?: Plugin.PopularNovelsOptions
    ): Promise<Plugin.NovelItem[]> {
        const order = (options && options.showLatestNovels) ? 'updates' : 'popular';
        const url = `${this.site}genre-all/?order=${order}&page=${pageNo}`;
        const html = await fetchText(url);
        return this.parseNovelList(html);
    }

    async fetchAllChapters(slug: string): Promise<Plugin.ChapterItem[]> {
        const LIMIT = 500;
        const apiBase = `${this.site}api/novel/${slug}/chapters/?limit=${LIMIT}`;

        const firstRes = await fetchApi(`${apiBase}&offset=0`);
        const firstJson = await firstRes.json() as {
            chapters: Array<{ number: number; title: string; display_name?: string }>;
            total_chapters: number;
            has_more: boolean;
        };

        const total = firstJson.total_chapters || firstJson.chapters.length;
        const allChapters: Plugin.ChapterItem[] = [];

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
                } catch {
                    return [];
                }
            })
        );

        const rawChapters = [
            ...firstJson.chapters,
            ...remainingResults.flat(),
        ];

        for (const ch of rawChapters) {
            const num = ch.number;
            const name = (ch.title || `Chapter ${num}`).trim();
            allChapters.push({
                name,
                path: `novel/${slug}/chapter/${num}/`,
                chapterNumber: num,
            });
        }

        allChapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
        return allChapters;
    }

    async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
        const html = await fetchText(`${this.site}${novelPath}`);
        const $ = loadCheerio(html);

        const title = $('.novel-title').text().trim() || 'Untitled Novel';

        const rawCover = $('.novel-cover img').attr('src') || $('.novel-cover img').attr('data-src') || '';
        const cover = rawCover ? `${this.site}${rawCover.replace(/^\//, '')}` : '';

        const summary = $('.summary-content').text().trim() || '';

        const author = $('.author-link').text().trim() || 'Unknown Author';

        const rawStatus = $('.status-badge').text().trim().toLowerCase();
        const statusMap: Record<string, NovelStatus> = {
            'ongoing': NovelStatus.Ongoing,
            'completed': NovelStatus.Completed,
            'complete': NovelStatus.Completed,
            'hiatus': NovelStatus.OnHiatus,
            'paused': NovelStatus.OnHiatus,
        };
        const status = statusMap[rawStatus] || NovelStatus.Unknown;

        const genres: string[] = [];
        $('.genre-tag').each((_, el) => {
            const g = $(el).text().trim();
            if (g && !genres.includes(g)) {
                genres.push(g);
            }
        });

        const slug = novelPath.replace(/^novel\//, '').replace(/\/$/, '');
        let chapters: Plugin.ChapterItem[] = [];

        if (slug) {
            try {
                chapters = await this.fetchAllChapters(slug);
            } catch {
                chapters = [];
            }
        }

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
        const html = await fetchText(`${this.site}${chapterPath}`);
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
        const url = `${this.site}api/search/?q=${encodeURIComponent(searchTerm.trim())}&search_type=title`;
        try {
            const res = await fetchApi(url);
            const json = await res.json() as { novels?: Array<any> };
            if (!json || !Array.isArray(json.novels)) {
                return [];
            }
            return json.novels.map((item: any) => {
                const rawCover = item.cover_path || '';
                const cover = rawCover ? `${this.site}${rawCover.replace(/^\//, '')}` : '';
                
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

            const titleEl = item.find('.card-title, .novel-title, .boost-shelf-title, .title, h3').first();
            const name =
                linkEl.attr('title')?.trim() ||
                item.find('a[title]').first().attr('title')?.trim() ||
                item.find('img[alt]').first().attr('alt')?.trim() ||
                titleEl.text().trim() ||
                '';

            const imgEl = item.find('a.card-cover-link img').first();
            const rawCover =
                imgEl.attr('src') ||
                imgEl.attr('data-src') ||
                imgEl.attr('data-lazy-src') ||
                '';

            if (name && rawPath) {
                let cleanPath = rawPath.replace(/^\//, '');
                if (!cleanPath.endsWith('/')) cleanPath += '/';
                if (seen.has(cleanPath)) return;
                seen.add(cleanPath);

                const cover = rawCover ? `${this.site}${rawCover.replace(/^\//, '')}` : '';

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
