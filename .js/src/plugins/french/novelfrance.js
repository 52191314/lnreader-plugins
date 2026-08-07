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
var novelStatus_1 = require("@libs/novelStatus");
var filterInputs_1 = require("@libs/filterInputs");
var defaultCover_1 = require("@libs/defaultCover");
var PAGE_SIZE = 24;
var NovelFrancePlugin = /** @class */ (function () {
    function NovelFrancePlugin() {
        var _this = this;
        this.id = 'novelfrance';
        this.name = 'NovelFrance';
        this.icon = 'src/fr/novelfrance/icon.png';
        this.site = 'https://novelfrance.fr/';
        this.version = '1.0.0';
        this.resolveUrl = function (path) { return new URL("novel/".concat(path), _this.site).href; };
        this.filters = {
            genre: {
                type: filterInputs_1.FilterTypes.Picker,
                label: 'Genre',
                value: '',
                options: [
                    { label: 'Tous', value: '' },
                    { label: 'Action', value: 'action' },
                    { label: 'Adulte', value: 'adulte' },
                    { label: 'Anti-Héros', value: 'anti-h-ros' },
                    { label: 'Arts Martiaux', value: 'arts-martiaux' },
                    { label: 'Aventure', value: 'aventure' },
                    { label: 'Comédie', value: 'com-die' },
                    { label: 'Drame', value: 'drama' },
                    { label: 'Ecchi', value: 'ecchi' },
                    { label: 'Fantaisie', value: 'fantaisie' },
                    { label: 'Fantastique', value: 'fantastique' },
                    { label: 'Harem', value: 'harem' },
                    { label: 'Historique', value: 'historical' },
                    { label: 'Horreur', value: 'horreur' },
                    { label: 'Isekai', value: 'isekai' },
                    { label: 'Josei', value: 'josei' },
                    { label: 'Magie', value: 'magie' },
                    { label: 'Mature', value: 'mature' },
                    { label: 'Mécha', value: 'mcha' },
                    { label: 'Mystère', value: 'myst-re' },
                    { label: 'Psychologique', value: 'psychologique' },
                    { label: 'Réincarnation', value: 'r-incarnation' },
                    { label: 'Romance', value: 'romance' },
                    { label: 'School Life', value: 'school-life' },
                    { label: 'Sci-fi', value: 'sci-fi' },
                    { label: 'Seinen', value: 'seinen' },
                    { label: 'Shounen', value: 'shounen' },
                    { label: 'Slice of Life', value: 'slice-of-life' },
                    { label: 'Sport', value: 'sport' },
                    { label: 'Surnaturel', value: 'surnaturel' },
                    { label: 'Système', value: 'syst-me' },
                    { label: 'Thriller', value: 'thriller' },
                    { label: 'Tragédie', value: 'trag-die' },
                    { label: 'Transmigration', value: 'transmigration' },
                    { label: 'Wuxia', value: 'wuxia' },
                    { label: 'Xianxia', value: 'xianxia' },
                    { label: 'Xuanhuan', value: 'xuanhuan' },
                    { label: 'Yaoi', value: 'yaoi' },
                    { label: 'Yuri', value: 'yuri' },
                ],
            },
            status: {
                type: filterInputs_1.FilterTypes.Picker,
                label: 'Statut',
                value: '',
                options: [
                    { label: 'Tous', value: '' },
                    { label: 'En cours', value: 'ONGOING' },
                    { label: 'Terminé', value: 'COMPLETED' },
                    { label: 'En pause', value: 'HIATUS' },
                    { label: 'Abandonné', value: 'DROPPED' },
                ],
            },
        };
    }
    NovelFrancePlugin.prototype.fetchJson = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)(url)];
                    case 1:
                        r = _a.sent();
                        if (!r.ok)
                            throw new Error('Failed to load page (open in web view)');
                        return [4 /*yield*/, r.json()];
                    case 2: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    NovelFrancePlugin.prototype.buildCoverUrl = function (coverImage) {
        if (!coverImage)
            return defaultCover_1.defaultCover;
        return new URL(coverImage, this.site).href;
    };
    NovelFrancePlugin.prototype.mapStatus = function (apiStatus) {
        switch (apiStatus) {
            case 'ONGOING':
                return novelStatus_1.NovelStatus.Ongoing;
            case 'COMPLETED':
                return novelStatus_1.NovelStatus.Completed;
            case 'HIATUS':
                return novelStatus_1.NovelStatus.OnHiatus;
            case 'DROPPED':
                return novelStatus_1.NovelStatus.Cancelled;
            default:
                return novelStatus_1.NovelStatus.Unknown;
        }
    };
    NovelFrancePlugin.prototype.fetchChapterList = function (novelSlug) {
        return __awaiter(this, void 0, void 0, function () {
            var TAKE, MAX_CALLS, chapters, i, skip, url, data, list, _i, list_1, c, number, title, name_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        TAKE = 100;
                        MAX_CALLS = 100;
                        chapters = [];
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < MAX_CALLS)) return [3 /*break*/, 4];
                        skip = i * TAKE;
                        url = "".concat(this.site, "api/chapters/").concat(novelSlug, "?skip=").concat(skip, "&take=").concat(TAKE, "&order=asc");
                        return [4 /*yield*/, this.fetchJson(url)];
                    case 2:
                        data = _b.sent();
                        list = data.chapters || [];
                        for (_i = 0, list_1 = list; _i < list_1.length; _i++) {
                            c = list_1[_i];
                            number = (_a = c.chapterNumber) !== null && _a !== void 0 ? _a : 0;
                            title = (c.title || '').trim();
                            name_1 = title
                                ? "Chapitre ".concat(number, " - ").concat(title)
                                : "Chapitre ".concat(number);
                            chapters.push({
                                name: name_1,
                                path: "".concat(novelSlug, "/").concat(c.slug),
                                chapterNumber: number,
                                releaseTime: c.createdAt || undefined,
                            });
                        }
                        if (data.hasMore === false)
                            return [3 /*break*/, 4];
                        if (list.length < TAKE)
                            return [3 /*break*/, 4];
                        _b.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        chapters.sort(function (a, b) { var _a, _b; return ((_a = a.chapterNumber) !== null && _a !== void 0 ? _a : 0) - ((_b = b.chapterNumber) !== null && _b !== void 0 ? _b : 0); });
                        return [2 /*return*/, chapters];
                }
            });
        });
    };
    NovelFrancePlugin.prototype.popularNovels = function (pageNo_1, _a) {
        return __awaiter(this, arguments, void 0, function (pageNo, _b) {
            var params_1, data_1, params, genre, status, data;
            var _this = this;
            var _c, _d;
            var filters = _b.filters, showLatestNovels = _b.showLatestNovels;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!showLatestNovels) return [3 /*break*/, 2];
                        params_1 = new URLSearchParams({
                            offset: String((pageNo - 1) * PAGE_SIZE),
                            limit: String(PAGE_SIZE),
                        });
                        return [4 /*yield*/, this.fetchJson("".concat(this.site, "api/chapters/latest-home?").concat(params_1.toString()))];
                    case 1:
                        data_1 = _e.sent();
                        return [2 /*return*/, (data_1.data || []).map(function (n) { return ({
                                name: n.title,
                                path: n.slug,
                                cover: _this.buildCoverUrl(n.coverImage),
                            }); })];
                    case 2:
                        params = new URLSearchParams({
                            skip: String((pageNo - 1) * PAGE_SIZE),
                            take: String(PAGE_SIZE),
                        });
                        genre = (_c = filters === null || filters === void 0 ? void 0 : filters.genre) === null || _c === void 0 ? void 0 : _c.value;
                        if (typeof genre === 'string' && genre)
                            params.set('genres', genre);
                        status = (_d = filters === null || filters === void 0 ? void 0 : filters.status) === null || _d === void 0 ? void 0 : _d.value;
                        if (typeof status === 'string' && status)
                            params.set('status', status);
                        return [4 /*yield*/, this.fetchJson("".concat(this.site, "api/search?").concat(params.toString()))];
                    case 3:
                        data = _e.sent();
                        return [2 /*return*/, (data.novels || []).map(function (n) { return ({
                                name: n.title,
                                path: n.slug,
                                cover: _this.buildCoverUrl(n.coverImage),
                            }); })];
                }
            });
        });
    };
    NovelFrancePlugin.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var data, novel, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.fetchJson("".concat(this.site, "api/novels/").concat(novelPath))];
                    case 1:
                        data = _c.sent();
                        novel = {
                            path: novelPath,
                            name: data.title || 'Untitled',
                            cover: this.buildCoverUrl(data.coverImage),
                            summary: data.description || undefined,
                            author: data.author || undefined,
                            artist: data.translatorName || undefined,
                            genres: ((_b = data.genres) === null || _b === void 0 ? void 0 : _b.map(function (g) { return g.name; }).join(',')) || undefined,
                            status: this.mapStatus(data.status || undefined),
                        };
                        _a = novel;
                        return [4 /*yield*/, this.fetchChapterList(novelPath)];
                    case 2:
                        _a.chapters = _c.sent();
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    NovelFrancePlugin.prototype.escapeHtml = function (s) {
        return s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };
    NovelFrancePlugin.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var data, title, parts, _i, _a, p, content;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.fetchJson("".concat(this.site, "api/chapters/").concat(chapterPath))];
                    case 1:
                        data = _b.sent();
                        title = data.title || '';
                        parts = [];
                        if (title)
                            parts.push("<h1>".concat(this.escapeHtml(title), "</h1>"));
                        for (_i = 0, _a = data.paragraphs || []; _i < _a.length; _i++) {
                            p = _a[_i];
                            if (title && p.index === 0)
                                continue;
                            content = (p.content || '').trim();
                            if (!content)
                                continue;
                            parts.push("<p>".concat(this.escapeHtml(content), "</p>"));
                        }
                        return [2 /*return*/, parts.join('')];
                }
            });
        });
    };
    NovelFrancePlugin.prototype.searchNovels = function (searchTerm, pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var params, data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = new URLSearchParams({
                            q: searchTerm,
                            skip: String((pageNo - 1) * PAGE_SIZE),
                            take: String(PAGE_SIZE),
                        });
                        return [4 /*yield*/, this.fetchJson("".concat(this.site, "api/search?").concat(params.toString()))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, (data.novels || []).map(function (n) { return ({
                                name: n.title,
                                path: n.slug,
                                cover: _this.buildCoverUrl(n.coverImage),
                            }); })];
                }
            });
        });
    };
    return NovelFrancePlugin;
}());
exports.default = new NovelFrancePlugin();
