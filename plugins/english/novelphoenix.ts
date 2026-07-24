import { fetchText } from '@libs/fetch';
import { load as loadCheerio } from 'cheerio';
import { Plugin } from '@typings/plugin';
import { NovelStatus } from '@libs/novelStatus';

const STATUS_MAP: Record<string, NovelStatus> = {
    'ongoing': NovelStatus.Ongoing,
    'completed': NovelStatus.Completed,
    'complete': NovelStatus.Completed,
    'hiatus': NovelStatus.OnHiatus,
    'paused': NovelStatus.OnHiatus,
    'cancelled': NovelStatus.Cancelled,
    'dropped': NovelStatus.Cancelled,
};

export class NovelPhoenixPlugin implements Plugin.PluginBase {
    id = "novelphoenix";
    name = "NovelPhoenix";
    icon = "src/english/novelphoenix/icon.png";
    site = "https://novelphoenix.com/";
    version = "1.0.0";

    async popularNovels(
        pageNo: number,
        options?: Plugin.PopularNovelsOptions
    ): Promise<Plugin.NovelItem[]> {
        const order = options?.showLatestNovels ? 'sort-new' : 'sort-popular';
        const url = `${this.site}genre-all/${order}/status-all/all-novel?page=${pageNo}`;
        const html = await fetchText(url);
        return this.parseNovelList(html);
    }

    async fetchAllChapters(slug: string): Promise<Plugin.ChapterItem[]> {
        const firstPageUrl = `${this.site}novel/${slug}/chapters`;
        const firstHtml = await fetchText(firstPageUrl);
        const $first = loadCheerio(firstHtml);

        const pageNums = $first('.pagination a')
            .map((_, el) => parseInt($first(el).text().trim()))
            .get()
            .filter(n => !isNaN(n));

        const maxPage = pageNums.length > 0 ? Math.max(...pageNums) : 1;
        const pageHtmls: string[] = [firstHtml];

        if (maxPage > 1) {
            const promises: Promise<string>[] = [];
            for (let p = 2; p <= maxPage; p++) {
                promises.push(fetchText(`${this.site}novel/${slug}/chapters?page=${p}`));
            }
            const remainingHtmls = await Promise.all(promises);
            pageHtmls.push(...remainingHtmls);
        }

        const chapters: Plugin.ChapterItem[] = [];

        pageHtmls.forEach(html => {
            const $ = loadCheerio(html);
            $('.chapter-list li').each((_, el) => {
                const link = $(el).find('a');
                const rawPath = link.attr('href');
                if (!rawPath) return;

                const name = link.find('.chapter-title').text().trim() || link.attr('title') || link.text().trim();
                const releaseTime = link.find('.chapter-update').attr('datetime') || link.find('.chapter-update').text().trim() || undefined;

                chapters.push({
                    name,
                    path: rawPath.replace(/^\//, ''),
                    releaseTime,
                });
            });
        });

        return chapters;
    }

    async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
        const html = await fetchText(`${this.site}${novelPath}`);
        const $ = loadCheerio(html);

        const title = $('.novel-title').text().trim();

        const $cover = $('.cover img');
        const rawCover = $cover.attr('src') || $cover.attr('data-src');
        const cover = rawCover ? `${this.site}${rawCover.replace(/^\//, '')}` : '';

        const summary = $('.summary').text().trim();
        const author = $('.author a').text().trim();

        const rawStatus = $('.header-stats strong').text().trim().toLowerCase();
        const status = STATUS_MAP[rawStatus] || NovelStatus.Unknown;

        const genres = $('.categories a').map((_, el) => $(el).text().trim()).get().join(', ');

        const slug = novelPath.replace(/^\/?novel\//, '').replace(/\/$/, '');
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
            genres,
            chapters,
        };
    }

    async parseChapter(chapterPath: string): Promise<string> {
        const html = await fetchText(`${this.site}${chapterPath}`);
        const $ = loadCheerio(html);

        const container = $('#chapter-container');
        if (!container.length) {
            return '';
        }

        container.find('script, style, ins, iframe, .ads, .ad-container, .watermark, div.text-center, #restore-scroll-btn').remove();
        container.find('[style]').removeAttr('style');

        return container.html()?.trim() || '';
    }

    async searchNovels(
        searchTerm: string,
        pageNo: number
    ): Promise<Plugin.NovelItem[]> {
        if (!searchTerm?.trim()) return [];
        const url = `${this.site}search?keyword=${encodeURIComponent(searchTerm.trim())}&page=${pageNo}`;
        try {
            const html = await fetchText(url);
            return this.parseNovelList(html);
        } catch {
            return [];
        }
    }

    parseNovelList(html: string): Plugin.NovelItem[] {
        const $ = loadCheerio(html);
        const novels: Plugin.NovelItem[] = [];
        const seen = new Set<string>();

        $('.novel-item').each((_, el) => {
            const item = $(el);
            const linkEl = item.find('a');
            const rawPath = linkEl.attr('href');
            if (!rawPath) return;

            const name = item.find('.novel-title').text().trim() || linkEl.attr('title')?.trim() || '';
            const imgEl = item.find('img');
            const rawCover = imgEl.attr('data-src') || imgEl.attr('src');

            if (name && rawPath) {
                const cleanPath = rawPath.replace(/^\//, '');
                if (seen.has(cleanPath)) return;
                seen.add(cleanPath);

                const cover = rawCover ? `${this.site}${rawCover.replace(/^\//, '')}` : '';
                novels.push({ name, cover, path: cleanPath });
            }
        });

        return novels;
    }
}

export default new NovelPhoenixPlugin();

