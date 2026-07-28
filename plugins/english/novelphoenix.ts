import { fetchText } from '@libs/fetch';
import { CheerioAPI, load as loadCheerio } from 'cheerio';
import { Plugin } from '@/types/plugin';
import { NovelStatus } from '@libs/novelStatus';
import { Filters, FilterTypes } from '@libs/filterInputs';

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
    version = "1.0.1";

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://novelphoenix.com/',
    };

    async getCheerio(url: string): Promise<CheerioAPI> {
        const html = await fetchText(url, { headers: this.headers });
        if (!html) {
            throw new Error('Failed to fetch content. Try to open in WebView.');
        }
        const $ = loadCheerio(html);
        const title = $('title').text().trim();
        if (title.includes('Cloudflare') || title.includes('Just a moment') || title.includes('Attention Required') || title.includes('Access denied')) {
            throw new Error('Cloudflare is blocking requests. Try to open in WebView.');
        }
        return $;
    }

    async popularNovels(
        pageNo: number,
        options?: Plugin.PopularNovelsOptions<typeof this.filters>
    ): Promise<Plugin.NovelItem[]> {
        const genreVal = options?.filters?.genres?.value;
        const genre = (Array.isArray(genreVal) && genreVal.length > 0 ? genreVal[0] : (typeof genreVal === 'string' && genreVal ? genreVal : 'genre-all'));

        const orderVal = options?.filters?.order?.value;
        const order = (typeof orderVal === 'string' && orderVal ? orderVal : (options?.showLatestNovels ? 'sort-new' : 'sort-popular'));

        const statusVal = options?.filters?.status?.value;
        const status = (typeof statusVal === 'string' && statusVal ? statusVal : 'status-all');

        const langVal = options?.filters?.language?.value;
        const language = (typeof langVal === 'string' && langVal ? langVal : 'all-novel');

        const url = `${this.site}${genre}/${order}/${status}/${language}?page=${pageNo}`;
        const $ = await this.getCheerio(url);
        return this.parseNovelList($);
    }

    async fetchAllChapters(slug: string): Promise<Plugin.ChapterItem[]> {
        const firstPageUrl = `${this.site}novel/${slug}/chapters`;
        const $first = await this.getCheerio(firstPageUrl);

        const pageNums = $first('.pagination a')
            .map((_, el) => parseInt($first(el).text().trim()))
            .get()
            .filter(n => !isNaN(n));

        const maxPage = pageNums.length > 0 ? Math.max(...pageNums) : 1;
        const pageCheerioList: CheerioAPI[] = [$first];

        if (maxPage > 1) {
            const batchSize = 5;
            for (let p = 2; p <= maxPage; p += batchSize) {
                const batchPromises: Promise<CheerioAPI>[] = [];
                for (let i = p; i < Math.min(p + batchSize, maxPage + 1); i++) {
                    batchPromises.push(this.getCheerio(`${this.site}novel/${slug}/chapters?page=${i}`));
                }
                try {
                    const batchResults = await Promise.all(batchPromises);
                    pageCheerioList.push(...batchResults);
                } catch {
                    break;
                }
            }
        }

        const chapters: Plugin.ChapterItem[] = [];

        pageCheerioList.forEach($ => {
            $('.chapter-list li').each((_, el) => {
                const link = $(el).find('a');
                const rawPath = link.attr('href');
                if (!rawPath) return;

                const name = link.find('.chapter-title').text().trim() || link.text().trim();
                const releaseTime = link.find('.chapter-update').attr('datetime') || link.find('.chapter-update').text().trim();

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
        const $ = await this.getCheerio(`${this.site}${novelPath}`);

        const title = $('.novel-title').text().trim();

        const $cover = $('.cover img');
        const rawCover = $cover.attr('src') || $cover.attr('data-src');
        const cover = rawCover ? `${this.site}${rawCover.replace(/^\//, '')}` : '';

        const $summary = $('.summary');
        $summary.find('br').replaceWith('\n');
        $summary.find('p').before('\n').after('\n\n');

        const summary = $summary
            .text()
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n\n')
            .trim();

        const author = $('.author a').text().trim();

        const rawStatus = $('.header-stats strong').last().text().trim().toLowerCase();
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
        const $ = await this.getCheerio(`${this.site}${chapterPath}`);

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
        searchTerm = searchTerm.trim();
        if (!searchTerm) return [];
        const url = `${this.site}search?keyword=${encodeURIComponent(searchTerm)}&page=${pageNo}`;
        try {
            const $ = await this.getCheerio(url);
            return this.parseNovelList($);
        } catch {
            return [];
        }
    }

    parseNovelList($: CheerioAPI): Plugin.NovelItem[] {
        const novels: Plugin.NovelItem[] = [];
        const seen = new Set<string>();

        $('.novel-item').each((_, el) => {
            const $a = $(el).find('a');
            const rawPath = $a.attr('href');
            if (!rawPath) return;

            const name = $a.find('.novel-title').text().trim();
            const $img = $a.find('img');
            const rawCover = $img.attr('data-src') || $img.attr('src');

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

    filters = {
        order: {
            value: 'sort-popular',
            label: 'Order by',
            options: [
                { label: 'Popular', value: 'sort-popular' },
                { label: 'New', value: 'sort-new' },
                { label: 'Latest Release', value: 'sort-latest-release' },
            ],
            type: FilterTypes.Picker,
        },
        status: {
            value: 'status-all',
            label: 'Status',
            options: [
                { label: 'All', value: 'status-all' },
                { label: 'Ongoing', value: 'status-ongoing' },
                { label: 'Completed', value: 'status-completed' },
            ],
            type: FilterTypes.Picker,
        },
        language: {
            value: 'all-novel',
            label: 'Language',
            options: [
                { label: 'All', value: 'all-novel' },
                { label: 'Chinese', value: 'chinese-novel' },
                { label: 'Japanese', value: 'japanese-novel' },
                { label: 'English', value: 'english-novel' },
            ],
            type: FilterTypes.Picker,
        },
        genres: {
            value: [],
            label: 'Genres',
            options: [
                { label: 'Action', value: 'genre-action' },
                { label: 'Adult', value: 'genre-adult' },
                { label: 'Adventure', value: 'genre-adventure' },
                { label: 'Anime', value: 'genre-anime' },
                { label: 'Arts', value: 'genre-arts' },
                { label: 'Comedy', value: 'genre-comedy' },
                { label: 'Drama', value: 'genre-drama' },
                { label: 'Eastern', value: 'genre-eastern' },
                { label: 'Ecchi', value: 'genre-ecchi' },
                { label: 'Fan-fiction', value: 'genre-fan-fiction' },
                { label: 'Fantasy', value: 'genre-fantasy' },
                { label: 'Game', value: 'genre-game' },
                { label: 'Gender Bender', value: 'genre-gender-bender' },
                { label: 'Harem', value: 'genre-harem' },
                { label: 'Historical', value: 'genre-historical' },
                { label: 'Horror', value: 'genre-horror' },
                { label: 'Isekai', value: 'genre-isekai' },
                { label: 'Josei', value: 'genre-josei' },
                { label: 'Lgbt+', value: 'genre-lgbt' },
                { label: 'Magic', value: 'genre-magic' },
                { label: 'Magical Realism', value: 'genre-magical-realism' },
                { label: 'Manhua', value: 'genre-manhua' },
                { label: 'Martial Arts', value: 'genre-martial-arts' },
                { label: 'Mature', value: 'genre-mature' },
                { label: 'Mecha', value: 'genre-mecha' },
                { label: 'Military', value: 'genre-military' },
                { label: 'Modern Life', value: 'genre-modern-life' },
                { label: 'Movies', value: 'genre-movies' },
                { label: 'Mystery', value: 'genre-mystery' },
                { label: 'Other', value: 'genre-other' },
                { label: 'Psychological', value: 'genre-psychological' },
                { label: 'Realistic Fiction', value: 'genre-realistic-fiction' },
                { label: 'Reincarnation', value: 'genre-reincarnation' },
                { label: 'Romance', value: 'genre-romance' },
                { label: 'School Life', value: 'genre-school-life' },
                { label: 'Sci-fi', value: 'genre-sci-fi' },
                { label: 'Seinen', value: 'genre-seinen' },
                { label: 'Shoujo', value: 'genre-shoujo' },
                { label: 'Shoujo Ai', value: 'genre-shoujo-ai' },
                { label: 'Shounen', value: 'genre-shounen' },
                { label: 'Shounen Ai', value: 'genre-shounen-ai' },
                { label: 'Slice of Life', value: 'genre-slice-of-life' },
                { label: 'Smut', value: 'genre-smut' },
                { label: 'Sports', value: 'genre-sports' },
                { label: 'Supernatural', value: 'genre-supernatural' },
                { label: 'System', value: 'genre-system' },
                { label: 'Tragedy', value: 'genre-tragedy' },
                { label: 'Urban', value: 'genre-urban' },
                { label: 'Urban Life', value: 'genre-urban-life' },
                { label: 'Video Games', value: 'genre-video-games' },
                { label: 'War', value: 'genre-war' },
                { label: 'Wuxia', value: 'genre-wuxia' },
                { label: 'Xianxia', value: 'genre-xianxia' },
                { label: 'Xuanhuan', value: 'genre-xuanhuan' },
                { label: 'Yaoi', value: 'genre-yaoi' },
                { label: 'Yuri', value: 'genre-yuri' },
            ],
            type: FilterTypes.CheckboxGroup,
        },
    } satisfies Filters;
}

export default new NovelPhoenixPlugin();
