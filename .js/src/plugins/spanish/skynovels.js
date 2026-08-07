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
var filterInputs_1 = require("@libs/filterInputs");
var SkyNovels = /** @class */ (function () {
    function SkyNovels() {
        this.id = 'skynovels';
        this.name = 'SkyNovels';
        this.site = 'https://www.skynovels.net/';
        this.apiSite = 'https://api.skynovels.net/api/';
        this.version = '1.1.0';
        this.icon = 'src/es/skynovels/icon.png';
        this.filters = {
            genres: {
                type: filterInputs_1.FilterTypes.CheckboxGroup,
                label: 'Generos',
                value: [],
                options: [
                    { label: 'Acción', value: '9' },
                    { label: 'Adulto', value: '38' },
                    { label: 'Artes marciales', value: '3' },
                    { label: 'Aventura', value: '2' },
                    { label: 'BL', value: '40' },
                    { label: 'Comedia', value: '7' },
                    { label: 'Cosas de la vida', value: '26' },
                    { label: 'Cultivación', value: '19' },
                    { label: 'Drama', value: '8' },
                    { label: 'Ecchi', value: '21' },
                    { label: 'Fantasia', value: '4' },
                    { label: 'Gender Bender', value: '10' },
                    { label: 'GL', value: '41' },
                    { label: 'Harem', value: '12' },
                    { label: 'Histórico', value: '32' },
                    { label: 'Horror', value: '39' },
                    { label: 'LitRPG', value: '31' },
                    { label: 'Maduro', value: '1' },
                    { label: 'Magia', value: '16' },
                    { label: 'Misterio', value: '22' },
                    { label: 'Mundo Moderno', value: '34' },
                    { label: 'Psicológico', value: '27' },
                    { label: 'Recuentos de la vida', value: '36' },
                    { label: 'Reencarnación', value: '23' },
                    { label: 'Romance', value: '5' },
                    { label: 'Sci-Fi', value: '17' },
                    { label: 'Seinen', value: '18' },
                    { label: 'Shoujo', value: '33' },
                    { label: 'Shounen', value: '13' },
                    { label: 'Sobrenatural', value: '20' },
                    { label: 'Supervivencia', value: '25' },
                    { label: 'Suspenso', value: '35' },
                    { label: 'Tragedia', value: '14' },
                    { label: 'Transmigración', value: '24' },
                    { label: 'Vida Escolar', value: '29' },
                    { label: 'Xianxia', value: '6' },
                    { label: 'Xuanhuan', value: '11' },
                    { label: 'Yaoi', value: '30' },
                    { label: 'Sin género indicado', value: '37' },
                ],
            },
        };
    }
    SkyNovels.prototype.popularNovels = function (pageNo_1, _a) {
        return __awaiter(this, arguments, void 0, function (pageNo, _b) {
            var genres, order, url, result, body, novels;
            var _this = this;
            var _c, _d;
            var filters = _b.filters;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        genres = ((_c = filters === null || filters === void 0 ? void 0 : filters.genres) === null || _c === void 0 ? void 0 : _c.value) || [];
                        order = genres.length > 0 ? 'updated' : 'rating';
                        url = "".concat(this.apiSite, "novels?page=").concat(pageNo, "&order=").concat(order);
                        if (genres.length > 0)
                            url += "&genres=".concat(genres.join(','));
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url, {
                                headers: {
                                    'Cache-Control': 'no-cache',
                                },
                            })];
                    case 1:
                        result = _e.sent();
                        return [4 /*yield*/, result.json()];
                    case 2:
                        body = (_e.sent());
                        novels = [];
                        (_d = body.novels) === null || _d === void 0 ? void 0 : _d.forEach(function (res) {
                            var name = res.nvl_title;
                            var cover = _this.apiSite + 'get-image/' + res.image + '/novels/false';
                            var path = 'novelas/' + res.id + '/' + res.nvl_name + '/';
                            novels.push({ name: name, cover: cover, path: path });
                        });
                        return [2 /*return*/, novels];
                }
            });
        });
    };
    SkyNovels.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var novelId, url, result, body, item, novel, genres, novelChapters;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        novelId = novelPath.split('/')[1];
                        url = this.apiSite + 'novel/' + novelId + '/reading?&q';
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url, {
                                headers: {
                                    'Cache-Control': 'no-cache',
                                },
                            })];
                    case 1:
                        result = _d.sent();
                        return [4 /*yield*/, result.json()];
                    case 2:
                        body = (_d.sent());
                        item = (_a = body === null || body === void 0 ? void 0 : body.novel) === null || _a === void 0 ? void 0 : _a[0];
                        novel = {
                            path: novelPath,
                            name: (item === null || item === void 0 ? void 0 : item.nvl_title) || 'Untitled',
                        };
                        novel.cover = this.apiSite + 'get-image/' + (item === null || item === void 0 ? void 0 : item.image) + '/novels/false';
                        genres = [];
                        (_b = item === null || item === void 0 ? void 0 : item.genres) === null || _b === void 0 ? void 0 : _b.forEach(function (genre) { return genres.push(genre.genre_name); });
                        novel.genres = genres.join(',');
                        novel.author = item === null || item === void 0 ? void 0 : item.nvl_writer;
                        novel.summary = item === null || item === void 0 ? void 0 : item.nvl_content;
                        novel.status = item === null || item === void 0 ? void 0 : item.nvl_status;
                        novelChapters = [];
                        (_c = item === null || item === void 0 ? void 0 : item.volumes) === null || _c === void 0 ? void 0 : _c.forEach(function (volume) {
                            var _a;
                            (_a = volume === null || volume === void 0 ? void 0 : volume.chapters) === null || _a === void 0 ? void 0 : _a.forEach(function (chapter) {
                                var chapterName = chapter.chp_index_title;
                                var releaseDate = new Date(chapter.createdAt).toDateString();
                                var chapterPath = novelPath + chapter.id + '/' + chapter.chp_name;
                                novelChapters.push({
                                    name: chapterName,
                                    releaseTime: releaseDate,
                                    path: chapterPath,
                                });
                            });
                        });
                        novel.chapters = novelChapters;
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    SkyNovels.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var chapterId, url, result, body, item, chapterText;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        chapterId = chapterPath.split('/')[3];
                        url = "".concat(this.apiSite, "novel-chapter/").concat(chapterId);
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url, {
                                headers: {
                                    'Cache-Control': 'no-cache',
                                },
                            })];
                    case 1:
                        result = _b.sent();
                        return [4 /*yield*/, result.json()];
                    case 2:
                        body = (_b.sent());
                        item = (_a = body === null || body === void 0 ? void 0 : body.chapter) === null || _a === void 0 ? void 0 : _a[0];
                        chapterText = (item === null || item === void 0 ? void 0 : item.chp_content) || '';
                        return [2 /*return*/, chapterText.replace(/\n/g, '<br>')];
                }
            });
        });
    };
    SkyNovels.prototype.searchNovels = function (searchTerm, pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var url, result, body, novels;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        searchTerm = encodeURIComponent(searchTerm.toLowerCase());
                        url = "".concat(this.apiSite, "novels?page=").concat(pageNo, "&q=").concat(searchTerm);
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url, {
                                headers: {
                                    'Cache-Control': 'no-cache',
                                },
                            })];
                    case 1:
                        result = _b.sent();
                        return [4 /*yield*/, result.json()];
                    case 2:
                        body = (_b.sent());
                        novels = [];
                        (_a = body === null || body === void 0 ? void 0 : body.novels) === null || _a === void 0 ? void 0 : _a.forEach(function (res) {
                            var name = res.nvl_title;
                            var cover = _this.apiSite + 'get-image/' + res.image + '/novels/false';
                            var path = 'novelas/' + res.id + '/' + res.nvl_name + '/';
                            novels.push({ name: name, cover: cover, path: path });
                        });
                        return [2 /*return*/, novels];
                }
            });
        });
    };
    return SkyNovels;
}());
exports.default = new SkyNovels();
