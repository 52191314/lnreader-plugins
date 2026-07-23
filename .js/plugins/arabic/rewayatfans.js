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
var RewayatFans = /** @class */ (function () {
    function RewayatFans() {
        this.id = 'rewayatfans';
        this.name = 'روايات فانز';
        this.version = '4.2.0';
        this.icon = 'src/ar/rewayatfans/icon.png';
        this.site = 'https://rewayatfans.com/';
    }
    RewayatFans.prototype.fetchJson = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)(url)];
                    case 1:
                        res = _a.sent();
                        if (!res.ok)
                            throw new Error("Request failed: ".concat(res.status));
                        return [2 /*return*/, res.json()];
                }
            });
        });
    };
    RewayatFans.prototype.fetchHtml = function (url) {
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
    RewayatFans.prototype.getCover = function (page) {
        var _a, _b, _c;
        return ((_c = (_b = (_a = page._embedded) === null || _a === void 0 ? void 0 : _a['wp:featuredmedia']) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.source_url) || '';
    };
    RewayatFans.prototype.popularNovels = function (page_1, _a) {
        return __awaiter(this, arguments, void 0, function (page, _b) {
            var pages, seen, novels, _i, pages_1, p, novelName;
            var showLatestNovels = _b.showLatestNovels;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.fetchJson("".concat(this.site, "wp-json/wp/v2/pages?per_page=20&page=").concat(page, "&orderby=date&order=desc&_embed"))];
                    case 1:
                        pages = _c.sent();
                        seen = new Set();
                        novels = [];
                        for (_i = 0, pages_1 = pages; _i < pages_1.length; _i++) {
                            p = pages_1[_i];
                            novelName = this.extractNovelName(p.title.rendered);
                            if (novelName && !seen.has(novelName)) {
                                seen.add(novelName);
                                novels.push({
                                    name: novelName,
                                    path: p.slug,
                                    cover: this.getCover(p),
                                });
                            }
                        }
                        return [2 /*return*/, novels];
                }
            });
        });
    };
    RewayatFans.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var novel, slugBase, novelPrefix, searchName, normalize, normalizedSearch, pg, hasMore, pages, _i, pages_2, p, normalizedTitle, numMatch, chapterNum;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        novel = {
                            path: novelPath,
                            name: '',
                            chapters: [],
                        };
                        slugBase = novelPath.replace(/\/$/, '').split('/').pop() || novelPath;
                        novelPrefix = slugBase.replace(/-\d+$/, '');
                        searchName = novelPrefix.replace(/-/g, ' ');
                        normalize = function (s) {
                            return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
                        };
                        normalizedSearch = normalize(searchName);
                        pg = 1;
                        hasMore = true;
                        _a.label = 1;
                    case 1:
                        if (!hasMore) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.fetchJson("".concat(this.site, "wp-json/wp/v2/pages?search=").concat(encodeURIComponent(searchName), "&per_page=100&page=").concat(pg, "&_fields=slug,title,date"))];
                    case 2:
                        pages = _a.sent();
                        if (pages.length === 0) {
                            hasMore = false;
                            return [3 /*break*/, 3];
                        }
                        for (_i = 0, pages_2 = pages; _i < pages_2.length; _i++) {
                            p = pages_2[_i];
                            normalizedTitle = normalize(p.title.rendered);
                            if (p.slug.startsWith(novelPrefix) ||
                                normalizedTitle.startsWith(normalizedSearch)) {
                                if (!novel.name) {
                                    novel.name = this.extractNovelName(p.title.rendered);
                                }
                                numMatch = p.title.rendered.match(/(\d+)\s*$/);
                                chapterNum = numMatch ? parseInt(numMatch[1], 10) : 0;
                                novel.chapters.push({
                                    name: p.title.rendered,
                                    path: p.slug,
                                    chapterNumber: chapterNum,
                                    releaseTime: p.date,
                                });
                            }
                        }
                        if (pages.length < 100)
                            hasMore = false;
                        pg++;
                        return [3 /*break*/, 1];
                    case 3:
                        novel.chapters.sort(function (a, b) { return (a.chapterNumber || 0) - (b.chapterNumber || 0); });
                        if (!novel.name && novel.chapters.length > 0) {
                            novel.name = this.extractNovelName(novel.chapters[0].name);
                        }
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    RewayatFans.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var pages, arr, $_1, html, $, content;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.fetchJson("".concat(this.site, "wp-json/wp/v2/pages?slug=").concat(chapterPath, "&_fields=content"))];
                    case 1:
                        pages = _b.sent();
                        arr = Array.isArray(pages) ? pages : [pages];
                        if (arr.length > 0 && ((_a = arr[0].content) === null || _a === void 0 ? void 0 : _a.rendered)) {
                            $_1 = (0, cheerio_1.load)(arr[0].content.rendered);
                            $_1('script, style, .sharedaddy, .jp-relatedposts, .wp-block-spacer').remove();
                            return [2 /*return*/, $_1.html()];
                        }
                        return [4 /*yield*/, this.fetchHtml("".concat(this.site).concat(chapterPath, "/"))];
                    case 2:
                        html = _b.sent();
                        $ = (0, cheerio_1.load)(html);
                        content = $('article .entry-content, .post-content, .entry-content').html() || '';
                        return [2 /*return*/, content || '<p>المحتوى غير متاح.</p>'];
                }
            });
        });
    };
    RewayatFans.prototype.searchNovels = function (searchTerm, page) {
        return __awaiter(this, void 0, void 0, function () {
            var pages, seen, novels, _i, pages_3, p, novelName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchJson("".concat(this.site, "wp-json/wp/v2/pages?search=").concat(encodeURIComponent(searchTerm), "&per_page=20&page=").concat(page, "&_embed"))];
                    case 1:
                        pages = _a.sent();
                        seen = new Set();
                        novels = [];
                        for (_i = 0, pages_3 = pages; _i < pages_3.length; _i++) {
                            p = pages_3[_i];
                            novelName = this.extractNovelName(p.title.rendered);
                            if (novelName && !seen.has(novelName)) {
                                seen.add(novelName);
                                novels.push({
                                    name: novelName,
                                    path: p.slug,
                                    cover: this.getCover(p),
                                });
                            }
                        }
                        return [2 /*return*/, novels];
                }
            });
        });
    };
    RewayatFans.prototype.extractNovelName = function (title) {
        var match = title.match(/^(.+?)\s+\d+$/);
        return match ? match[1].trim() : title.trim();
    };
    return RewayatFans;
}());
exports.default = new RewayatFans();
