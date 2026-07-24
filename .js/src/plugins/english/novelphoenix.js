"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelPhoenixPlugin = void 0;
var fetch_1 = require("@libs/fetch");
var cheerio_1 = require("cheerio");
var novelStatus_1 = require("@libs/novelStatus");
var filterInputs_1 = require("@libs/filterInputs");
var HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
};
var NovelPhoenixPlugin = /** @class */ (function () {
    function NovelPhoenixPlugin() {
        this.id = 'novelphoenix';
        this.name = 'Novel Phoenix';
        this.icon = 'src/en/novelphoenix/icon.png';
        this.site = 'https://novelphoenix.com/';
        this.version = '2.0.7';
        this.filters = {
            order: {
                value: 'sort-popular',
                label: 'Order by',
                options: [
                    { label: 'Popular', value: 'sort-popular' },
                    { label: 'New', value: 'sort-new' },
                    { label: 'Updates', value: 'sort-update' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            status: {
                value: 'all',
                label: 'Status',
                options: [
                    { label: 'All', value: 'all' },
                    { label: 'Ongoing', value: 'ongoing' },
                    { label: 'Completed', value: 'completed' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
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
                type: filterInputs_1.FilterTypes.Picker,
            },
        };
    }
    NovelPhoenixPlugin.prototype.checkCloudflare = function (html) {
        if (html.includes('<title>Just a moment...</title>') ||
            html.includes('<title>Attention Required! | Cloudflare</title>') ||
            html.includes('id="challenge-running"') ||
            html.includes('id="challenge-form"') ||
            html.includes('Enable JavaScript and cookies to continue')) {
            throw new Error('Cloudflare protection active. Please open in Webview to bypass.');
        }
    };
    NovelPhoenixPlugin.prototype.popularNovels = function (pageNo_1, _a) {
        return __awaiter(this, arguments, void 0, function (pageNo, _b) {
            var page, genre, status, order, url, html;
            var _c, _d, _e;
            var showLatestNovels = _b.showLatestNovels, filters = _b.filters;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        page = Math.max(1, pageNo || 1);
                        genre = ((_c = filters === null || filters === void 0 ? void 0 : filters.genre) === null || _c === void 0 ? void 0 : _c.value) || 'all';
                        status = ((_d = filters === null || filters === void 0 ? void 0 : filters.status) === null || _d === void 0 ? void 0 : _d.value) || 'all';
                        order = showLatestNovels
                            ? 'sort-new'
                            : ((_e = filters === null || filters === void 0 ? void 0 : filters.order) === null || _e === void 0 ? void 0 : _e.value) || 'sort-popular';
                        url = "".concat(this.site, "genre-").concat(genre, "/").concat(order, "/status-").concat(status, "/all-novel?page=").concat(page);
                        return [4 /*yield*/, (0, fetch_1.fetchText)(url, { headers: HEADERS })];
                    case 1:
                        html = _f.sent();
                        this.checkCloudflare(html);
                        return [2 /*return*/, this.parseNovelList(html)];
                }
            });
        });
    };
    NovelPhoenixPlugin.prototype.searchNovels = function (searchTerm, pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var url, res, json, items, _i, _a, item, cover;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (pageNo > 1)
                            return [2 /*return*/, []];
                        url = "".concat(this.site, "ajax/searchLive?keyword=").concat(encodeURIComponent(searchTerm));
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url, {
                                headers: __assign(__assign({}, HEADERS), { 'X-Requested-With': 'XMLHttpRequest' }),
                            })];
                    case 1:
                        res = _b.sent();
                        return [4 /*yield*/, res.json()];
                    case 2:
                        json = (_b.sent());
                        items = [];
                        if (json && Array.isArray(json.data)) {
                            for (_i = 0, _a = json.data; _i < _a.length; _i++) {
                                item = _a[_i];
                                if (!item.title || !item.slug)
                                    continue;
                                cover = item.image || '';
                                if (cover && !cover.startsWith('http')) {
                                    cover = cover.startsWith('/')
                                        ? "".concat(this.site).concat(cover.replace(/^\//, ''))
                                        : "".concat(this.site, "cover/").concat(cover);
                                }
                                items.push({
                                    name: item.title,
                                    path: "novel/".concat(item.slug),
                                    cover: cover,
                                });
                            }
                        }
                        return [2 /*return*/, items];
                }
            });
        });
    };
    NovelPhoenixPlugin.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanPath, fullUrl, html, $, title, cover, author, genres, rawStatus, status, summaryParagraphs, summary, chapters, novel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cleanPath = novelPath.replace(/^\//, '');
                        if (!cleanPath.endsWith('/'))
                            cleanPath += '/';
                        fullUrl = cleanPath.startsWith('http')
                            ? cleanPath
                            : "".concat(this.site).concat(cleanPath);
                        return [4 /*yield*/, (0, fetch_1.fetchText)(fullUrl, { headers: HEADERS })];
                    case 1:
                        html = _a.sent();
                        this.checkCloudflare(html);
                        $ = (0, cheerio_1.load)(html);
                        title = $('.novel-title, h1.title, .novel-name, h1, .book-title')
                            .first()
                            .text()
                            .trim() || 'Untitled';
                        cover = $('meta[property="og:image"]').attr('content') ||
                            $('.novel-cover img, .fixed-img img, .novel-info img')
                                .first()
                                .attr('src') ||
                            $('.novel-cover img, .fixed-img img, .novel-info img')
                                .first()
                                .attr('data-src') ||
                            '';
                        if (cover && !cover.startsWith('http')) {
                            cover = "".concat(this.site).concat(cover.replace(/^\//, ''));
                        }
                        author = $('.author-name, .author a, .novel-info .author, a[href*="/author/"]')
                            .first()
                            .text()
                            .trim() || '';
                        author = author.replace(/^Author:\s*/i, '').trim();
                        genres = [];
                        $('a[href*="/genre/"], .genre-item, .categories a').each(function (_, el) {
                            var g = $(el).text().trim();
                            if (g && !genres.includes(g) && g.toLowerCase() !== 'all') {
                                genres.push(g);
                            }
                        });
                        rawStatus = $('.status-name, .status, .novel-info .status, .badge, .tag')
                            .text()
                            .toLowerCase();
                        status = novelStatus_1.NovelStatus.Unknown;
                        if (rawStatus.includes('ongoing'))
                            status = novelStatus_1.NovelStatus.Ongoing;
                        else if (rawStatus.includes('completed') || rawStatus.includes('complete'))
                            status = novelStatus_1.NovelStatus.Completed;
                        else if (rawStatus.includes('hiatus') || rawStatus.includes('paused'))
                            status = novelStatus_1.NovelStatus.OnHiatus;
                        summaryParagraphs = [];
                        $('.summary p, .summary-content p, .description p').each(function (_, el) {
                            var text = $(el).text().trim();
                            if (text) {
                                summaryParagraphs.push(text);
                            }
                        });
                        summary = '';
                        if (summaryParagraphs.length > 0) {
                            summary = summaryParagraphs.join('\n\n');
                        }
                        else {
                            summary = $('.summary, .summary-content, .description, .novel-detail')
                                .first()
                                .text()
                                .trim();
                        }
                        return [4 /*yield*/, this.fetchAllChapters(novelPath)];
                    case 2:
                        chapters = _a.sent();
                        novel = {
                            path: cleanPath,
                            name: title,
                            cover: cover,
                            author: author,
                            status: status,
                            genres: genres.join(', '),
                            summary: summary,
                            chapters: chapters,
                        };
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    NovelPhoenixPlugin.prototype.fetchAllChapters = function (slug) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanSlug, baseUrl, firstHtml, $first, firstChapters, maxPage, pagesToFetch, p, BATCH_SIZE, remainingChapters, i, batch, batchResults, rawAll;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cleanSlug = slug.replace(/^\//, '').replace(/\/$/, '');
                        if (cleanSlug.startsWith('http')) {
                            cleanSlug = cleanSlug.replace(/^https?:\/\/[^\/]+\//, '');
                        }
                        cleanSlug = cleanSlug.replace(/^\//, '').replace(/\/$/, '');
                        if (cleanSlug.startsWith('novel/')) {
                            cleanSlug = cleanSlug.replace(/^novel\//, '');
                        }
                        baseUrl = "".concat(this.site, "novel/").concat(cleanSlug, "/chapters");
                        return [4 /*yield*/, (0, fetch_1.fetchText)("".concat(baseUrl, "?page=1"), {
                                headers: HEADERS,
                            })];
                    case 1:
                        firstHtml = _a.sent();
                        this.checkCloudflare(firstHtml);
                        $first = (0, cheerio_1.load)(firstHtml);
                        firstChapters = this.parseChapterLinks($first);
                        maxPage = 1;
                        $first('.pagination a, ul.pagination li a, a[href*="page="]').each(function (_, el) {
                            var href = $first(el).attr('href') || '';
                            var m = href.match(/page=(\d+)/i);
                            if (m) {
                                var p = parseInt(m[1], 10);
                                if (p > maxPage)
                                    maxPage = p;
                            }
                        });
                        if (maxPage <= 1) {
                            return [2 /*return*/, this.deduplicateChapters(firstChapters)];
                        }
                        pagesToFetch = [];
                        for (p = 2; p <= maxPage; p++) {
                            pagesToFetch.push(p);
                        }
                        BATCH_SIZE = 5;
                        remainingChapters = [];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < pagesToFetch.length)) return [3 /*break*/, 6];
                        batch = pagesToFetch.slice(i, i + BATCH_SIZE);
                        return [4 /*yield*/, Promise.all(batch.map(function (page) { return _this.fetchPageWithRetry(baseUrl, page); }))];
                    case 3:
                        batchResults = _a.sent();
                        remainingChapters.push.apply(remainingChapters, batchResults.flat());
                        if (!(i + BATCH_SIZE < pagesToFetch.length)) return [3 /*break*/, 5];
                        return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 50); })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i += BATCH_SIZE;
                        return [3 /*break*/, 2];
                    case 6:
                        rawAll = __spreadArray(__spreadArray([], firstChapters, true), remainingChapters, true);
                        return [2 /*return*/, this.deduplicateChapters(rawAll)];
                }
            });
        });
    };
    NovelPhoenixPlugin.prototype.fetchPageWithRetry = function (baseUrl, page) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, attempt, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_1 = function (attempt) {
                            var html, $, chs, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, fetch_1.fetchText)("".concat(baseUrl, "?page=").concat(page), {
                                                headers: HEADERS,
                                            })];
                                    case 1:
                                        html = _c.sent();
                                        if (html &&
                                            html.length > 500 &&
                                            !html.includes('<title>Just a moment...</title>')) {
                                            $ = (0, cheerio_1.load)(html);
                                            chs = this_1.parseChapterLinks($);
                                            if (chs.length > 0)
                                                return [2 /*return*/, { value: chs }];
                                        }
                                        return [3 /*break*/, 3];
                                    case 2:
                                        _b = _c.sent();
                                        return [3 /*break*/, 3];
                                    case 3: return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 150 * (attempt + 1)); })];
                                    case 4:
                                        _c.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 0;
                        _a.label = 1;
                    case 1:
                        if (!(attempt < 3)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _a.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, []];
                }
            });
        });
    };
    NovelPhoenixPlugin.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanPath, fullUrl, html, $, contentContainer, chapterText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cleanPath = chapterPath.replace(/^\//, '');
                        fullUrl = cleanPath.startsWith('http')
                            ? cleanPath
                            : "".concat(this.site).concat(cleanPath);
                        return [4 /*yield*/, (0, fetch_1.fetchText)(fullUrl, {
                                headers: HEADERS,
                            })];
                    case 1:
                        html = _a.sent();
                        this.checkCloudflare(html);
                        $ = (0, cheerio_1.load)(html);
                        contentContainer = $('#chapter-container, .chapter-content, .content, #content, .chapter-body').first();
                        contentContainer
                            .find('script, style, ins, .ads, .ad-container, .adsbygoogle, .chapter-review, .restore-scroll')
                            .remove();
                        chapterText = contentContainer.html() || '';
                        return [2 /*return*/, chapterText];
                }
            });
        });
    };
    NovelPhoenixPlugin.prototype.parseChapterLinks = function ($) {
        var chapters = [];
        var links = $('.chapter-list a[href*="/chapter-"]');
        links.each(function (i, el) {
            var $el = $(el);
            var href = $el.attr('href') || '';
            if (!href)
                return;
            if (href.includes('chapters?page='))
                return;
            var cleanHref = href.replace(/^\//, '');
            var numMatch = cleanHref.match(/chapter-(\d+)/i);
            var chapterNumber = numMatch ? parseInt(numMatch[1], 10) : i + 1;
            var name = $el.find('.chapter-title, .title').text().trim() ||
                $el.text().trim();
            name = name.replace(/\s*\d+\s*(years?|months?|days?|hours?|mins?|minutes?)\s*ago\s*$/i, '').trim();
            name = name.replace(/^\d+/, '').trim();
            if (!name)
                name = "Chapter ".concat(chapterNumber);
            if (name.toLowerCase().includes('read now'))
                return;
            chapters.push({
                name: name,
                path: cleanHref,
                chapterNumber: chapterNumber,
            });
        });
        return chapters;
    };
    NovelPhoenixPlugin.prototype.deduplicateChapters = function (rawChapters) {
        rawChapters.sort(function (a, b) { return (a.chapterNumber || 0) - (b.chapterNumber || 0); });
        var seenPaths = new Set();
        var cleanChapters = [];
        for (var _i = 0, rawChapters_1 = rawChapters; _i < rawChapters_1.length; _i++) {
            var ch = rawChapters_1[_i];
            if (!seenPaths.has(ch.path)) {
                seenPaths.add(ch.path);
                cleanChapters.push(ch);
            }
        }
        return cleanChapters;
    };
    NovelPhoenixPlugin.prototype.parseNovelList = function (html) {
        var _this = this;
        var $ = (0, cheerio_1.load)(html);
        var novels = [];
        $('.novel-item, .book-item, .novel-list .item').each(function (_, el) {
            var $el = $(el);
            var $a = $el.find('a').first();
            var href = $a.attr('href');
            var title = $el.find('.novel-title, .title, h3, h4').first().text().trim() ||
                $a.attr('title') ||
                '';
            var cover = $el.find('img').first().attr('data-src') ||
                $el.find('img').first().attr('src') ||
                '';
            if (cover && !cover.startsWith('http')) {
                cover = "".concat(_this.site).concat(cover.replace(/^\//, ''));
            }
            if (title && href) {
                var path = href.replace(/^\//, '');
                novels.push({
                    name: title,
                    path: path,
                    cover: cover,
                });
            }
        });
        return novels;
    };
    return NovelPhoenixPlugin;
}());
exports.NovelPhoenixPlugin = NovelPhoenixPlugin;
exports.default = new NovelPhoenixPlugin();
