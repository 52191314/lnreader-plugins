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
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio_1 = require("cheerio");
var fetch_1 = require("@libs/fetch");
var novelStatus_1 = require("@libs/novelStatus");
var filterInputs_1 = require("@libs/filterInputs");
var constants_1 = require("@/types/constants");
var STATUS_MAP = {
    ongoing: novelStatus_1.NovelStatus.Ongoing,
    completed: novelStatus_1.NovelStatus.Completed,
    complete: novelStatus_1.NovelStatus.Completed,
    hiatus: novelStatus_1.NovelStatus.OnHiatus,
    paused: novelStatus_1.NovelStatus.OnHiatus,
    cancelled: novelStatus_1.NovelStatus.Cancelled,
    dropped: novelStatus_1.NovelStatus.Cancelled,
    unknown: novelStatus_1.NovelStatus.Unknown,
};
var NovelPhoenix = /** @class */ (function () {
    function NovelPhoenix() {
        this.id = 'novelphoenix';
        this.name = 'NovelPhoenix';
        this.version = '1.1.1';
        this.icon = 'src/english/novelphoenix/icon.png';
        this.site = 'https://novelphoenix.com/';
        this.novelList = new Set();
        // Browser headers are required: the site's Cloudflare returns 403 for
        // non-browser User-Agents.
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Referer: 'https://novelphoenix.com/',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        };
        this.filters = {
            sort: {
                value: 'rank-top',
                label: 'Sort Results By',
                options: [
                    { label: 'Rank (Top)', value: 'rank-top' },
                    { label: 'Rating Score (Top)', value: 'rating-score-top' },
                    { label: 'Review Count (Most)', value: 'review' },
                    { label: 'Comment Count (Most)', value: 'comment' },
                    { label: 'Bookmark Count (Most)', value: 'bookmark' },
                    { label: 'Today Views (Most)', value: 'today-view' },
                    { label: 'Monthly Views (Most)', value: 'monthly-view' },
                    { label: 'Total Views (Most)', value: 'total-view' },
                    { label: 'Title (A>Z)', value: 'abc' },
                    { label: 'Title (Z>A)', value: 'cba' },
                    { label: 'Last Updated (Newest)', value: 'date' },
                    { label: 'Chapter Count (Most)', value: 'chapter-count-most' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            status: {
                value: '-1',
                label: 'Translation Status',
                options: [
                    { label: 'All', value: '-1' },
                    { label: 'Completed', value: '1' },
                    { label: 'Ongoing', value: '0' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            genre_operator: {
                value: 'and',
                label: 'Genres (And/Or/Exclude)',
                options: [
                    { label: 'AND', value: 'and' },
                    { label: 'OR', value: 'or' },
                    { label: 'EXCLUDE', value: 'exclude' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            genres: {
                value: [],
                label: 'Genres',
                options: [
                    { label: 'Action', value: '3' },
                    { label: 'Adult', value: '28' },
                    { label: 'Adventure', value: '4' },
                    { label: 'Anime', value: '46' },
                    { label: 'Arts', value: '47' },
                    { label: 'Comedy', value: '5' },
                    { label: 'Drama', value: '24' },
                    { label: 'Eastern', value: '44' },
                    { label: 'Ecchi', value: '26' },
                    { label: 'Fan-fiction', value: '48' },
                    { label: 'Fantasy', value: '6' },
                    { label: 'Game', value: '19' },
                    { label: 'Gender Bender', value: '25' },
                    { label: 'Harem', value: '7' },
                    { label: 'Historical', value: '12' },
                    { label: 'Horror', value: '37' },
                    { label: 'Isekai', value: '49' },
                    { label: 'Josei', value: '2' },
                    { label: 'Lgbt+', value: '45' },
                    { label: 'Magic', value: '50' },
                    { label: 'Magical Realism', value: '51' },
                    { label: 'Manhua', value: '52' },
                    { label: 'Martial Arts', value: '15' },
                    { label: 'Mature', value: '8' },
                    { label: 'Mecha', value: '34' },
                    { label: 'Military', value: '53' },
                    { label: 'Modern Life', value: '54' },
                    { label: 'Movies', value: '55' },
                    { label: 'Mystery', value: '16' },
                    { label: 'Other', value: '64' },
                    { label: 'Psychological', value: '9' },
                    { label: 'Realistic Fiction', value: '56' },
                    { label: 'Reincarnation', value: '43' },
                    { label: 'Romance', value: '1' },
                    { label: 'School Life', value: '21' },
                    { label: 'Sci-fi', value: '20' },
                    { label: 'Seinen', value: '10' },
                    { label: 'Shoujo', value: '38' },
                    { label: 'Shoujo Ai', value: '57' },
                    { label: 'Shounen', value: '17' },
                    { label: 'Shounen Ai', value: '39' },
                    { label: 'Slice of Life', value: '13' },
                    { label: 'Smut', value: '29' },
                    { label: 'Sports', value: '42' },
                    { label: 'Supernatural', value: '18' },
                    { label: 'System', value: '58' },
                    { label: 'Tragedy', value: '32' },
                    { label: 'Urban', value: '63' },
                    { label: 'Urban Life', value: '59' },
                    { label: 'Video Games', value: '60' },
                    { label: 'War', value: '61' },
                    { label: 'Wuxia', value: '31' },
                    { label: 'Xianxia', value: '23' },
                    { label: 'Xuanhuan', value: '22' },
                    { label: 'Yaoi', value: '14' },
                    { label: 'Yuri', value: '62' },
                ],
                type: filterInputs_1.FilterTypes.CheckboxGroup,
            },
            language: {
                value: [],
                label: 'Language',
                options: [
                    { label: 'Chinese', value: '1' },
                    { label: 'Japanese', value: '3' },
                    { label: 'English', value: '4' },
                ],
                type: filterInputs_1.FilterTypes.CheckboxGroup,
            },
            rating_operator: {
                value: 'min',
                label: 'Rating (Min/Max)',
                options: [
                    { label: 'Min', value: 'min' },
                    { label: 'Max', value: 'max' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            rating: {
                value: '0',
                label: 'Rating',
                options: [
                    { label: 'All', value: '0' },
                    { label: '1', value: '1' },
                    { label: '2', value: '2' },
                    { label: '3', value: '3' },
                    { label: '4', value: '4' },
                    { label: '5', value: '5' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            chapters: {
                value: '0',
                label: 'Chapters',
                options: [
                    { label: 'All', value: '0' },
                    { label: '50-100', value: '50,100' },
                    { label: '100-200', value: '100,200' },
                    { label: '200-500', value: '200,500' },
                    { label: '500-1000', value: '500,1000' },
                    { label: '>1000', value: '1001,1000000' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
        };
    }
    NovelPhoenix.prototype.getCheerio = function (url, search) {
        return __awaiter(this, void 0, void 0, function () {
            var r, $, _a, title;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)(url, { headers: this.headers })];
                    case 1:
                        r = _b.sent();
                        if (!r.ok && search != true)
                            throw new Error('Could not reach site (' + r.status + ') try to open in webview.');
                        _a = cheerio_1.load;
                        return [4 /*yield*/, r.text()];
                    case 2:
                        $ = _a.apply(void 0, [_b.sent()]);
                        title = $('title').text();
                        if (title.includes('Cloudflare') ||
                            title.includes('Just a moment') ||
                            title.includes('Attention Required') ||
                            title.includes('Access denied')) {
                            throw new Error('Cloudflare is blocking requests. Try again later.');
                        }
                        return [2 /*return*/, $];
                }
            });
        });
    };
    NovelPhoenix.prototype.parseNovels = function (loadedCheerio, selector, isFirstPage) {
        var _a, _b, _c;
        if (selector === void 0) { selector = '.novel-item'; }
        if (isFirstPage === void 0) { isFirstPage = false; }
        var novels = [];
        var elements = loadedCheerio(selector).toArray();
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var el = elements_1[_i];
            var $el = loadedCheerio(el);
            var novelName = (_a = $el.find('a').attr('title')) !== null && _a !== void 0 ? _a : $el.find('h4').text().trim();
            var novelPath = (_b = $el.children('a').attr('href')) !== null && _b !== void 0 ? _b : $el.find('h4 a').attr('href');
            if (!novelPath)
                continue;
            var path = new URL(novelPath, this.site).pathname.substring(1);
            if (!isFirstPage) {
                if (this.novelList.has(path))
                    continue;
                this.novelList.add(path);
            }
            else {
                this.novelList.add(path);
            }
            var imgElement = $el.find('.novel-cover > img');
            var rawSrc = (_c = imgElement.attr('data-src')) !== null && _c !== void 0 ? _c : imgElement.attr('src');
            var novelCover = rawSrc
                ? new URL(rawSrc, this.site).href
                : constants_1.defaultCover;
            novels.push({
                name: novelName,
                cover: novelCover,
                path: path,
            });
        }
        return novels;
    };
    NovelPhoenix.prototype.popularNovels = function (pageNo_1, _a) {
        return __awaiter(this, arguments, void 0, function (pageNo, _b) {
            var url, params, _i, _c, language, _d, _e, genre, loadedCheerio;
            var showLatestNovels = _b.showLatestNovels, filters = _b.filters;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (pageNo === 1) {
                            this.novelList.clear();
                        }
                        url = this.site + 'search-adv';
                        params = new URLSearchParams();
                        for (_i = 0, _c = filters.language.value; _i < _c.length; _i++) {
                            language = _c[_i];
                            params.append('country_id[]', language);
                        }
                        params.append('ctgcon', filters.genre_operator.value);
                        for (_d = 0, _e = filters.genres.value; _d < _e.length; _d++) {
                            genre = _e[_d];
                            params.append('categories[]', genre);
                        }
                        params.append('totalchapter', filters.chapters.value);
                        params.append('ratcon', filters.rating_operator.value);
                        params.append('rating', filters.rating.value);
                        params.append('status', filters.status.value);
                        params.append('sort', showLatestNovels ? 'date' : filters.sort.value);
                        params.append('tagcon', 'and');
                        params.append('page', pageNo.toString());
                        return [4 /*yield*/, this.getCheerio("".concat(url, "?").concat(params.toString()), false)];
                    case 1:
                        loadedCheerio = _f.sent();
                        return [2 /*return*/, this.parseNovels(loadedCheerio, '.novel-item', pageNo === 1)];
                }
            });
        });
    };
    NovelPhoenix.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var $, baseUrl, novel, coverUrl, summary, rawStatus, totalChapters, _a;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, this.getCheerio(this.site + novelPath, false)];
                    case 1:
                        $ = _g.sent();
                        baseUrl = this.site;
                        novel = {
                            path: novelPath,
                            totalPages: 1,
                        };
                        novel.name =
                            (_c = (_b = $('.novel-title').text().trim()) !== null && _b !== void 0 ? _b : $('.cover > img').attr('alt')) !== null && _c !== void 0 ? _c : 'No Titled Found';
                        coverUrl = (_d = $('.cover > img').attr('data-src')) !== null && _d !== void 0 ? _d : $('.cover > img').attr('src');
                        if (coverUrl) {
                            novel.cover = new URL(coverUrl, baseUrl).href;
                        }
                        else {
                            novel.cover = constants_1.defaultCover;
                        }
                        novel.genres = $('.categories .property-item')
                            .map(function (_, el) { return $(el).text(); })
                            .toArray()
                            .join(',');
                        summary = $('.summary .content');
                        summary.find('.expand').remove();
                        summary.find('br').replaceWith('\n');
                        summary.find('p').before('\n').after('\n\n');
                        novel.summary =
                            ((_e = summary
                                .text()
                                .split('\n')
                                .map(function (line) { return line.trim(); })
                                .join('\n')) === null || _e === void 0 ? void 0 : _e.replace(/\n{3,}/g, '\n\n').trim()) || 'Summary Not Found';
                        novel.author = $('.author .property-item > span').text();
                        rawStatus = $('.header-stats .ongoing').text() ||
                            $('.header-stats .completed').text() ||
                            'Unknown';
                        novel.status = (_f = STATUS_MAP[rawStatus.toLowerCase()]) !== null && _f !== void 0 ? _f : novelStatus_1.NovelStatus.Unknown;
                        novel.rating = parseFloat($('.nub').text().trim());
                        totalChapters = $('.header-stats i.icon-book-open')
                            .parent()
                            .text()
                            .trim();
                        novel.totalPages = Math.ceil(parseInt(totalChapters) / 100) || 1;
                        if (!(novel.totalPages === 1)) return [3 /*break*/, 3];
                        _a = novel;
                        return [4 /*yield*/, this.parsePage(novelPath, '1')];
                    case 2:
                        _a.chapters = (_g.sent()).chapters;
                        _g.label = 3;
                    case 3: return [2 /*return*/, novel];
                }
            });
        });
    };
    NovelPhoenix.prototype.parsePage = function (novelPath, page) {
        return __awaiter(this, void 0, void 0, function () {
            var url, loadedCheerio, chapters;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(this.site).concat(novelPath, "/chapters?page=").concat(page);
                        return [4 /*yield*/, this.getCheerio(url, false)];
                    case 1:
                        loadedCheerio = _a.sent();
                        chapters = loadedCheerio('.chapter-list li')
                            .map(function (_, ele) {
                            var chapterName = loadedCheerio(ele).find('a').attr('title') || 'No Title Found';
                            var chapterPath = loadedCheerio(ele).find('a').attr('href');
                            if (!chapterPath)
                                return null;
                            return {
                                name: chapterName,
                                path: new URL(chapterPath, _this.site).pathname.substring(1),
                                releaseTime: loadedCheerio(ele).find('.chapter-update').attr('datetime') ||
                                    loadedCheerio(ele).find('.chapter-update').text().trim(),
                            };
                        })
                            .get()
                            .filter(function (chapter) { return chapter !== null; });
                        return [2 /*return*/, {
                                chapters: chapters,
                            }];
                }
            });
        });
    };
    NovelPhoenix.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var url, loadedCheerio, chapterText;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        url = this.site + chapterPath;
                        return [4 /*yield*/, this.getCheerio(url, false)];
                    case 1:
                        loadedCheerio = _b.sent();
                        chapterText = loadedCheerio('#content');
                        chapterText
                            .find('script, style, ins, iframe, .ads, .ad-container, .nf-ads, .watermark, div.text-center, #restore-scroll-btn')
                            .remove();
                        chapterText.find('[style]').removeAttr('style');
                        return [2 /*return*/, ((_a = chapterText.html()) === null || _a === void 0 ? void 0 : _a.replace(/&nbsp;/g, ' ')) || ''];
                }
            });
        });
    };
    NovelPhoenix.prototype.searchNovels = function (searchTerm, page) {
        return __awaiter(this, void 0, void 0, function () {
            var params, url, result, body, loadedCheerio;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (page === 1) {
                            this.novelList.clear();
                        }
                        params = new URLSearchParams();
                        params.append('keyword', searchTerm);
                        params.append('page', page.toString());
                        url = "".concat(this.site, "search?").concat(params.toString());
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url, { headers: this.headers })];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.text()];
                    case 2:
                        body = _a.sent();
                        loadedCheerio = (0, cheerio_1.load)(body);
                        return [2 /*return*/, this.parseNovels(loadedCheerio, '.novel-list.chapters .novel-item', page === 1)];
                }
            });
        });
    };
    return NovelPhoenix;
}());
exports.default = new NovelPhoenix();
