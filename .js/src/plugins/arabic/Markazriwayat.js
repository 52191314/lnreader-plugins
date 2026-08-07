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
var defaultCover_1 = require("@libs/defaultCover");
var novelStatus_1 = require("@libs/novelStatus");
var filterInputs_1 = require("@libs/filterInputs");
var Markazriwayat = /** @class */ (function () {
    function Markazriwayat() {
        this.id = 'markazriwayat';
        this.name = 'مركز الروايات';
        this.version = '1.0.0';
        this.icon = 'src/ar/markazriwayat/icon.png';
        this.site = 'https://markazriwayat.com/';
        this.filters = {
            order: {
                type: filterInputs_1.FilterTypes.Picker,
                label: 'الترتيب',
                value: 'popular',
                options: [
                    { label: 'الأكثر شعبية', value: 'popular' },
                    { label: 'الأحدث', value: 'new' },
                    { label: 'الأعلى تقييماً', value: 'rating' },
                ],
            },
        };
    }
    Markazriwayat.prototype.fetchHtml = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)(url)];
                    case 1:
                        res = _a.sent();
                        if (!res.ok)
                            throw new Error("Request failed: ".concat(res.status));
                        return [2 /*return*/, res.text()];
                }
            });
        });
    };
    Markazriwayat.prototype.parseNovelCards = function (html) {
        var _this = this;
        var $ = (0, cheerio_1.load)(html);
        var novels = [];
        var seen = new Set();
        $('a.lib-card').each(function (_, el) {
            var $el = $(el);
            var href = $el.attr('href') || '';
            var path = href.replace(_this.site, '').replace(/\/$/, '');
            var name = $el.find('.lib-card__title').text().trim();
            var cover = $el.find('img').attr('data-src') ||
                $el.find('img').attr('data-defer-src') ||
                defaultCover_1.defaultCover;
            if (name && path && !seen.has(path)) {
                seen.add(path);
                novels.push({ name: name, path: path, cover: cover });
            }
        });
        return novels;
    };
    Markazriwayat.prototype.popularNovels = function (page_1, _a) {
        return __awaiter(this, arguments, void 0, function (page, _b) {
            var url, html;
            var filters = _b.filters, showLatestNovels = _b.showLatestNovels;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        url = "".concat(this.site);
                        if (showLatestNovels) {
                            url += 'new/';
                        }
                        else {
                            url += "".concat(filters.order.value, "/");
                        }
                        if (page > 1)
                            url += "page/".concat(page, "/");
                        return [4 /*yield*/, this.fetchHtml(url)];
                    case 1:
                        html = _c.sent();
                        return [2 /*return*/, this.parseNovelCards(html)];
                }
            });
        });
    };
    Markazriwayat.prototype.searchNovels = function (searchTerm, page) {
        return __awaiter(this, void 0, void 0, function () {
            var apiUrl, res, data, _a, url, html, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 8]);
                        if (page > 1)
                            return [2 /*return*/, []];
                        apiUrl = "".concat(this.site, "wp-json/theam/v1/novel-search?term=").concat(encodeURIComponent(searchTerm), "&per_page=20");
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(apiUrl)];
                    case 1:
                        res = _c.sent();
                        if (!res.ok)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, res.json()];
                    case 2:
                        data = _c.sent();
                        return [2 /*return*/, (data.items || []).map(function (item) { return ({
                                name: item.title,
                                path: item.link.replace(_this.site, ''),
                                cover: item.cover || defaultCover_1.defaultCover,
                            }); })];
                    case 3:
                        _a = _c.sent();
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        url = "".concat(this.site, "library/?search=").concat(encodeURIComponent(searchTerm));
                        return [4 /*yield*/, this.fetchHtml(url)];
                    case 5:
                        html = _c.sent();
                        return [2 /*return*/, this.parseNovelCards(html)];
                    case 6:
                        _b = _c.sent();
                        return [2 /*return*/, []];
                    case 7: return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Markazriwayat.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var html, $, novel, coverImg, statusEl, statusClass, authorLink, genreParts, chapters, totalText, totalMatch, totalChapters, firstRow, firstLink, firstNum, escapedNum, basePath, basePathRelative, i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchHtml("".concat(this.site).concat(novelPath))];
                    case 1:
                        html = _a.sent();
                        $ = (0, cheerio_1.load)(html);
                        novel = {
                            path: novelPath,
                            name: $('h1').first().text().trim() || 'Untitled',
                            cover: defaultCover_1.defaultCover,
                            summary: '',
                            author: '',
                            status: novelStatus_1.NovelStatus.Unknown,
                            genres: '',
                            chapters: [],
                        };
                        coverImg = $('img')
                            .filter(function () {
                            var src = $(this).attr('data-src') || $(this).attr('src') || '';
                            return src.includes('wp-content/uploads') && !src.includes('cropped-');
                        })
                            .first();
                        novel.cover =
                            coverImg.attr('data-src') ||
                                coverImg.attr('data-defer-src') ||
                                defaultCover_1.defaultCover;
                        statusEl = $('.status-pill').first();
                        statusClass = statusEl.attr('class') || '';
                        if (statusClass.includes('is-ongoing'))
                            novel.status = novelStatus_1.NovelStatus.Ongoing;
                        else if (statusClass.includes('is-complete'))
                            novel.status = novelStatus_1.NovelStatus.Completed;
                        else if (statusClass.includes('is-stopped'))
                            novel.status = novelStatus_1.NovelStatus.OnHiatus;
                        authorLink = $('a[href*="/author/"]').first();
                        if (authorLink.length)
                            novel.author = authorLink.text().trim();
                        // Summary
                        novel.summary = $('#manga-summary').text().trim();
                        genreParts = [];
                        $('a.pill, a[href*="/genre/"], a[href*="/tasnif/"]').each(function (_, el) {
                            var t = $(el).text().trim();
                            if (t)
                                genreParts.push(t);
                        });
                        novel.genres = genreParts.join(', ');
                        chapters = [];
                        totalText = $('.manga-stat__value').last().text().trim();
                        totalMatch = totalText.match(/(\d+)/);
                        totalChapters = totalMatch ? parseInt(totalMatch[1], 10) : 0;
                        firstRow = $('div.ch-row').first();
                        firstLink = firstRow.find('a').first().attr('href') || '';
                        firstNum = firstRow.attr('data-ch-num') || '';
                        if (totalChapters > 0 && firstLink && firstNum) {
                            escapedNum = firstNum.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            basePath = firstLink.replace(new RegExp("".concat(escapedNum, "/?$")), '');
                            basePathRelative = basePath.replace(this.site, '');
                            for (i = 1; i <= totalChapters; i++) {
                                chapters.push({
                                    name: "\u0627\u0644\u0641\u0635\u0644 ".concat(i),
                                    path: basePathRelative + i + '/',
                                    chapterNumber: i,
                                });
                            }
                        }
                        else {
                            $('div.ch-row').each(function (_, el) {
                                var a = $(el).find('a').first();
                                var name = $(el).find('.ch-title').text().trim() || a.attr('aria-label') || '';
                                var href = a.attr('href') || '';
                                var date = $(el).find('.ch-date').text().trim();
                                var chNum = $(el).attr('data-ch-num') || '';
                                if (name && href) {
                                    chapters.push({
                                        name: name,
                                        path: href.replace(_this.site, ''),
                                        releaseTime: date || null,
                                        chapterNumber: chNum ? parseInt(chNum, 10) : chapters.length + 1,
                                    });
                                }
                            });
                        }
                        novel.chapters = chapters;
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    Markazriwayat.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var html, $, content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchHtml("".concat(this.site).concat(chapterPath))];
                    case 1:
                        html = _a.sent();
                        $ = (0, cheerio_1.load)(html);
                        $('script, style, .sharedaddy, .jp-relatedposts, .wp-block-spacer, .reading-nav, .ads, .advertisement, .nav-links, .comments-area').remove();
                        $('[style*="display:none"], [style*="display: none"], [hidden], .hidden').remove();
                        content = $('.reading-content, .entry-content, .chapter-content, .text-left')
                            .first()
                            .html() || '';
                        return [2 /*return*/, content || '<p>المحتوى غير متاح.</p>'];
                }
            });
        });
    };
    return Markazriwayat;
}());
exports.default = new Markazriwayat();
