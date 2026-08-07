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
var filterInputs_1 = require("@libs/filterInputs");
var storage_1 = require("@libs/storage");
var Linovelib = /** @class */ (function () {
    function Linovelib() {
        this.id = 'linovelib';
        this.name = 'Linovelib';
        this.icon = 'src/cn/linovelib/icon.png';
        this.site = 'https://www.bilinovel.com';
        this.version = '1.2.1';
        this.imageRequestInit = {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',
                'Referer': 'https://www.linovelib.com',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            },
        };
        this.webStorageUtilized = true;
        // The URL of the custom LDS (Linovelib Descramble Server) URL. Due to complex de-scrambling logic, an external LDS is required.
        this.pluginSettings = {
            host: {
                value: 'http://example.com',
                label: 'Custom LDS Host',
                type: 'Text',
            },
        };
        this.serverUrl = storage_1.storage.get('host') || 'http://localhost:5301';
        this.filters = {
            rank: {
                label: '排行榜',
                value: 'monthvisit',
                options: [
                    { label: '月点击榜', value: 'monthvisit' },
                    { label: '周点击榜', value: 'weekvisit' },
                    { label: '月推荐榜', value: 'monthvote' },
                    { label: '周推荐榜', value: 'weekvote' },
                    { label: '月鲜花榜', value: 'monthflower' },
                    { label: '周鲜花榜', value: 'weekflower' },
                    { label: '月鸡蛋榜', value: 'monthegg' },
                    { label: '周鸡蛋榜', value: 'weekegg' },
                    { label: '最近更新', value: 'lastupdate' },
                    { label: '最新入库', value: 'postdate' },
                    { label: '收藏榜', value: 'goodnum' },
                    { label: '新书榜', value: 'newhot' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
        };
    }
    Linovelib.prototype.popularNovels = function (pageNo_1, _a) {
        return __awaiter(this, arguments, void 0, function (pageNo, _b) {
            var rank, url, body, loadedCheerio, novels;
            var showLatestNovels = _b.showLatestNovels, filters = _b.filters;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        rank = showLatestNovels ? 'lastupdate' : filters.rank.value;
                        url = "".concat(this.site, "/top/").concat(rank, "/").concat(pageNo, ".html");
                        return [4 /*yield*/, (0, fetch_1.fetchText)(url)];
                    case 1:
                        body = _c.sent();
                        if (body === '')
                            throw Error('无法获取小说列表，请检查网络');
                        loadedCheerio = (0, cheerio_1.load)(body);
                        novels = [];
                        loadedCheerio('.module-rank-booklist .book-layout').each(function (i, el) {
                            var _a;
                            var url = loadedCheerio(el).attr('href');
                            var novelName = loadedCheerio(el).find('.book-title').text();
                            var novelCover = (_a = loadedCheerio(el)
                                .find('div.book-cover > img')
                                .attr('data-src')) === null || _a === void 0 ? void 0 : _a.replace('/https', 'https');
                            if (!url)
                                return;
                            var novel = {
                                name: novelName,
                                cover: novelCover,
                                path: url,
                            };
                            novels.push(novel);
                        });
                        return [2 /*return*/, novels];
                }
            });
        });
    };
    Linovelib.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var res, novel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchText)("".concat(this.serverUrl, "/api/novel?path=").concat(novelPath))];
                    case 1:
                        res = _a.sent();
                        novel = JSON.parse(res);
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    Linovelib.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var lastFetchChapterTime, res, resObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lastFetchChapterTime = Number(storage_1.storage.get('lastFetchChapterTime_' + chapterPath)) || 0;
                        if (Date.now() - lastFetchChapterTime < 10000) {
                            return [2 /*return*/, storage_1.storage.get('chapterContent_' + chapterPath) || ''];
                        }
                        return [4 /*yield*/, (0, fetch_1.fetchText)("".concat(this.serverUrl, "/api/chapter?path=").concat(chapterPath))];
                    case 1:
                        res = _a.sent();
                        resObj = JSON.parse(res);
                        storage_1.storage.set('lastFetchChapterTime_' + chapterPath, Date.now());
                        storage_1.storage.set('chapterContent_' + chapterPath, resObj.content);
                        return [2 /*return*/, resObj.content];
                }
            });
        });
    };
    Linovelib.prototype.searchNovels = function (searchTerm) {
        return __awaiter(this, void 0, void 0, function () {
            var lastSearchTime, res, novelsData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lastSearchTime = Number(storage_1.storage.get('lastSearchTime_' + this.id)) || 0;
                        if (Date.now() - lastSearchTime < 5000) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, (0, fetch_1.fetchText)("".concat(this.serverUrl, "/api/search?keyword=").concat(encodeURIComponent(searchTerm)))];
                    case 1:
                        res = _a.sent();
                        novelsData = JSON.parse(res).results;
                        storage_1.storage.set('lastSearchTime_' + this.id, Date.now());
                        return [2 /*return*/, novelsData];
                }
            });
        });
    };
    return Linovelib;
}());
exports.default = new Linovelib();
