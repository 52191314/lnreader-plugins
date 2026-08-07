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
var Seanovel = /** @class */ (function () {
    function Seanovel() {
        this.id = 'seanovel';
        this.name = 'Seanovel';
        this.version = '1.0.0';
        this.icon = 'src/ar/seanovel/icon.png';
        this.site = 'https://seanovel.org/';
        this.filters = {
            sort: {
                label: 'Sort By',
                value: 'views',
                options: [
                    { label: 'Most Popular', value: 'views' },
                    { label: 'Latest', value: 'latest' },
                    { label: 'Rating', value: 'rating' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            origin: {
                label: 'Origin',
                value: '',
                options: [
                    { label: 'All', value: '' },
                    { label: 'English', value: 'english' },
                    { label: 'Chinese', value: 'chinese' },
                    { label: 'Korean', value: 'korean' },
                    { label: 'Japanese', value: 'japanese' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
        };
        this.baseUrl = 'https://seanovel.org';
    }
    Seanovel.prototype.fetchJson = function (url) {
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
    Seanovel.prototype.popularNovels = function (pageNo_1, _a) {
        return __awaiter(this, arguments, void 0, function (pageNo, _b) {
            var sort, limit, offset, url, novels;
            var _this = this;
            var showLatestNovels = _b.showLatestNovels, filters = _b.filters;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        sort = showLatestNovels ? 'latest' : filters.sort.value;
                        limit = 50;
                        offset = (pageNo - 1) * limit;
                        url = "".concat(this.baseUrl, "/api/novels?sort=").concat(sort, "&page=").concat(pageNo, "&limit=").concat(limit, "&offset=").concat(offset);
                        if (filters.origin.value) {
                            url += "&origin=".concat(filters.origin.value);
                        }
                        return [4 /*yield*/, this.fetchJson(url)];
                    case 1:
                        novels = _c.sent();
                        return [2 /*return*/, novels.map(function (novel) { return ({
                                name: novel.title_original || novel.title_ar,
                                path: "/novels/".concat(novel.slug),
                                cover: "".concat(_this.baseUrl, "/api/novel/").concat(novel.slug, "/cover?type=webp"),
                            }); })];
                }
            });
        });
    };
    Seanovel.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var slug, novel, statusMap;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        slug = novelPath.replace('/novels/', '').replace(/\/$/, '');
                        return [4 /*yield*/, this.fetchJson("".concat(this.baseUrl, "/api/novel/").concat(slug))];
                    case 1:
                        novel = _c.sent();
                        statusMap = {
                            ongoing: novelStatus_1.NovelStatus.Ongoing,
                            completed: novelStatus_1.NovelStatus.Completed,
                            hiatus: novelStatus_1.NovelStatus.OnHiatus,
                            dropped: novelStatus_1.NovelStatus.Cancelled,
                            cancelled: novelStatus_1.NovelStatus.Cancelled,
                        };
                        return [2 /*return*/, {
                                path: novelPath,
                                name: novel.title_original || novel.title_ar,
                                cover: "".concat(this.baseUrl, "/api/novel/").concat(slug, "/cover?type=webp"),
                                author: novel.author || 'Unknown',
                                genres: ((_a = novel.genres) === null || _a === void 0 ? void 0 : _a.join(', ')) || '',
                                summary: novel.description || '',
                                status: statusMap[(_b = novel.status) === null || _b === void 0 ? void 0 : _b.toLowerCase()] || novelStatus_1.NovelStatus.Unknown,
                                chapters: (novel.chapters || [])
                                    .sort(function (a, b) { return a.id - b.id; })
                                    .map(function (ch, index) {
                                    var _a;
                                    return ({
                                        name: ch.title || "Chapter ".concat(ch.id),
                                        path: "/novels/".concat(slug, "/chapters/").concat(ch.id),
                                        chapterNumber: index + 1,
                                        releaseTime: ((_a = ch.date) === null || _a === void 0 ? void 0 : _a.split('T')[0]) || '',
                                    });
                                }),
                            }];
                }
            });
        });
    };
    Seanovel.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var url, res, html, allChunks, regex, match, fullPayload, initIdx, arrStart, depth, arrEnd, i, raw, unescaped, paragraphs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(this.baseUrl).concat(chapterPath);
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url)];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.text()];
                    case 2:
                        html = _a.sent();
                        allChunks = [];
                        regex = /self\.__next_f\.push\(\s*\[\s*\d+\s*,\s*("(?:[^"\\]|\\.)*")\s*\]/g;
                        while ((match = regex.exec(html)) !== null) {
                            try {
                                allChunks.push(JSON.parse(match[1]));
                            }
                            catch (_b) {
                                // skip unparseable chunks
                            }
                        }
                        if (allChunks.length > 0) {
                            fullPayload = allChunks.join('');
                            initIdx = fullPayload.indexOf('initialParagraphs');
                            if (initIdx > 0) {
                                arrStart = fullPayload.indexOf('[', initIdx);
                                if (arrStart > 0) {
                                    depth = 0;
                                    arrEnd = -1;
                                    for (i = arrStart; i < fullPayload.length; i++) {
                                        if (fullPayload[i] === '[')
                                            depth++;
                                        if (fullPayload[i] === ']') {
                                            depth--;
                                            if (depth === 0) {
                                                arrEnd = i + 1;
                                                break;
                                            }
                                        }
                                    }
                                    if (arrEnd > 0) {
                                        raw = fullPayload.substring(arrStart, arrEnd);
                                        unescaped = raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                                        try {
                                            paragraphs = JSON.parse(unescaped);
                                            if (paragraphs.length > 0) {
                                                return [2 /*return*/, paragraphs
                                                        .filter(function (p) { return typeof p === 'string' && p.trim(); })
                                                        .map(function (p) { return "<p>".concat(p.trim(), "</p>"); })
                                                        .join('\n')];
                                            }
                                        }
                                        catch (_c) {
                                            // fallback below
                                        }
                                    }
                                }
                            }
                        }
                        return [2 /*return*/, '<p>Content not available. Open in webview to read.</p>'];
                }
            });
        });
    };
    Seanovel.prototype.searchNovels = function (searchTerm, pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var limit, offset, allNovels, term, filtered;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        limit = 50;
                        offset = (pageNo - 1) * limit;
                        return [4 /*yield*/, this.fetchJson("".concat(this.baseUrl, "/api/novels?sort=views&page=1&limit=500&offset=0"))];
                    case 1:
                        allNovels = _a.sent();
                        term = searchTerm.toLowerCase();
                        filtered = allNovels.filter(function (n) {
                            return (n.title_original && n.title_original.toLowerCase().includes(term)) ||
                                (n.title_ar && n.title_ar.includes(searchTerm)) ||
                                (n.author && n.author.toLowerCase().includes(term));
                        });
                        return [2 /*return*/, filtered.slice(offset, offset + limit).map(function (novel) { return ({
                                name: novel.title_original || novel.title_ar,
                                path: "/novels/".concat(novel.slug),
                                cover: "".concat(_this.baseUrl, "/api/novel/").concat(novel.slug, "/cover?type=webp"),
                            }); })];
                }
            });
        });
    };
    return Seanovel;
}());
exports.default = new Seanovel();
