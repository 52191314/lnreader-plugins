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
var htmlparser2_1 = require("htmlparser2");
var fetch_1 = require("@libs/fetch");
var filterInputs_1 = require("@libs/filterInputs");
var LnMTLPlugin = /** @class */ (function () {
    function LnMTLPlugin() {
        this.id = 'lnmtl';
        this.name = 'LnMTL';
        this.icon = 'src/en/lnmtl/icon.png';
        this.site = 'https://lnmtl.com/';
        this.version = '2.1.1';
        this.filters = {
            order: {
                value: 'favourites',
                label: 'Order by',
                options: [
                    { label: 'Favourites', value: 'favourites' },
                    { label: 'Name', value: 'name' },
                    { label: 'Addition Date', value: 'date' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            sort: {
                value: 'desc',
                label: 'Sort by',
                options: [
                    { label: 'Descending', value: 'desc' },
                    { label: 'Ascending', value: 'asc' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            storyStatus: {
                value: 'all',
                label: 'Status',
                options: [
                    { label: 'All', value: 'all' },
                    { label: 'Ongoing', value: 'ongoing' },
                    { label: 'Finished', value: 'finished' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
        };
    }
    LnMTLPlugin.prototype.sleep = function (ms) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
            });
        });
    };
    LnMTLPlugin.prototype.popularNovels = function (page_1, _a) {
        return __awaiter(this, arguments, void 0, function (page, _b) {
            var params, link, response, html, baseUrl, state, tempNovel, novels, parser;
            var filters = _b.filters;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        params = new URLSearchParams({
                            orderBy: filters.order.value,
                            order: filters.sort.value,
                            filter: filters.storyStatus.value,
                            page: page.toString(),
                        });
                        link = "".concat(this.site, "novel?").concat(params.toString());
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(link)];
                    case 1:
                        response = _c.sent();
                        return [4 /*yield*/, response.text()];
                    case 2:
                        html = _c.sent();
                        baseUrl = this.site;
                        state = ParsingState.Idle;
                        tempNovel = {};
                        novels = [];
                        parser = new htmlparser2_1.Parser({
                            onopentag: function (name, attribs) {
                                var _a;
                                if ((_a = attribs['class']) === null || _a === void 0 ? void 0 : _a.includes('media-left')) {
                                    state = ParsingState.Novel;
                                }
                                if (state !== ParsingState.Novel)
                                    return;
                                switch (name) {
                                    case 'a':
                                        tempNovel.path = attribs['href'].replace(baseUrl, '');
                                        break;
                                    case 'img':
                                        tempNovel.name = attribs['alt'];
                                        tempNovel.cover = attribs['src'];
                                        break;
                                }
                            },
                            onclosetag: function (name) {
                                if (name === 'div') {
                                    if (tempNovel.path && tempNovel.name) {
                                        novels.push(tempNovel);
                                        tempNovel = {};
                                    }
                                    state = ParsingState.Idle;
                                }
                            },
                        });
                        parser.write(html);
                        parser.end();
                        return [2 /*return*/, novels];
                }
            });
        });
    };
    LnMTLPlugin.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var body, html, novel, state, panelValueCount, listCount, isAuthorKey, isStatusKey, summaryParts, genreArray, parser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)(this.site + novelPath)];
                    case 1:
                        body = _a.sent();
                        return [4 /*yield*/, body.text().then(function (r) { return r.replace(/>\s+</g, '><'); })];
                    case 2:
                        html = _a.sent();
                        novel = {
                            path: novelPath,
                            totalPages: 1,
                            chapters: [],
                        };
                        state = ParsingState.Idle;
                        panelValueCo