"use strict";
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
exports.LightNovelWorldPlugin = void 0;
var fetch_1 = require("@libs/fetch");
var cheerio_1 = require("cheerio");
var novelStatus_1 = require("@libs/novelStatus");
var filterInputs_1 = require("@libs/filterInputs");
var LightNovelWorldPlugin = /** @class */ (function () {
    function LightNovelWorldPlugin() {
        this.id = 'lightnovelworld';
        this.name = 'LightNovelWorld';
        this.icon = 'src/en/lightnovelworld/icon.png';
        this.site = 'https://lightnovelworld.org/';
        this.version = '1.1.9';
        this.filters = {
            order: {
                value: 'rank',
                label: 'Order by',
                options: [
                    { label: 'Rank', value: 'rank' },
                    { label: 'Reviews', value: 'reviews' },
                    { label: 'Comments', value: 'comments' },
                    { label: 'Collections', value: 'collections' },
                    { label: 'Popular', value: 'popular' },
                    { label: 'New', value: 'new' },
                    { label: 'Updates', value: 'updates' },
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
                    { label: 'Fan-fiction', value: 'fan-fiction' },
                    { label: 'Fantasy', value: 'fantasy' },
                    { label: 'Game', value: 'game' },
                    { label: 'Gender Bender', value: 'gender-bender' },
                    { label: 'Harem', value: 'harem' },
                    { label: 'Historical', value: 'historical' },
                    { label: 'Horror', value: 'horror' },
                    { label: 'Isekai', value: 'isekai' },
                    { label: 'Josei', value: 'josei' },
                    { label: 'LGBT+', value: 'lgbt+' },
                    { label: 'Magic', value: 'magic' },
                    { label: 'Magical Realism', value: 'magical-realism' },
                    { label: 'Manhua', value: 'manhua' },
                    { label: 'Martial Arts', value: 'martial-arts' },
                    { label: 'Mature', value: 'mature' },
                    { label: 'Mecha', value: 'mecha' },
                    { label: 'Military', value: 'military' },
                    { label: 'Modern Life', value: 'modern-life' },
                    { label: 'Movies', value: 'movies' },
                    { label: 'Mystery', value: 'mystery' },
                    { label: 'Other', value: 'other' },
                    { label: 'Psychological', value: 'psychological' },
                    { label: 'Realistic Fiction', value: 'realistic-fiction' },
                    { label: 'Reincarnation', value: 'reincarnation' },
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
                    { label: 'System', value: 'system' },
                    { label: 'Tragedy', value: 'tragedy' },
                    { label: 'Urban', value: 'urban' },
                    { label: 'Urban Life', value: 'urban-life' },
                    { label: 'Video Games', value: 'video-games' },
                    { label: 'War', value: 'war' },
                    { label: 'Wuxia', value: 'wuxia' },
                    { label: 'Xianxia', value: 'xianxia' },
                    { label: 'Xuanhuan', value: 'xuanhuan' },
                    { label: 'Yaoi', value: 'yaoi' },
                    { label: 'Yuri', value: 'yuri' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
        };
    }
    LightNovelWorldPlugin.prototype.popularNovels = function (pageNo_1, _a) {
        return __awaiter(this, arguments, void 0, function (pageNo, _b) {
            var page, order, rankingSorts, url, genre, status_1, html;
            var _c, _d, _e;
            var showLatestNovels = _b.showLatestNovels, filters = _b.filters;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        page = Math.max(1, pageNo || 1);
                        order = showLatestNovels
                            ? 'updates'
                            : ((_c = filters === null || filters === void 0 ? void 0 : filters.order) === null || _c === void 0 ? void 0 : _c.value) || 'rank';
                        rankingSorts = new Set([
                            'rank',
                            'reviews',
                            'comments',
                            'collections',
                        ]);
                        if (rankingSorts.has(order)) {
                            url = "".concat(this.site, "ranking/?sort=").concat(order, "&page=").concat(page);
                        }
                        else {
                            genre = ((_d = filters === null || filters === void 0 ? void 0 : filters.genre) === null || _d === void 0 ? void 0 : _d.value) || 'all';
                            status_1 = ((_e = filters === null || filters === void 0 ? void 0 : filters.status) === null || _e === void 0 ? void 0 : _e.value) || 'all';
                            url = "".concat(this.site, "genre-").concat(genre, "/?status=").concat(status_1, "&order=").concat(order, "&page=").concat(page);
                        }
                        return [4 /*yield*/, (0, fetch_1.fetchText)(url)];
                    case 1:
                        html = _f.sent();
                        return [2 /*return*/, this.parseNovelList(html)];
                }
            });
        });
    };
    LightNovelWorldPlugin.prototype.fetchAllChapters = function (slug) {
        return __awaiter(this, void 0, void 0, function () {
            var LIMIT, apiBase, firstRes, firstJson, total, allChapters, offsets, offset, remainingResults, rawChapters, _i, rawChapters_1, ch, num, name_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        LIMIT = 500;
                        apiBase = "".concat(this.site, "api/novel/").concat(slug, "/chapters/?limit=").concat(LIMIT);
                        return [4 /*yield*/, (0, fetch_1.fetchApi)("".concat(apiBase, "&offset=0"))];
                    case 1:
                        firstRes = _a.sent();
                        return [4 /*yield*/, firstRes.json()];
                    case 2:
                        firstJson = (_a.sent());
                        total = firstJson.total_chapters || firstJson.chapters.length;
                        allChapters = [];
                        offsets = [];
                        for (offset = LIMIT; offset < total; offset += LIMIT) {
                            offsets.push(offset);
                        }
                        return [4 /*yield*/, Promise.all(offsets.map(function (offset) { return __awaiter(_this, void 0, void 0, function () {
                                var res, json, err_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 3, , 4]);
                                            return [4 /*yield*/, (0, fetch_1.fetchApi)("".concat(apiBase, "&offset=").concat(offset))];
                                        case 1:
                                            res = _a.sent();
                                            return [4 /*yield*/, res.json()];
                                        case 2:
                                            json = (_a.sent());
                                            return [2 /*return*/, json.chapters || []];
                                        case 3:
                                            err_1 = _a.sent();
                                            console.error("Failed to fetch chapters at offset ".concat(offset, ":"), err_1);
                                            return [2 /*return*/, []];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 3:
                        remainingResults = _a.sent();
                        rawChapters = __spreadArray(__spreadArray([], firstJson.chapters, true), remainingResults.flat(), true);
                        for (_i = 0, rawChapters_1 = rawChapters; _i < rawChapters_1.length; _i++) {
                            ch = rawChapters_1[_i];
                            num = ch.number;
                            name_1 = (ch.title || "Chapter ".concat(num)).trim();
                            allChapters.push({
                                name: name_1,
                                path: "novel/".concat(slug, "/chapter/").concat(num, "/"),
                                chapterNumber: num,
                            });
                        }
                        allChapters.sort(function (a, b) { return (a.chapterNumber || 0) - (b.chapterNumber || 0); });
                        return [2 /*return*/, allChapters];
                }
            });
        });
    };
    LightNovelWorldPlugin.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanPath, fullUrl, html, $, title, imgEl, rawCover, cover, summaryEl, paragraphs, summary, _i, paragraphs_1, p, author, rawStatus, status, genres, slug, chapters, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cleanPath = novelPath.replace(/^\//, '');
                        if (!cleanPath.endsWith('/'))
                            cleanPath += '/';
                        fullUrl = cleanPath.startsWith('http')
                            ? cleanPath
                            : "".concat(this.site).concat(cleanPath);
                        return [4 /*yield*/, (0, fetch_1.fetchText)(fullUrl)];
                    case 1:
                        html = _a.sent();
                        $ = (0, cheerio_1.load)(html);
                        title = $('.novel-title, h1.title, .novel-name, h1, .book-title')
                            .first()
                            .text()
                            .trim() || 'Untitled Novel';
                        imgEl = $('.cover img, .novel-cover img, .book-cover img, img.cover, .card-cover img, .novel-cover-container img').first();
                        rawCover = imgEl.attr('src') ||
                            imgEl.attr('data-src') ||
                            imgEl.attr('data-lazy-src') ||
                            '';
                        cover = rawCover ? new URL(rawCover, this.site).href : '';
                        summaryEl = $('.summary-content, .novel-summary, .synopsis, .summary .content').first();
                        summaryEl.find('br').replaceWith('\n');
                        paragraphs = summaryEl
                            .find('p')
                            .map(function (_, el) { return $(el).text().trim(); })
                            .get()
                            .filter(Boolean);
                        summary = '';
                        if (paragraphs.length > 0) {
                            for (_i = 0, paragraphs_1 = paragraphs; _i < paragraphs_1.length; _i++) {
                                p = paragraphs_1[_i];
                                if (summary && (p.startsWith('–') || p.startsWith('-'))) {
                                    summary += ' ' + p;
                                }
                                else {
                                    summary += (summary ? '\n\n' : '') + p;
                                }
                            }
                        }
                        else {
                            summary = summaryEl.text().trim();
                        }
                        author = $('.author a, .novel-author a, .author-name, .novel-author')
                            .first()
                            .text()
                            .trim() || 'Unknown Author';
                        rawStatus = $('.status-badge, .novel-status, .status-label, .status')
                            .first()
                            .text()
                            .trim()
                            .toLowerCase();
                        status = novelStatus_1.NovelStatus.Unknown;
                        if (rawStatus.includes('ongoing'))
                            status = novelStatus_1.NovelStatus.Ongoing;
                        else if (rawStatus.includes('completed') || rawStatus.includes('complete'))
                            status = novelStatus_1.NovelStatus.Completed;
                        else if (rawStatus.includes('hiatus') || rawStatus.includes('paused'))
                            status = novelStatus_1.NovelStatus.OnHiatus;
                        genres = [];
                        $('.genres a, .categories a, .genre-item, .tags a, .genre-tag').each(function (_, el) {
                            var g = $(el).text().trim();
                            if (g && !genres.includes(g)) {
                                genres.push(g);
                            }
                        });
                        slug = cleanPath.replace(/^novel\//, '').replace(/\/$/, '');
                        chapters = [];
                        if (!slug) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.fetchAllChapters(slug)];
                    case 3:
                        chapters = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Failed to fetch chapter list:', error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, {
                            path: cleanPath,
                            name: title,
                            cover: cover,
                            summary: summary,
                            author: author,
                            status: status,
                            genres: genres.join(', '),
                            chapters: chapters,
                        }];
                }
            });
        });
    };
    LightNovelWorldPlugin.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanChapPath, fullUrl, html, $, container, content;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cleanChapPath = chapterPath.replace(/^\//, '');
                        fullUrl = cleanChapPath.startsWith('http')
                            ? cleanChapPath
                            : "".concat(this.site).concat(cleanChapPath);
                        return [4 /*yield*/, (0, fetch_1.fetchText)(fullUrl)];
                    case 1:
                        html = _b.sent();
                        $ = (0, cheerio_1.load)(html);
                        container = $('#chapterText, .chapter-text, #chapter-container, .chapter-content, #chapter-body, .chr-c, #chr-content').first();
                        if (!container.length) {
                            return [2 /*return*/, '<p>No content found.</p>'];
                        }
                        container
                            .find('script, style, ins, .ads, .ad-container, .ad-wrapper, .watermark, #ad-banner, iframe, .ad-box, .pub-ad, .chapter-ad-container')
                            .remove();
                        container.find('*').each(function (_, el) {
                            var attribs = el.attribs || {};
                            for (var attr in attribs) {
                                if (attr.startsWith('on') || attr === 'style') {
                                    $(el).removeAttr(attr);
                                }
                            }
                        });
                        content = ((_a = container.html()) === null || _a === void 0 ? void 0 : _a.trim()) || '<p>No content found.</p>';
                        return [2 /*return*/, content.replace(/[\u200B-\u200D\uFEFF]/g, '')];
                }
            });
        });
    };
    LightNovelWorldPlugin.prototype.searchNovels = function (searchTerm, pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var url, res, json, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!searchTerm || !searchTerm.trim())
                            return [2 /*return*/, []];
                        url = "".concat(this.site, "api/search/?q=").concat(encodeURIComponent(searchTerm.trim()));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url)];
                    case 2:
                        res = _b.sent();
                        return [4 /*yield*/, res.json()];
                    case 3:
                        json = (_b.sent());
                        if (!json || !Array.isArray(json.novels)) {
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, json.novels
                                .map(function (item) {
                                var rawCover = item.cover_path || '';
                                var cover = rawCover ? new URL(rawCover, _this.site).href : '';
                                var slug = item.slug || '';
                                var path = slug ? "novel/".concat(slug, "/") : '';
                                return {
                                    name: item.title || 'Untitled',
                                    cover: cover,
                                    path: path,
                                };
                            })
                                .filter(function (item) { return !!item.path && !!item.name; })];
                    case 4:
                        _a = _b.sent();
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    LightNovelWorldPlugin.prototype.parseNovelList = function (html) {
        var _this = this;
        var $ = (0, cheerio_1.load)(html);
        var novels = [];
        var seen = new Set();
        $('.ranking-card, .recommendation-card, .boost-shelf-card, .novel-item, .novel-card').each(function (_, el) {
            var _a, _b, _c;
            var item = $(el);
            var linkEl = item.is('a[href*="/novel/"]')
                ? item
                : item.find("a[href*='/novel/']").first();
            var rawPath = linkEl.attr('href') || item.find('a.card-link').attr('href') || '';
            if (!rawPath)
                return;
            var titleEl = item
                .find('.card-title, .novel-title, .boost-shelf-title, .title, h3')
                .first();
            var name = ((_a = linkEl.attr('title')) === null || _a === void 0 ? void 0 : _a.trim()) ||
                ((_b = item.find('a[title]').first().attr('title')) === null || _b === void 0 ? void 0 : _b.trim()) ||
                ((_c = item.find('img[alt]').first().attr('alt')) === null || _c === void 0 ? void 0 : _c.trim()) ||
                titleEl.text().trim() ||
                '';
            var imgEl = item.find('img.skel-img, .card-cover img, img').first();
            var rawCover = imgEl.attr('src') ||
                imgEl.attr('data-src') ||
                imgEl.attr('data-lazy-src') ||
                item.find('[data-bg-image]').attr('data-bg-image') ||
                '';
            if (name && rawPath) {
                var cleanPath = rawPath.startsWith('http')
                    ? new URL(rawPath).pathname
                    : rawPath;
                cleanPath = cleanPath.replace(/^\//, '');
                if (!cleanPath.endsWith('/'))
                    cleanPath += '/';
                if (seen.has(cleanPath))
                    return;
                seen.add(cleanPath);
                var cover = rawCover ? new URL(rawCover, _this.site).href : '';
                novels.push({
                    name: name,
                    cover: cover,
                    path: cleanPath,
                });
            }
        });
        return novels;
    };
    return LightNovelWorldPlugin;
}());
exports.LightNovelWorldPlugin = LightNovelWorldPlugin;
exports.default = new LightNovelWorldPlugin();
