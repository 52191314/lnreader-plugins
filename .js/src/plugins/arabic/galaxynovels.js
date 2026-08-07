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
var GalaxyNovels = /** @class */ (function () {
    function GalaxyNovels() {
        this.id = 'galaxynovels';
        this.name = 'Galaxy Novels';
        this.version = '1.1.0';
        this.icon = 'src/ar/galaxynovels/icon.png';
        this.site = 'https://galaxynovels.com/';
        this.filters = {
            sort: {
                label: 'Sort By',
                value: 'popular',
                options: [
                    { label: 'Most Popular', value: 'popular' },
                    { label: 'Newest', value: 'new' },
                    { label: 'Recently Updated', value: 'recent' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            period: {
                label: 'Period',
                value: 'month',
                options: [
                    { label: 'Month', value: 'month' },
                    { label: 'Week', value: 'week' },
                    { label: 'All Time', value: 'all' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
        };
        this.baseUrl = 'https://galaxynovels.com';
    }
    GalaxyNovels.prototype.fetchHtml = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)(url)];
                    case 1:
                        res = _a.sent();
                        if (!res.ok) {
                            throw new Error("Could not reach site (".concat(res.status, ")"));
                        }
                        return [2 /*return*/, res.text()];
                }
            });
        });
    };
    GalaxyNovels.prototype.fetchJson = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)(url)];
                    case 1:
                        res = _a.sent();
                        if (!res.ok) {
                            throw new Error("Could not reach site (".concat(res.status, ")"));
                        }
                        return [2 /*return*/, res.json()];
                }
            });
        });
    };
    GalaxyNovels.prototype.popularNovels = function (pageNo_1, _a) {
        return __awaiter(this, arguments, void 0, function (pageNo, _b) {
            var sort, period, url, html, $, novels;
            var _this = this;
            var showLatestNovels = _b.showLatestNovels, filters = _b.filters;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        sort = showLatestNovels ? 'new' : filters.sort.value;
                        period = filters.period.value;
                        if (sort === 'new') {
                            url = "".concat(this.baseUrl, "/novels/?sort=new&page=").concat(pageNo);
                        }
                        else if (sort === 'recent') {
                            url = "".concat(this.baseUrl, "/recent/?page=").concat(pageNo);
                        }
                        else {
                            url = "".concat(this.baseUrl, "/novels/?sort=popular&period=").concat(period, "&page=").concat(pageNo);
                        }
                        return [4 /*yield*/, this.fetchHtml(url)];
                    case 1:
                        html = _c.sent();
                        $ = (0, cheerio_1.load)(html);
                        novels = [];
                        $('article.wor-novel-card').each(function (_, el) {
                            var $el = $(el);
                            var coverLink = $el.find('a.wor-novel-card__cover');
                            var href = coverLink.attr('href');
                            var img = $el.find('img.wor-cover-img');
                            var cover = img.attr('data-src') || img.attr('src') || undefined;
                            var title = $el.find('h3 a').text().trim();
                            if (!href || !title)
                                return;
                            var path = new URL(href, _this.site).pathname;
                            novels.push({
                                name: title,
                                path: path,
                                cover: cover,
                            });
                        });
                        return [2 /*return*/, novels];
                }
            });
        });
    };
    GalaxyNovels.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var url, html, $, title, img, cover, author, summary, genres, statusText, statusMap, status, chaptersContainer, chaptersIndexUrl, chapters, indexUrl, index, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        url = "".concat(this.baseUrl).concat(novelPath);
                        return [4 /*yield*/, this.fetchHtml(url)];
                    case 1:
                        html = _b.sent();
                        $ = (0, cheerio_1.load)(html);
                        title = $('h1').first().text().trim();
                        img = $('img.wor-cover-img').first();
                        cover = img.attr('data-src') || img.attr('src');
                        author = $('p.wor-single-hero__meta-text span').text().trim();
                        summary = $('.wor-single-summary__text').text().trim();
                        genres = [];
                        $('a.wor-tag-pill').each(function (_, el) {
                            genres.push($(el).text().trim());
                        });
                        statusText = $('span.wor-cover-status').text().trim();
                        statusMap = {
                            'مستمرة': novelStatus_1.NovelStatus.Ongoing,
                            'مكتملة': novelStatus_1.NovelStatus.Completed,
                            'متوقفة': novelStatus_1.NovelStatus.OnHiatus,
                        };
                        status = statusMap[statusText] || novelStatus_1.NovelStatus.Unknown;
                        chaptersContainer = $('[data-wor-chapters-container]');
                        chaptersIndexUrl = chaptersContainer.attr('data-index-url');
                        chapters = [];
                        if (!chaptersIndexUrl) return [3 /*break*/, 5];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        indexUrl = chaptersIndexUrl.startsWith('http')
                            ? chaptersIndexUrl
                            : "".concat(this.baseUrl).concat(chaptersIndexUrl);
                        return [4 /*yield*/, this.fetchJson(indexUrl)];
                    case 3:
                        index = _b.sent();
                        chapters = index.chapters.map(function (ch) {
                            var _a;
                            return ({
                                name: ch.label + (ch.title ? ": ".concat(ch.title) : ''),
                                path: "".concat(novelPath, "chapter-").concat(ch.id, "/"),
                                chapterNumber: ch.position,
                                releaseTime: ((_a = ch.date_iso) === null || _a === void 0 ? void 0 : _a.split('T')[0]) || '',
                            });
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        if (chapters.length === 0) {
                            $('article.wor-novel-chapter-item').each(function (_, el) {
                                var _a;
                                var $el = $(el);
                                var chapterLink = $el.find('h3 a').attr('href') || $el.find('a.wor-novel-chapter-item__num').attr('href');
                                var chapterName = $el.find('h3 a').text().trim() || $el.find('a.wor-novel-chapter-item__num').text().trim();
                                var chapterId = $el.attr('data-chapter-id');
                                var timeEl = $el.find('time');
                                var releaseTime = ((_a = timeEl.attr('datetime')) === null || _a === void 0 ? void 0 : _a.split('T')[0]) || '';
                                if (!chapterLink)
                                    return;
                                var path = chapterId
                                    ? "".concat(novelPath, "chapter-").concat(chapterId, "/")
                                    : new URL(chapterLink, _this.site).pathname;
                                var numMatch = path.match(/chapter-(\d+)/);
                                var chapterNumber = numMatch ? parseInt(numMatch[1]) : 0;
                                chapters.push({
                                    name: chapterName,
                                    path: path,
                                    chapterNumber: chapterNumber,
                                    releaseTime: releaseTime,
                                });
                            });
                        }
                        return [2 /*return*/, {
                                path: novelPath,
                                name: title,
                                cover: cover,
                                author: author || 'Unknown',
                                genres: genres.join(', '),
                                summary: summary,
                                status: status,
                                chapters: chapters,
                            }];
                }
            });
        });
    };
    GalaxyNovels.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var idMatch, chapterId, apiUrl, response, _a, url, html, $, content;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        idMatch = chapterPath.match(/chapter-(\d+)/);
                        chapterId = idMatch === null || idMatch === void 0 ? void 0 : idMatch[1];
                        if (!chapterId) return [3 /*break*/, 4];
                        apiUrl = "".concat(this.baseUrl, "/wp-json/wor-reader-app/v1/chapters/").concat(chapterId);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.fetchJson(apiUrl)];
                    case 2:
                        response = _c.sent();
                        if ((_b = response.data) === null || _b === void 0 ? void 0 : _b.content_html) {
                            return [2 /*return*/, response.data.content_html];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _c.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        url = "".concat(this.baseUrl).concat(chapterPath);
                        return [4 /*yield*/, this.fetchHtml(url)];
                    case 5:
                        html = _c.sent();
                        $ = (0, cheerio_1.load)(html);
                        content = $('article.wor-chapter-content, .wor-chapter-text, .entry-content').html();
                        return [2 /*return*/, content || '<p>Content not available.</p>'];
                }
            });
        });
    };
    GalaxyNovels.prototype.searchNovels = function (searchTerm, pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var manifestUrl, manifest, searchIndex, term, filtered, limit, offset;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        manifestUrl = 'https://galaxynovels.com/wp-content/uploads/wor-reader-cache/search/manifest.json';
                        return [4 /*yield*/, this.fetchJson(manifestUrl)];
                    case 1:
                        manifest = _a.sent();
                        return [4 /*yield*/, this.fetchJson(manifest.index)];
                    case 2:
                        searchIndex = _a.sent();
                        term = searchTerm.toLowerCase();
                        filtered = searchIndex.items.filter(function (n) {
                            return n.t.toLowerCase().includes(term) ||
                                n.s.toLowerCase().includes(term);
                        });
                        limit = 20;
                        offset = (pageNo - 1) * limit;
                        return [2 /*return*/, filtered.slice(offset, offset + limit).map(function (novel) { return ({
                                name: novel.t,
                                path: novel.u,
                                cover: novel.c.startsWith('http')
                                    ? novel.c
                                    : "".concat(_this.baseUrl).concat(novel.c),
                            }); })];
                }
            });
        });
    };
    return GalaxyNovels;
}());
exports.default = new GalaxyNovels();
