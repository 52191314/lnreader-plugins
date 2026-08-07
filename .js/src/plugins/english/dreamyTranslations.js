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
var defaultCover_1 = require("@libs/defaultCover");
var novelStatus_1 = require("@libs/novelStatus");
var DreamyTranslationsPlugin = /** @class */ (function () {
    function DreamyTranslationsPlugin() {
        var _this = this;
        this.id = 'dreamyTranslations';
        this.name = 'Dreamy Translations';
        this.icon = 'src/en/dreamyTranslations/icon.png';
        this.site = 'https://dreamy-translations.com';
        this.version = '1.0.0';
        this.filters = undefined;
        this.imageRequestInit = undefined;
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
            Referer: this.site,
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            RSC: '1',
        };
        this.resolveUrl = function (path) { return _this.site + path; };
    }
    /**
     * This site is a Next.js app whose pages render their novel/chapter data
     * client-side; the plain HTML response is just a loading skeleton. Requesting
     * the same URL with the `RSC` header returns Next.js's React Server Component
     * "flight" stream instead, which carries the real data as a series of
     * `<id>:<value>` lines. Most lines are directly JSON-parsable once the leading
     * `<id>:` is stripped; long text bodies are instead referenced elsewhere as
     * `"$<id>"` and streamed separately as a `<id>:T<hexByteLength>,<rawText>` line.
     */
    DreamyTranslationsPlugin.prototype.fetchRsc = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)(url, { headers: this.headers })];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.text()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DreamyTranslationsPlugin.prototype.extractRscObject = function (rscText, marker) {
        var line = rscText.split('\n').find(function (l) { return l.includes(marker); });
        if (!line) {
            throw new Error('Could not locate expected data in server response');
        }
        var jsonStr = line.slice(line.indexOf(':') + 1);
        var parsed = JSON.parse(jsonStr);
        return parsed[3];
    };
    /**
     * Text bodies aren't inline JSON: they're declared with their exact UTF-8
     * byte length (`T<hex>,`) and the following chunk starts immediately after
     * those bytes with no separator, so byte-accurate slicing is required.
     */
    DreamyTranslationsPlugin.prototype.extractDeferredText = function (rscText, refId) {
        var match = new RegExp("(?:^|\\n)".concat(refId, ":T([0-9a-f]+),")).exec(rscText);
        if (!match) {
            throw new Error('Could not locate chapter content in server response');
        }
        var start = match.index + match[0].length;
        var byteLength = parseInt(match[1], 16);
        var rest = rscText.slice(start);
        var bytes = new TextEncoder().encode(rest).slice(0, byteLength);
        return new TextDecoder().decode(bytes);
    };
    DreamyTranslationsPlugin.prototype.fetchAllNovels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rscText, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchRsc("".concat(this.site, "/series"))];
                    case 1:
                        rscText = _a.sent();
                        data = this.extractRscObject(rscText, '"projects"');
                        return [2 /*return*/, data.projects.map(function (project) { return ({
                                name: project.title,
                                path: "/novel/".concat(project.slug),
                                cover: data.squareImageUrls[String(project.id)] || defaultCover_1.defaultCover,
                            }); })];
                }
            });
        });
    };
    DreamyTranslationsPlugin.prototype.popularNovels = function (pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (pageNo !== 1)
                    return [2 /*return*/, []];
                return [2 /*return*/, this.fetchAllNovels()];
            });
        });
    };
    DreamyTranslationsPlugin.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var rscText, data, novel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchRsc("".concat(this.site).concat(novelPath))];
                    case 1:
                        rscText = _a.sent();
                        data = this.extractRscObject(rscText, '"chapters":[');
                        novel = {
                            path: novelPath,
                            name: data.project.title || 'Untitled',
                            cover: data.coverUrl || defaultCover_1.defaultCover,
                            author: data.project.author,
                            genres: (data.project.genres || []).join(', '),
                            summary: data.project.synopsis || data.project.short_synopsis,
                            status: data.project.completed
                                ? novelStatus_1.NovelStatus.Completed
                                : novelStatus_1.NovelStatus.Ongoing,
                        };
                        novel.chapters = data.chapters.map(function (chapter) { return ({
                            name: chapter.free ? chapter.title : "\uD83D\uDD12 ".concat(chapter.title),
                            path: "".concat(novelPath, "/chapter/").concat(chapter.index),
                            chapterNumber: chapter.index,
                        }); });
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    DreamyTranslationsPlugin.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var rscText, data, refMatch, rawText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchRsc("".concat(this.site).concat(chapterPath))];
                    case 1:
                        rscText = _a.sent();
                        data = this.extractRscObject(rscText, '"chapter":{');
                        if (!data.hasAccess) {
                            throw new Error('This chapter requires premium access and cannot be read here.');
                        }
                        refMatch = /^\$([0-9a-zA-Z]+)$/.exec(data.chapter.content);
                        if (!refMatch) {
                            // Content was inlined directly rather than streamed separately.
                            return [2 /*return*/, "<p>".concat(data.chapter.content, "</p>")];
                        }
                        rawText = this.extractDeferredText(rscText, refMatch[1]).replace(/\r\n/g, '\n');
                        return [2 /*return*/, rawText
                                .split(/\n{2,}/)
                                .map(function (paragraph) { return paragraph.trim(); })
                                .filter(Boolean)
                                .map(function (paragraph) { return "<p>".concat(paragraph.replace(/\n/g, '<br>'), "</p>"); })
                                .join('')];
                }
            });
        });
    };
    DreamyTranslationsPlugin.prototype.searchNovels = function (searchTerm, pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var novels, term;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (pageNo !== 1)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, this.fetchAllNovels()];
                    case 1:
                        novels = _a.sent();
                        term = searchTerm.toLowerCase();
                        return [2 /*return*/, novels.filter(function (novel) { return novel.name.toLowerCase().includes(term); })];
                }
            });
        });
    };
    return DreamyTranslationsPlugin;
}());
exports.default = new DreamyTranslationsPlugin();
