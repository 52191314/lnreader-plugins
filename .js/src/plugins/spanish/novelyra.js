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
var cheerio_1 = require("cheerio");
var defaultCover_1 = require("@libs/defaultCover");
var novelStatus_1 = require("@libs/novelStatus");
function parseSpanishTextToISO(text) {
    if (!text)
        return null;
    var now = new Date();
    var textLower = text.trim().toLowerCase();
    // --- 1. MAPEOS Y EXPRESIONES REGULARES ---
    var months = {
        enero: 0,
        febrero: 1,
        marzo: 2,
        abril: 3,
        mayo: 4,
        junio: 5,
        julio: 6,
        agosto: 7,
        septiembre: 8,
        octubre: 9,
        noviembre: 10,
        diciembre: 11,
    };
    // Expresión para: "21 de febrero de 2026"
    var absoluteRegex = /^(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})$/i;
    // --- 2. EVALUAR FECHAS ABSOLUTAS ---
    var absoluteMatch = textLower.match(absoluteRegex);
    if (absoluteMatch) {
        var day = parseInt(absoluteMatch[1], 10);
        var monthStr = absoluteMatch[2];
        var year = parseInt(absoluteMatch[3], 10);
        var monthIndex = months[monthStr];
        if (monthIndex !== undefined) {
            // Se crea la fecha en hora local (00:00:00)
            var date = new Date(year, monthIndex, day);
            return date.toISOString();
        }
    }
    // --- 3. EVALUAR FECHAS RELATIVAS ("hace...") ---
    if (textLower.startsWith('hace')) {
        // Normalizar "un" / "una" a "1" para facilitar el cálculo
        var normalized = textLower
            .replace(/\b(un|una)\b/g, '1')
            .replace('un momento', '0 segundos');
        if (normalized.includes('momento')) {
            return now.toISOString();
        }
        var relativeRegex = /(\d+)\s+([a-zñáéíóú]+)/i;
        var relativeMatch = normalized.match(relativeRegex);
        if (relativeMatch) {
            var value = parseInt(relativeMatch[1], 10);
            var unit = relativeMatch[2];
            var date = new Date(now); // Clonamos la fecha actual
            if (unit.startsWith('segundo')) {
                date.setSeconds(date.getSeconds() - value);
            }
            else if (unit.startsWith('minuto')) {
                date.setMinutes(date.getMinutes() - value);
            }
            else if (unit.startsWith('hora')) {
                date.setHours(date.getHours() - value);
            }
            else if (unit.startsWith('dia') || unit.startsWith('día')) {
                date.setDate(date.getDate() - value);
            }
            else if (unit.startsWith('mes')) {
                date.setMonth(date.getMonth() - value);
            }
            else if (unit.startsWith('año') || unit.startsWith('ano')) {
                date.setFullYear(date.getFullYear() - value);
            }
            return date.toISOString();
        }
    }
    // Si no coincide con ningún formato conocido, intentar el parse nativo o lanzar error
    try {
        var fallbackDate = new Date(text);
        if (!isNaN(fallbackDate.getTime()))
            return fallbackDate.toISOString();
    }
    catch (e) {
        // No se pudo parsear
    }
    throw new Error("Formato de fecha no soportado: \"".concat(text, "\""));
}
var Novelyra = /** @class */ (function () {
    function Novelyra() {
        this.id = 'novelyra';
        this.name = 'Novelyra';
        this.icon = 'src/es/novelyra/icon.png';
        this.site = 'https://novelyra.com/';
        this.version = '1.0.1';
        this.filters = {
            genres: {
                type: filterInputs_1.FilterTypes.Picker,
                label: 'Generos',
                value: '',
                options: [
                    { label: 'Todos', value: '' },
                    { label: 'Acción', value: 'accion' },
                    { label: 'Aventura', value: 'aventura' },
                    { label: 'Fantasía', value: 'fantasia' },
                    { label: 'Artes Marciales', value: 'artes-marciales' },
                    { label: 'Harén', value: 'haren' },
                    { label: 'Romance', value: 'romance' },
                    { label: 'Sobrenatural', value: 'sobrenatural' },
                    { label: 'Xuanhuan', value: 'xuanhuan' },
                    { label: 'Xianxia', value: 'xianxia' },
                    { label: 'Comedia', value: 'comedia' },
                    { label: 'Ciencia Ficción', value: 'ciencia-ficcion' },
                    { label: 'Misterio', value: 'misterio' },
                    { label: 'Maduro', value: 'maduro' },
                    { label: 'Psicológico', value: 'psicologico' },
                    { label: 'Shounen', value: 'shounen' },
                    { label: 'Reencarnación', value: 'reencarnacion' },
                    { label: 'Mecha', value: 'mecha' },
                    { label: 'Vida Escolar', value: 'vida-escolar' },
                    { label: 'Josei', value: 'josei' },
                    { label: 'Drama', value: 'drama' },
                    { label: 'Urbano', value: 'urbano' },
                    { label: 'Oriental', value: 'oriental' },
                    { label: 'Horror', value: 'horror' },
                    { label: 'Tragedia', value: 'tragedia' },
                    { label: 'Juegos', value: 'juegos' },
                ],
            },
            browse: {
                type: filterInputs_1.FilterTypes.Picker,
                label: 'Novelas Populares',
                value: 'browse.php',
                options: [
                    { label: 'Todas las Novelas', value: 'browse.php' },
                    { label: '🔥 Hoy', value: 'popular.php?period=today' },
                    { label: '📅 Este Mes', value: 'popular.php?period=month' },
                    { label: '👑 De Siempre', value: 'popular.php?period=alltime' },
                ],
            },
        };
    }
    Novelyra.prototype.loadNovels = function (loadedCheerio, typeNovel) {
        var _this = this;
        var novels = [];
        loadedCheerio(typeNovel).each(function (_, ele) {
            var _a;
            var novel = loadedCheerio(ele);
            novels.push({
                name: novel.find('h3').text(),
                path: ((_a = novel.find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.replace(_this.site, '')) || '',
                cover: novel.find('img').attr('src') || defaultCover_1.defaultCover,
            });
        });
        return novels;
    };
    Novelyra.prototype.popularNovels = function (pageNo_1, _a) {
        return __awaiter(this, arguments, void 0, function (pageNo, _b) {
            var url, typeNovel, genre, browse, params, result, body, loadedCheerio;
            var _c, _d;
            var showLatestNovels = _b.showLatestNovels, filters = _b.filters;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        url = this.site;
                        typeNovel = '#novelas .novel-card';
                        genre = (_c = filters.genres) === null || _c === void 0 ? void 0 : _c.value;
                        browse = (_d = filters.browse) === null || _d === void 0 ? void 0 : _d.value;
                        if (!showLatestNovels) {
                            if (browse.startsWith('popular.php')) {
                                url = "".concat(this.site).concat(browse);
                                typeNovel = '.popular-item';
                            }
                            else {
                                params = new URLSearchParams();
                                params.append('page', String(pageNo));
                                if (genre) {
                                    params.append('genre', genre);
                                }
                                url = "".concat(this.site).concat(browse, "?").concat(params.toString());
                                typeNovel = '.novels-grid .novel-card';
                            }
                        }
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url)];
                    case 1:
                        result = _e.sent();
                        return [4 /*yield*/, result.text()];
                    case 2:
                        body = _e.sent();
                        loadedCheerio = (0, cheerio_1.load)(body);
                        return [2 /*return*/, this.loadNovels(loadedCheerio, typeNovel)];
                }
            });
        });
    };
    Novelyra.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var result, body, loadedCheerio, novel, chapters;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)(this.site + novelPath)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.text()];
                    case 2:
                        body = _a.sent();
                        loadedCheerio = (0, cheerio_1.load)(body);
                        novel = {
                            path: novelPath,
                            name: loadedCheerio('h1').text(),
                        };
                        novel.cover = loadedCheerio('img').attr('src') || defaultCover_1.defaultCover;
                        novel.genres = loadedCheerio('.novel-meta .novel-genres')
                            .text()
                            .trim()
                            .replace('\n', ', ');
                        novel.status = novelStatus_1.NovelStatus.Completed;
                        novel.summary = loadedCheerio('.novel-description-detail').text().trim();
                        chapters = [];
                        loadedCheerio('.chapter-item-wrapper').each(function (idx, ele) {
                            var _a;
                            var cptr = loadedCheerio(ele);
                            var numberText = cptr.find('.chapter-number').text();
                            var numberMatch = numberText.match(/(\d+)/);
                            var chapterNumber = numberMatch ? parseInt(numberMatch[1]) : 0;
                            var chapter = {
                                name: cptr.find('.chapter-title').text(),
                                path: ((_a = cptr.find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.replace(_this.site, '')) || '',
                                releaseTime: parseSpanishTextToISO(cptr.find('.chapter-date').text()),
                                chapterNumber: chapterNumber,
                            };
                            chapters.push(chapter);
                        });
                        novel.chapters = chapters;
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    Novelyra.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var myHeaders, result, body, loadedCheerio, chapterText, paragraph, chapterHtml, tagsPermisive;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        myHeaders = new Headers();
                        myHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
                        myHeaders.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8');
                        myHeaders.set('Accept-Language', 'es-ES,es;q=0.9');
                        myHeaders.set('Referer', this.site);
                        myHeaders.set('Cache-Control', 'no-cache');
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(this.site + chapterPath, {
                                method: 'GET',
                                headers: myHeaders,
                            })];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.text()];
                    case 2:
                        body = _a.sent();
                        loadedCheerio = (0, cheerio_1.load)(body);
                        // Quita scripts
                        loadedCheerio('script').remove();
                        // Quita bloques de anuncios
                        loadedCheerio('.chapter-ad').remove();
                        // Quita tags de adsense si los hay
                        loadedCheerio('ins').remove();
                        chapterText = loadedCheerio('.chapter-content');
                        paragraph = [];
                        chapterHtml = [];
                        tagsPermisive = ['b', 'i', 'u', 'strong', 'em', 'span'];
                        chapterText.contents().each(function (_, element) {
                            switch (element.type) {
                                case 'text':
                                    if (element.data.trim()) {
                                        paragraph.push(element.data.trim());
                                    }
                                    break;
                                case 'tag':
                                    {
                                        var originalTag = element.tagName;
                                        if (tagsPermisive.includes(originalTag)) {
                                            paragraph.push(loadedCheerio.html(element));
                                        }
                                        else {
                                            if (paragraph.length > 0) {
                                                chapterHtml.push("<p>".concat(paragraph.join(' ').trim(), "</p>"));
                                                paragraph = [];
                                                if (originalTag === 'br')
                                                    break;
                                            }
                                            chapterHtml.push(loadedCheerio.html(element));
                                        }
                                    }
                                    break;
                            }
                        });
                        // Close any remaining paragraph
                        if (paragraph.length > 0) {
                            chapterHtml.push("<p>".concat(paragraph.join(' ').trim(), "</p>"));
                        }
                        return [2 /*return*/, chapterHtml.join('')];
                }
            });
        });
    };
    Novelyra.prototype.searchNovels = function (searchTerm) {
        return __awaiter(this, void 0, void 0, function () {
            var url, result, body, loadedCheerio, typeNovel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        searchTerm = searchTerm.toLowerCase();
                        url = "".concat(this.site, "?search=").concat(encodeURIComponent(searchTerm));
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.text()];
                    case 2:
                        body = _a.sent();
                        loadedCheerio = (0, cheerio_1.load)(body);
                        typeNovel = '#novelas .novel-card';
                        return [2 /*return*/, this.loadNovels(loadedCheerio, typeNovel)];
                }
            });
        });
    };
    return Novelyra;
}());
exports.default = new Novelyra();
