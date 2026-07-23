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
exports.LightNovelWorldPlugin = void 0;
var fetch_1 = require("@libs/fetch");
var cheerio_1 = require("cheerio");
var novelStatus_1 = require("@libs/novelStatus");
var LightNovelWorldPlugin = /** @class */ (function () {
    function LightNovelWorldPlugin() {
        this.id = "lightnovelworld";
        this.name = "LightNovelWorld";
        this.icon = "src/en/lightnovelworld/icon.png";
        this.site = "https://lightnovelworld.org";
        this.version = "1.0.1";
    }
    LightNovelWorldPlugin.prototype.popularNovels = function (pageNo, options) {
        return __awaiter(this, void 0, void 0, function () {
            var page, order, url, html;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = Math.max(1, pageNo || 1);
                        order = (options && options.showLatestNovels) ? 'updates' : 'popular';
                        url = "".concat(this.site, "/genre-all/?order=").concat(order, "&page=").concat(page);
                        return [4 /*yield*/, (0, fetch_1.fetchText)(url)];
                    case 1:
                        html = _a.sent();
                        return [2 /*return*/, this.parseNovelList(html)];
                }
            });
        });
    };
    LightNovelWorldPlugin.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullUrl, html, $, title, imgEl, rawCover, cover, summary, author, rawStatus, status, genres, chapters, chapterEls;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullUrl = novelPath.startsWith('http')
                            ? novelPath
                            : "".concat(this.site).concat(novelPath.startsWith('/') ? '' : '/').concat(novelPath);
                        return [4 /*yield*/, (0, fetch_1.fetchText)(fullUrl)];
                    case 1:
                        html = _a.sent();
                        $ = (0, cheerio_1.load)(html);
                        title = $('.novel-title, h1.title, .novel-name, h1, .book-title').first().text().trim() || 'Untitled Novel';
                        imgEl = $('.cover img, .novel-cover img, .book-cover img, img.cover, .card-cover img').first();
                        rawCover = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';
                        cover = rawCover.startsWith('http')
                            ? rawCover
                            : "".concat(this.site).concat(rawCover.startsWith('/') ? '' : '/').concat(rawCover);
                        summary = $('.summary .content, .description, .novel-summary, .summary-content, .synopsis, .novel-desc').first().text().trim() || '';
                        author = $('.author a, .novel-author, .author-name').first().text().trim();
                        if (!author) {
                            author = $('.author').text().replace(/^author:\s*/i, '').trim() || 'Unknown Author';
                        }
                        rawStatus = $('.novel-status, .status-label, .status').first().text().trim().toLowerCase();
                        status = novelStatus_1.NovelStatus.Unknown;
                        if (rawStatus.includes('ongoing')) {
                            status = novelStatus_1.NovelStatus.Ongoing;
                        }
                        else if (rawStatus.includes('completed') || rawStatus.includes('complete')) {
                            status = novelStatus_1.NovelStatus.Completed;
                        }
                        else if (rawStatus.includes('hiatus') || rawStatus.includes('paused')) {
                            status = novelStatus_1.NovelStatus.OnHiatus;
                        }
                        genres = [];
                        $('.genres a, .categories a, .genre-item, .tags a, .genre-pill').each(function (_, el) {
                            var g = $(el).text().trim();
                            if (g && !genres.includes(g)) {
                                genres.push(g);
                            }
                        });
                        chapters = [];
                        chapterEls = $('.chapter-list li, ul.chapters li, .chapter-item');
                        if (chapterEls.length === 0) {
                            chapterEls = $('.chapter-list a, .chapters-list a');
                        }
                        chapterEls.each(function (idx, el) {
                            var item = $(el);
                            var linkEl = item.is('a') ? item : item.find('a').first();
                            var chapName = linkEl.find('.chapter-title, .title, span.name').text().trim() || linkEl.text().trim();
                            var chapPath = linkEl.attr('href') || '';
                            if (chapPath.startsWith(_this.site)) {
                                chapPath = chapPath.substring(_this.site.length);
                            }
                            var releaseTime = item.find('.chapter-time, .release-time, time, span.time').text().trim() || undefined;
                            if (chapName && chapPath) {
                                chapters.push({
                                    name: chapName,
                                    path: chapPath,
                                    releaseTime: releaseTime,
                                    chapterNumber: idx + 1,
                                });
                            }
                        });
                        return [2 /*return*/, {
                                path: novelPath,
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
            var fullUrl, html, $, container, content;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fullUrl = chapterPath.startsWith('http')
                            ? chapterPath
                            : "".concat(this.site).concat(chapterPath.startsWith('/') ? '' : '/').concat(chapterPath);
                        return [4 /*yield*/, (0, fetch_1.fetchText)(fullUrl)];
                    case 1:
                        html = _b.sent();
                        $ = (0, cheerio_1.load)(html);
                        container = $('#chapter-container, .chapter-content, #chapter-body, .chapter-text, .chr-c, #chr-content').first();
                        if (!container.length) {
                            return [2 /*return*/, '<p>No content found.</p>'];
                        }
                        container.find('script, style, ins, .ads, .ad-container, .ad-wrapper, .watermark, #ad-banner, iframe, .ad-box, .pub-ad').remove();
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
            var page, url, html;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!searchTerm || !searchTerm.trim())
                            return [2 /*return*/, []];
                        page = Math.max(1, pageNo || 1);
                        url = "".concat(this.site, "/search/?q=").concat(encodeURIComponent(searchTerm.trim()), "&page=").concat(page);
                        return [4 /*yield*/, (0, fetch_1.fetchText)(url)];
                    case 1:
                        html = _a.sent();
                        return [2 /*return*/, this.parseNovelList(html)];
                }
            });
        });
    };
    LightNovelWorldPlugin.prototype.parseNovelList = function (html) {
        var _this = this;
        var $ = (0, cheerio_1.load)(html);
        var novels = [];
        $('.recommendation-card, .boost-shelf-card, .novel-item, .novel-card').each(function (_, el) {
            var item = $(el);
            var linkEl = item.find("a[href*='/novel/']").first();
            var rawPath = linkEl.attr('href') || '';
            var titleEl = item.find('.card-title, .novel-title, .title, h3').first();
            var name = titleEl.text().trim() || linkEl.attr('title') || '';
            var imgEl = item.find('img.skel-img, .card-cover img, img').first();
            var rawCover = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';
            if (name && rawPath) {
                var cleanPath = rawPath;
                if (cleanPath.startsWith(_this.site)) {
                    cleanPath = cleanPath.substring(_this.site.length);
                }
                var cover = rawCover.startsWith('http')
                    ? rawCover
                    : "".concat(_this.site).concat(rawCover.startsWith('/') ? '' : '/').concat(rawCover);
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
