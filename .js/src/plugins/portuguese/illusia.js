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
var fetch_1 = require("@libs/fetch");
var cheerio_1 = require("cheerio");
var novelStatus_1 = require("@libs/novelStatus");
var defaultCover_1 = require("@libs/defaultCover");
var Illusia = /** @class */ (function () {
    function Illusia() {
        this.id = 'illusia';
        this.name = 'Illusia';
        this.icon = 'src/pt-br/illusia/icon.png';
        this.site = 'https://illusia.com.br';
        this.version = '1.0.2';
        this.filters = undefined;
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        };
        // resolveUrl = (path: string, isNovel?: boolean) => `${this.site}/${path}/`;
    }
    Illusia.prototype.popularNovels = function (pageNo_1, _a) {
        return __awaiter(this, arguments, void 0, function (pageNo, _b) {
            var orderBy, pagePath, url, req, body, loadedCheerio, novels, uniqueNovels;
            var _this = this;
            var showLatestNovels = _b.showLatestNovels;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        orderBy = showLatestNovels ? 'modified' : 'comment_count';
                        pagePath = pageNo === 1 ? '' : "page/".concat(pageNo, "/");
                        url = "".concat(this.site, "/").concat(pagePath, "?s=&post_type=fcn_story&sentence=0&orderby=").concat(orderBy, "&order=desc&age_rating=Any&story_status=Any&miw=0&maw=0&genres=&fandoms=&characters=&tags=&warnings=&authors=&ex_genres=&ex_fandoms=&ex_characters=&ex_tags=&ex_warnings=&ex_authors=");
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url, { headers: this.headers })];
                    case 1:
                        req = _c.sent();
                        return [4 /*yield*/, req.text()];
                    case 2:
                        body = _c.sent();
                        loadedCheerio = (0, cheerio_1.load)(body);
                        novels = loadedCheerio('#search-result-list > li, article.story, article.post, .card, .story-card, .ranking-item, ul.ranking-list li, .bsx, .book-item, .fcn-story')
                            .map(function (i, el) {
                            var item = loadedCheerio(el);
                            var titleEl = item
                                .find('.card__title a, h2 a, h3 a, h4 a, .card-title a, .story-title a, .story__title a, .ranking-title a, .entry-title a, .tt')
                                .first();
                            var novelName = titleEl.text().trim();
                            var novelUrl = titleEl.attr('href') || item.find('a').first().attr('href');
                            var novelCover = item.find('img').attr('data-src') ||
                                item.find('img').attr('data-lazy-src') ||
                                item.find('img').attr('src') ||
                                item.find('.ranking-cover, .story-cover, .img-cover').attr('data-bg');
                            if (!novelCover) {
                                var bgElement = item.find('[style*="url("]');
                                var styleAttr = bgElement.length
                                    ? bgElement.attr('style')
                                    : item.attr('style');
                                if (styleAttr) {
                                    var match = styleAttr.match(/url\(['"]?([^'"]+)['"]?\)/i);
                                    if (match)
                                        novelCover = match[1];
                                }
                            }
                            if (!novelName || !novelUrl)
                                return null;
                            if (novelCover && novelCover.startsWith('/')) {
                                novelCover = _this.site + novelCover;
                            }
                            return {
                                name: novelName,
                                cover: novelCover || defaultCover_1.defaultCover,
                                path: novelUrl
                                    .replace(_this.site, '')
                                    .replace(/^\//, '')
                                    .replace(/\/$/, ''),
                            };
                        })
                            .toArray()
                            .filter(function (novel) { return novel !== null; });
                        uniqueNovels = Array.from(new Map(novels.map(function (item) { return [item.path, item]; })).values());
                        return [2 /*return*/, uniqueNovels];
                }
            });
        });
    };
    Illusia.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var req, body, loadedCheerio, novel, author, metaText, summaryHtml, chapterElements, metaBlockText, metaParts, statusText;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)("".concat(this.site, "/").concat(novelPath, "/"), {
                            headers: this.headers,
                        })];
                    case 1:
                        req = _a.sent();
                        return [4 /*yield*/, req.text()];
                    case 2:
                        body = _a.sent();
                        loadedCheerio = (0, cheerio_1.load)(body);
                        novel = {
                            path: novelPath,
                            name: loadedCheerio('h1.story__identity-title, h1.post-title')
                                .text()
                                .trim(),
                        };
                        author = loadedCheerio('span.custom-story-info a.author, a[href*="/author/"], a[rel="author"]')
                            .first()
                            .text()
                            .trim() ||
                            loadedCheerio('.story__author, .story-author, .author-name, .post-author, [class*="__author"]')
                                .first()
                                .text()
                                .trim();
                        if (!author) {
                            metaText = loadedCheerio('.story__identity-meta, .story-meta, .custom-story-info')
                                .text()
                                .trim();
                            if (metaText) {
                                author = metaText
                                    .split('|')[0]
                                    .replace(/^(Autor[a]?|Por|Author|by)[\s:]*/i, '')
                                    .trim();
                            }
                        }
                        novel.author = author || 'Desconhecido';
                        novel.cover =
                            loadedCheerio('figure.story__thumbnail img').attr('data-src') ||
                                loadedCheerio('figure.story__thumbnail img').attr('src') ||
                                loadedCheerio('.story__thumbnail img').attr('data-src') ||
                                loadedCheerio('.story__thumbnail img').attr('src') ||
                                loadedCheerio('figure.story__thumbnail > a').attr('href') ||
                                defaultCover_1.defaultCover;
                        novel.genres = loadedCheerio('div.tag-group > a, section.tag-group > a, .genres a')
                            .map(function (i, el) { return loadedCheerio(el).text().trim(); })
                            .toArray()
                            .join(',');
                        summaryHtml = loadedCheerio('section.story__summary, div.story__summary, .summary').html() || '';
                        summaryHtml = summaryHtml
                            .replace(/<br\s*\/?>/gi, '\n')
                            .replace(/<\/p>/gi, '\n\n')
                            .replace(/<\/div>/gi, '\n');
                        novel.summary = (0, cheerio_1.load)(summaryHtml)
                            .text()
                            .trim()
                            .replace(/\n{3,}/g, '\n\n');
                        chapterElements = loadedCheerio('li.chapter-group__list-item, ul.chapter-list li, .chapters li, .chapter-item');
                        novel.chapters = chapterElements
                            .map(function (i, el) {
                            var item = loadedCheerio(el);
                            var aTag = item.find('a').first();
                            var chapterName = aTag.text().trim();
                            var chapterUrl = aTag.attr('href');
                            if (!chapterUrl)
                                return null;
                            var chapterNumberMatch = chapterName.match(/(?:cap[íi]tulo|cap\.?|ch\.?)\s*(\d+(\.\d+)?)/i) ||
                                chapterName.match(/^(\d+(\.\d+)?)/);
                            var chapterNumber = chapterNumberMatch
                                ? Number(chapterNumberMatch[1])
                                : undefined;
                            var chapter = {
                                name: chapterName,
                                path: chapterUrl
                                    .replace(_this.site, '')
                                    .replace(/^\//, '')
                                    .replace(/\/$/, ''),
                            };
                            if (chapterNumber !== undefined) {
                                chapter.chapterNumber = chapterNumber;
                            }
                            return chapter;
                        })
                            .toArray()
                            .filter(function (chapter) { return chapter !== null; });
                        metaBlockText = loadedCheerio('div.story__identity-meta, .story-meta').text() || '';
                        metaParts = metaBlockText.split('|').map(function (p) { return p.trim(); });
                        statusText = loadedCheerio('span.story__status')
                            .text()
                            .trim()
                            .toLowerCase();
                        if (!statusText && metaParts.length > 1) {
                            statusText = metaBlockText.toLowerCase();
                        }
                        if (statusText.includes('ongoing') ||
                            statusText.includes('andamento') ||
                            statusText.includes('lançando') ||
                            statusText.includes('ativa'))
                            novel.status = novelStatus_1.NovelStatus.Ongoing;
                        else if (statusText.includes('completed') ||
                            statusText.includes('completo'))
                            novel.status = novelStatus_1.NovelStatus.Completed;
                        else if (statusText.includes('cancelled') ||
                            statusText.includes('cancelado') ||
                            statusText.includes('dropado'))
                            novel.status = novelStatus_1.NovelStatus.Cancelled;
                        else if (statusText.includes('hiatus') ||
                            statusText.includes('hiato') ||
                            statusText.includes('pausado'))
                            novel.status = novelStatus_1.NovelStatus.OnHiatus;
                        else
                            novel.status = novelStatus_1.NovelStatus.Unknown;
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    Illusia.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var req, body, loadedCheerio, chapterContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)("".concat(this.site, "/").concat(chapterPath, "/"), {
                            headers: this.headers,
                        })];
                    case 1:
                        req = _a.sent();
                        return [4 /*yield*/, req.text()];
                    case 2:
                        body = _a.sent();
                        loadedCheerio = (0, cheerio_1.load)(body);
                        chapterContent = loadedCheerio('section#chapter-content > div, div.chapter-content');
                        chapterContent
                            .find('script, style, iframe, .patreon-popup, .fcn-notice, .fictioneer-notice, div.card')
                            .remove();
                        return [2 /*return*/, chapterContent.html() || ''];
                }
            });
        });
    };
    Illusia.prototype.searchNovels = function (searchTerm, pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var pagePath, url, req, body, loadedCheerio, novels, uniqueNovels;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pagePath = pageNo === 1 ? '' : "page/".concat(pageNo, "/");
                        url = "".concat(this.site, "/").concat(pagePath, "?s=").concat(encodeURIComponent(searchTerm), "&post_type=fcn_story&sentence=0&orderby=relevance&order=desc&age_rating=Any&story_status=Any&miw=0&maw=0&genres=&fandoms=&characters=&tags=&warnings=&authors=&ex_genres=&ex_fandoms=&ex_characters=&ex_tags=&ex_warnings=&ex_authors=");
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url, { headers: this.headers })];
                    case 1:
                        req = _a.sent();
                        return [4 /*yield*/, req.text()];
                    case 2:
                        body = _a.sent();
                        loadedCheerio = (0, cheerio_1.load)(body);
                        novels = loadedCheerio('#search-result-list > li, article.story, article.post, .card, .story-card, .ranking-item, ul.ranking-list li, .bsx, .book-item, .fcn-story')
                            .map(function (i, el) {
                            var item = loadedCheerio(el);
                            var titleEl = item
                                .find('.card__title a, h2 a, h3 a, h4 a, .card-title a, .story-title a, .story__title a, .ranking-title a, .entry-title a, .tt')
                                .first();
                            var novelName = titleEl.text().trim();
                            var novelUrl = titleEl.attr('href') || item.find('a').first().attr('href');
                            var novelCover = item.find('img').attr('data-src') ||
                                item.find('img').attr('data-lazy-src') ||
                                item.find('img').attr('src') ||
                                item.find('.ranking-cover, .story-cover, .img-cover').attr('data-bg');
                            if (!novelCover) {
                                var bgElement = item.find('[style*="url("]');
                                var styleAttr = bgElement.length
                                    ? bgElement.attr('style')
                                    : item.attr('style');
                                if (styleAttr) {
                                    var match = styleAttr.match(/url\(['"]?([^'"]+)['"]?\)/i);
                                    if (match)
                                        novelCover = match[1];
                                }
                            }
                            if (!novelName || !novelUrl)
                                return null;
                            if (novelCover && novelCover.startsWith('/')) {
                                novelCover = _this.site + novelCover;
                            }
                            return {
                                name: novelName,
                                cover: novelCover || defaultCover_1.defaultCover,
                                path: novelUrl
                                    .replace(_this.site, '')
                                    .replace(/^\//, '')
                                    .replace(/\/$/, ''),
                            };
                        })
                            .toArray()
                            .filter(function (novel) { return novel !== null; });
                        uniqueNovels = Array.from(new Map(novels.map(function (item) { return [item.path, item]; })).values());
                        return [2 /*return*/, uniqueNovels];
                }
            });
        });
    };
    return Illusia;
}());
exports.default = new Illusia();
