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
var defaultCover_1 = require("@libs/defaultCover");
var novelStatus_1 = require("@libs/novelStatus");
var BASE = 'https://novelmania.com.br';
var API = "".concat(BASE, "/api");
var JSON_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};
// Category IDs from GET /api/categories
// Format: base64(numeric_id)--hmac_signature
var CATEGORY_IDS = {
    acao: 'MQ==--5a499ef3b8d91aa3cb65aa53fb8c3b9e7dc63491',
    adulto: 'Mg==--3edd6783406bb8ea6fea9e69ee1a53221f8c8677',
    antologia: 'Mzk=--fc9d86ba0817da6aeaa6f0b319d42e2ebf06d3fb',
    'artes-marciais': 'Nw==--ebf238927942e0d5b38f24a3c0c010834cc18831',
    aventura: 'Mw==--dc8f9159e95541b096fddfac225e9771f62f38d8',
    comedia: 'NA==--a98f1ec98d64ebbcdcd5476d6ad25077599d33c7',
    conto: 'Mzg=--e76a0af4b1a83a49d1de0d7d3c389c411900e1f8',
    cotidiano: 'MTY=--9fc70df7bd24b284fe9e520288ce69447511897c',
    cultivo: 'NDc=--24a31ae8bda1c325f79008b3790b47ca7db9102d',
    distopia: 'NDE=--938e9afa59a514e61dd3d6cf05d17b26e98f25bb',
    drama: 'MjM=--720b847dc3393c8980802bf669350f9cd1820c88',
    ecchi: 'Mjc=--dd505aa865dde3bfe59b30354521d36af4cd4f45',
    erotico: 'MjI=--6e33800803a227ee79310f4f96ae9aa64a96963b',
    escolar: 'MTM=--96483791476f3c5fa2eb3d1f404e653a7bdb2e81',
    esporte: 'NDg=--f93748b5312e976a729672c2d13684e11fc8c374',
    exploracao: 'NDU=--8456f9b64784d8948d3e5f88ed47fd852a3d9e53',
    fantasia: 'NQ==--dee563c44dc609497fb77efa31e87790f2df9790',
    futurista: 'NDA=--7e196d30b7e0ebc56c2262c87ffc679ce67027aa',
    harem: 'MjE=--ca090876e2b3fda7071d4ecfb0bf20661d41521d',
    historico: 'NDI=--646e80a24ed359541c640ddda9bfe888aa19e952',
    horror: 'NDM=--3ddda0141eb10fff8d52ed336c7c1cf93991905c',
    isekai: 'MzA=--6fc21dc13a5bb7052d027e368b4c0f3c621713fc',
    magia: 'MjY=--af3fa7514514c8310ed4ac7cf5d5968f369f945f',
    mecha: 'OA==--ae005d85f3acff878acb0a42e082ba3f789006fc',
    medieval: 'MzE=--1ff340b6de4b5705107068d3bc7e59a421e7c023',
    militar: 'MjQ=--f762e35f847a412c4d26bc6771c6de837d2e454a',
    misterio: 'OQ==--6a6ecd8163ff655c66e909abda637d1f9156637f',
    mitologia: 'MTA=--ea1dc1d655cd26fdccd855ed18556b15bd46df3a',
    psicologico: 'MTE=--257277ff50641ff1b449c8ddc49827add51b3688',
    punk: 'NDQ=--3c2f2e3cd85d1bf7108efc68baeb5b7aa5dcd771',
    'realidade-virtual': 'MzY=--e63e54c8a22b1c7615caae64bb2a94696bd4ce9e',
    romance: 'MTI=--5c7213eb8fb9755f09d03047d74111ea299660f9',
    'sci-fi': 'MTQ=--92c86eb0f3782f0f72d1df74d3cb6151461bf6fb',
    'sistema-de-jogo': 'MTU=--979dddf096b85ec3a7b308a6c84286403a6b18be',
    sobrenatural: 'MTc=--af1341af226303a427debb258b131a0f0dd54136',
    'super-heroi': 'NDY=--872de17b8d32b7932921bc4a4a80ff4d1e801d0d',
    suspense: 'Mjk=--ffa46a31e5d1a09c2225ebf8fd7ff94611645916',
    terror: 'Ng==--1b3e18488c4b253b9d5e877df512588018f5f756',
    wuxia: 'MTg=--61693f1537dcfaf89b20f4b6b32d2f2492d97c4d',
    xianxia: 'MTk=--9ee4a5e1c6cc7d95bd38b55076610be92ea737cc',
    xuanhuan: 'MjA=--be92102bd756136a9aa5143058b714d1811b2dd7',
    yaoi: 'MzU=--ff0c99b1b88c74382e4215b31981d66fea6de07c',
    yuri: 'Mzc=--13f00e2914197579c5c3f3794c89ed35f27c7d42',
};
function mapStatus(status) {
    switch (status) {
        case 'Ativo': return novelStatus_1.NovelStatus.Ongoing;
        case 'Completo': return novelStatus_1.NovelStatus.Completed;
        case 'Pausado': return novelStatus_1.NovelStatus.OnHiatus;
        case 'Parado': return novelStatus_1.NovelStatus.OnHiatus;
        default: return novelStatus_1.NovelStatus.Unknown;
    }
}
/**
 * Decode a JavaScript-escaped string from the React SSR $R data stream.
 * Handles \x3C, \uXXXX, \", \n, \r, \t, \\ sequences.
 */
function decodeJsString(raw) {
    return raw
        .replace(/\\x([0-9a-fA-F]{2})/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); })
        .replace(/\\u([0-9a-fA-F]{4})/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); })
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\');
}
/**
 * Decode HTML entities from the novel synopsis (API returns HTML-encoded text).
 * Handles numeric entities (&#NNNN; &#xHH;) and the most common named entities
 * used in Portuguese text.
 */
function decodeHtmlEntities(text) {
    return text
        .replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(Number(n)); })
        .replace(/&#x([0-9a-fA-F]+);/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); })
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ')
        // Lowercase accented vowels
        .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
        .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú')
        .replace(/&agrave;/g, 'à').replace(/&egrave;/g, 'è').replace(/&igrave;/g, 'ì')
        .replace(/&ograve;/g, 'ò').replace(/&ugrave;/g, 'ù')
        .replace(/&acirc;/g, 'â').replace(/&ecirc;/g, 'ê').replace(/&icirc;/g, 'î')
        .replace(/&ocirc;/g, 'ô').replace(/&ucirc;/g, 'û')
        .replace(/&auml;/g, 'ä').replace(/&euml;/g, 'ë').replace(/&iuml;/g, 'ï')
        .replace(/&ouml;/g, 'ö').replace(/&uuml;/g, 'ü')
        .replace(/&atilde;/g, 'ã').replace(/&otilde;/g, 'õ')
        .replace(/&ccedil;/g, 'ç').replace(/&ntilde;/g, 'ñ')
        // Uppercase accented vowels
        .replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É').replace(/&Iacute;/g, 'Í')
        .replace(/&Oacute;/g, 'Ó').replace(/&Uacute;/g, 'Ú')
        .replace(/&Atilde;/g, 'Ã').replace(/&Otilde;/g, 'Õ')
        .replace(/&Ccedil;/g, 'Ç')
        .replace(/&Acirc;/g, 'Â').replace(/&Ecirc;/g, 'Ê').replace(/&Ocirc;/g, 'Ô')
        // Typography
        .replace(/&hellip;/g, '…').replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
        .replace(/&lsquo;/g, '\u2018').replace(/&rsquo;/g, '\u2019')
        .replace(/&ldquo;/g, '\u201C').replace(/&rdquo;/g, '\u201D')
        .replace(/&bull;/g, '•').replace(/&middot;/g, '·')
        .replace(/&trade;/g, '™').replace(/&copy;/g, '©').replace(/&reg;/g, '®');
}
/**
 * Convert HTML synopsis (with <p> tags and HTML entities) to plain text.
 * LNReader renders the summary as plain text, so we strip tags and decode entities.
 */
function cleanSynopsis(raw) {
    return decodeHtmlEntities(raw)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
var NovelMania = /** @class */ (function () {
    function NovelMania() {
        this.id = 'novelmania.com.br';
        this.name = 'Novel Mania';
        this.icon = 'src/pt-br/novelmania/icon.png';
        this.site = BASE;
        this.version = '2.0.1';
        this.imageRequestInit = undefined;
        this.resolveUrl = function (path, isNovel) {
            return isNovel ? "".concat(BASE).concat(path) : "".concat(BASE).concat(path);
        };
        this.filters = {
            genres: {
                value: '',
                label: 'Gêneros',
                options: [
                    { label: 'Todos', value: '' },
                    { label: 'Ação', value: 'acao' },
                    { label: 'Adulto', value: 'adulto' },
                    { label: 'Antologia', value: 'antologia' },
                    { label: 'Artes Marciais', value: 'artes-marciais' },
                    { label: 'Aventura', value: 'aventura' },
                    { label: 'Comédia', value: 'comedia' },
                    { label: 'Conto', value: 'conto' },
                    { label: 'Cotidiano', value: 'cotidiano' },
                    { label: 'Cultivo', value: 'cultivo' },
                    { label: 'Distopia', value: 'distopia' },
                    { label: 'Drama', value: 'drama' },
                    { label: 'Ecchi', value: 'ecchi' },
                    { label: 'Erótico', value: 'erotico' },
                    { label: 'Escolar', value: 'escolar' },
                    { label: 'Esporte', value: 'esporte' },
                    { label: 'Exploração', value: 'exploracao' },
                    { label: 'Fantasia', value: 'fantasia' },
                    { label: 'Futurista', value: 'futurista' },
                    { label: 'Harém', value: 'harem' },
                    { label: 'Histórico', value: 'historico' },
                    { label: 'Horror', value: 'horror' },
                    { label: 'Isekai', value: 'isekai' },
                    { label: 'Magia', value: 'magia' },
                    { label: 'Mecha', value: 'mecha' },
                    { label: 'Medieval', value: 'medieval' },
                    { label: 'Militar', value: 'militar' },
                    { label: 'Mistério', value: 'misterio' },
                    { label: 'Mitologia', value: 'mitologia' },
                    { label: 'Psicológico', value: 'psicologico' },
                    { label: 'Punk', value: 'punk' },
                    { label: 'Realidade Virtual', value: 'realidade-virtual' },
                    { label: 'Romance', value: 'romance' },
                    { label: 'Sci-fi', value: 'sci-fi' },
                    { label: 'Sistema de Jogo', value: 'sistema-de-jogo' },
                    { label: 'Sobrenatural', value: 'sobrenatural' },
                    { label: 'Super-Herói', value: 'super-heroi' },
                    { label: 'Suspense', value: 'suspense' },
                    { label: 'Terror', value: 'terror' },
                    { label: 'Wuxia', value: 'wuxia' },
                    { label: 'Xianxia', value: 'xianxia' },
                    { label: 'Xuanhuan', value: 'xuanhuan' },
                    { label: 'Yaoi', value: 'yaoi' },
                    { label: 'Yuri', value: 'yuri' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            status: {
                label: 'Status',
                value: '',
                options: [
                    { label: 'Todos', value: '' },
                    { label: 'Ativo', value: 'Ativo' },
                    { label: 'Completo', value: 'Completo' },
                    { label: 'Pausado', value: 'Pausado' },
                    { label: 'Parado', value: 'Parado' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
            type: {
                label: 'Tipo / Nacionalidade',
                value: '',
                options: [
                    { label: 'Todas', value: '' },
                    { label: 'Americana', value: 'Americana' },
                    { label: 'Angolana', value: 'Angolana' },
                    { label: 'Brasileira', value: 'Brasileira' },
                    { label: 'Chinesa', value: 'Chinesa' },
                    { label: 'Coreana', value: 'Coreana' },
                    { label: 'Japonesa', value: 'Japonesa' },
                ],
                type: filterInputs_1.FilterTypes.Picker,
            },
        };
    }
    NovelMania.prototype.popularNovels = function (pageNo_1, _a) {
        return __awaiter(this, arguments, void 0, function (pageNo, _b) {
            var params, genreSlug, status, nat, json;
            var _c;
            var filters = _b.filters;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        params = new URLSearchParams();
                        params.set('page', String(pageNo));
                        genreSlug = filters === null || filters === void 0 ? void 0 : filters.genres.value;
                        if (genreSlug && CATEGORY_IDS[genreSlug]) {
                            params.append('categories[]', CATEGORY_IDS[genreSlug]);
                        }
                        status = filters === null || filters === void 0 ? void 0 : filters.status.value;
                        if (status)
                            params.append('statuses[]', status);
                        nat = filters === null || filters === void 0 ? void 0 : filters.type.value;
                        if (nat)
                            params.append('nationalities[]', nat);
                        return [4 /*yield*/, (0, fetch_1.fetchApi)("".concat(API, "/novels?").concat(params), {
                                headers: JSON_HEADERS,
                            }).then(function (r) { return r.json(); })];
                    case 1:
                        json = _d.sent();
                        return [2 /*return*/, ((_c = json.data) !== null && _c !== void 0 ? _c : []).map(function (n) {
                                var _a, _b;
                                return ({
                                    name: n.title,
                                    cover: (_b = (_a = n.cover) === null || _a === void 0 ? void 0 : _a.large) !== null && _b !== void 0 ? _b : defaultCover_1.defaultCover,
                                    path: "/novels/".concat(n.slug),
                                });
                            })];
                }
            });
        });
    };
    NovelMania.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var slug, novelJson, n, chapters, page, hasMore, chapJson, batch, _i, batch_1, ch;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        slug = novelPath.split('/').filter(Boolean).pop();
                        return [4 /*yield*/, (0, fetch_1.fetchApi)("".concat(API, "/novels/").concat(slug), {
                                headers: JSON_HEADERS,
                            }).then(function (r) { return r.json(); })];
                    case 1:
                        novelJson = _g.sent();
                        n = novelJson.data;
                        chapters = [];
                        page = 1;
                        hasMore = true;
                        _g.label = 2;
                    case 2:
                        if (!hasMore) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, fetch_1.fetchApi)("".concat(API, "/novels/").concat(slug, "/chapters?page=").concat(page), { headers: JSON_HEADERS }).then(function (r) { return r.json(); })];
                    case 3:
                        chapJson = _g.sent();
                        batch = (_a = chapJson.data) !== null && _a !== void 0 ? _a : [];
                        if (!batch.length) {
                            hasMore = false;
                        }
                        else {
                            for (_i = 0, batch_1 = batch; _i < batch_1.length; _i++) {
                                ch = batch_1[_i];
                                chapters.push({
                                    name: ch.longTitle || ch.title || ch.slug,
                                    path: "/novels/".concat(slug, "/capitulos/").concat(ch.slug),
                                });
                            }
                            if (batch.length < 20) {
                                hasMore = false;
                            }
                            else {
                                page++;
                            }
                        }
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/, {
                            path: novelPath,
                            name: n.title,
                            cover: (_c = (_b = n.cover) === null || _b === void 0 ? void 0 : _b.large) !== null && _c !== void 0 ? _c : defaultCover_1.defaultCover,
                            summary: cleanSynopsis((_d = n.synopsis) !== null && _d !== void 0 ? _d : ''),
                            author: (_e = n.author) !== null && _e !== void 0 ? _e : '',
                            genres: ((_f = n.categories) !== null && _f !== void 0 ? _f : []).map(function (c) { return c.name; }).join(','),
                            status: mapStatus(n.status),
                            chapters: chapters,
                        }];
                }
            });
        });
    };
    NovelMania.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var html, contentMatch, content, titleMatch, chapterTitle, longTitleMatch, longTitle, volumeName, fallbackTitle, ogMatch, parts_1, displayTitle, translators, transIdx, chunk, reUser, mu, name_1, parts, header;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)("".concat(BASE).concat(chapterPath)).then(function (r) { return r.text(); })];
                    case 1:
                        html = _g.sent();
                        contentMatch = html.match(/[,{]content:"((?:[^"\\]|\\.)*)"/);
                        content = (contentMatch === null || contentMatch === void 0 ? void 0 : contentMatch[1]) ? decodeJsString(contentMatch[1]) : '';
                        titleMatch = html.match(/updatedAt:"[^"]+",title:"((?:[^"\\]|\\.)*)",slug:/);
                        chapterTitle = (titleMatch === null || titleMatch === void 0 ? void 0 : titleMatch[1]) ? decodeJsString(titleMatch[1]) : '';
                        longTitleMatch = html.match(/longTitle:"((?:[^"\\]|\\.)*)"/);
                        longTitle = (longTitleMatch === null || longTitleMatch === void 0 ? void 0 : longTitleMatch[1]) ? decodeJsString(longTitleMatch[1]) : '';
                        volumeName = (_b = (_a = longTitle.split(/\s*[\u2013-]\s*/)[0]) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '';
                        fallbackTitle = '';
                        if (!longTitle) {
                            ogMatch = html.match(/og:title[^>]*content="([^"]+)"/);
                            if (ogMatch === null || ogMatch === void 0 ? void 0 : ogMatch[1]) {
                                parts_1 = ogMatch[1].split(/\s*[\u2013-]\s*/);
                                if (parts_1.length >= 2) {
                                    volumeName = (_d = (_c = parts_1[0]) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : '';
                                    fallbackTitle = (_f = (_e = parts_1[1]) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : '';
                                }
                            }
                        }
                        displayTitle = chapterTitle || fallbackTitle;
                        translators = [];
                        transIdx = html.indexOf('translators:$R[');
                        if (transIdx !== -1) {
                            chunk = html.slice(transIdx, transIdx + 500);
                            reUser = /username:"((?:[^"\\]|\\.)*)"/g;
                            mu = void 0;
                            while ((mu = reUser.exec(chunk)) !== null) {
                                name_1 = decodeJsString(mu[1]);
                                if (name_1 && !translators.includes(name_1))
                                    translators.push(name_1);
                            }
                        }
                        parts = [];
                        if (volumeName) {
                            parts.push('<p style="text-transform:uppercase;font-weight:bold;font-size:0.8em;' +
                                'letter-spacing:0.08em;margin:0 0 6px 0;opacity:0.7">' +
                                volumeName + '</p>');
                        }
                        if (displayTitle) {
                            parts.push('<h2 style="margin:0 0 10px 0;font-size:1.25em">' +
                                displayTitle + '</h2>');
                        }
                        if (translators.length > 0) {
                            parts.push('<p style="font-size:0.85em;margin:0">Tradução: ' +
                                translators.join(', ') + '</p>');
                        }
                        header = parts.length > 0
                            ? '<div style="margin-bottom:20px">' + parts.join('') + '</div>' +
                                '<hr style="margin-bottom:20px"/>'
                            : '';
                        return [2 /*return*/, header + content];
                }
            });
        });
    };
    NovelMania.prototype.searchNovels = function (searchTerm, pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var params, json;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        params = new URLSearchParams();
                        params.set('q', searchTerm);
                        params.set('page', String(pageNo));
                        return [4 /*yield*/, (0, fetch_1.fetchApi)("".concat(API, "/novels?").concat(params), {
                                headers: JSON_HEADERS,
                            }).then(function (r) { return r.json(); })];
                    case 1:
                        json = _b.sent();
                        return [2 /*return*/, ((_a = json.data) !== null && _a !== void 0 ? _a : []).map(function (n) {
                                var _a, _b;
                                return ({
                                    name: n.title,
                                    cover: (_b = (_a = n.cover) === null || _a === void 0 ? void 0 : _a.large) !== null && _b !== void 0 ? _b : defaultCover_1.defaultCover,
                                    path: "/novels/".concat(n.slug),
                                });
                            })];
                }
            });
        });
    };
    return NovelMania;
}());
exports.default = new NovelMania();
