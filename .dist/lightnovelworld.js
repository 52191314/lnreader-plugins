var cheerio = require('cheerio');
var fetchLib = require('@libs/fetch');

var LightNovelWorldPlugin = (function () {
    function LightNovelWorldPlugin() {
        this.id = "lightnovelworld";
        this.name = "LightNovelWorld";
        this.site = "https://lightnovelworld.org";
        this.version = "1.0.0";
        this.icon = "https://lightnovelworld.org/favicon.ico";
        this.baseUrl = this.site;
    }
    
    LightNovelWorldPlugin.prototype.popularNovels = async function (pageNo, options) {
        var page = Math.max(1, pageNo || 1);
        var category = (options && options.showLatestNovels) ? 'latest' : 'popular';
        var url = this.baseUrl + "/browse/" + category + "?page=" + page;
        var res = await fetchLib.fetchApi(url);
        var body = await res.text();
        return this.parseNovelList(body);
    };

    LightNovelWorldPlugin.prototype.parseNovel = async function (novelPath) {
        var fullUrl = novelPath.startsWith('http') ? novelPath : (this.baseUrl + (novelPath.startsWith('/') ? '' : '/') + novelPath);
        var res = await fetchLib.fetchApi(fullUrl);
        var body = await res.text();
        var $ = cheerio.load(body);

        var title = $('.novel-title, h1.title, .novel-name, h1').first().text().trim() || 'Untitled Novel';
        var imgEl = $('.cover img, .novel-cover img, .book-cover img, img.cover').first();
        var rawCover = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';
        var cover = rawCover.startsWith('http') ? rawCover : (this.baseUrl + (rawCover.startsWith('/') ? '' : '/') + rawCover);

        var summary = $('.summary .content, .description, .novel-summary, .summary-content, .synopsis').first().text().trim() || '';
        var author = $('.author a, .novel-author, .author-name').first().text().trim();
        if (!author) {
            author = $('.author').text().replace(/^author:\\s*/i, '').trim() || 'Unknown Author';
        }

        var rawStatus = $('.novel-status, .status-label, .status').first().text().trim().toLowerCase();
        var status = 'Unknown';
        if (rawStatus.includes('ongoing')) status = 'Ongoing';
        else if (rawStatus.includes('completed') || rawStatus.includes('complete')) status = 'Completed';

        var genres = [];
        $('.genres a, .categories a, .genre-item, .tags a').each(function (_, el) {
            var g = $(el).text().trim();
            if (g && !genres.includes(g)) genres.push(g);
        });

        var chapters = [];
        var chapterEls = $('.chapter-list li, ul.chapters li, .chapter-item');
        if (chapterEls.length === 0) chapterEls = $('.chapter-list a');

        var self = this;
        chapterEls.each(function (idx, el) {
            var item = $(el);
            var linkEl = item.is('a') ? item : item.find('a').first();
            var chapName = linkEl.find('.chapter-title, .title, span.name').text().trim() || linkEl.text().trim();
            var chapPath = linkEl.attr('href') || '';
            if (chapPath.startsWith(self.baseUrl)) {
                chapPath = chapPath.substring(self.baseUrl.length);
            }
            var releaseTime = item.find('.chapter-time, .release-time, time, span.time').text().trim() || undefined;

            if (chapName && chapPath) {
                chapters.push({
                    name: chapName,
                    path: chapPath,
                    releaseTime: releaseTime,
                    chapterNumber: idx + 1
                });
            }
        });

        return {
            path: novelPath,
            name: title,
            cover: cover,
            summary: summary,
            author: author,
            status: status,
            genres: genres.join(', '),
            chapters: chapters
        };
    };

    LightNovelWorldPlugin.prototype.parseChapter = async function (chapterPath) {
        var fullUrl = chapterPath.startsWith('http') ? chapterPath : (this.baseUrl + (chapterPath.startsWith('/') ? '' : '/') + chapterPath);
        var res = await fetchLib.fetchApi(fullUrl);
        var body = await res.text();
        var $ = cheerio.load(body);

        var container = $('#chapter-container, .chapter-content, #chapter-body, .chapter-text, .chr-c, #chr-content').first();
        if (!container.length) return '<p>No content found.</p>';

        container.find('script, style, ins, .ads, .ad-container, .ad-wrapper, .watermark, #ad-banner, iframe, .ad-box, .pub-ad').remove();
        container.find('*').each(function (_, el) {
            var attribs = el.attribs || {};
            for (var attr in attribs) {
                if (attr.startsWith('on') || attr === 'style') {
                    $(el).removeAttr(attr);
                }
            }
        });

        return container.html() ? container.html().trim() : '<p>No content found.</p>';
    };

    LightNovelWorldPlugin.prototype.searchNovels = async function (searchTerm, pageNo) {
        if (!searchTerm || !searchTerm.trim()) return [];
        var page = Math.max(1, pageNo || 1);
        var url = this.baseUrl + "/search?q=" + encodeURIComponent(searchTerm.trim()) + "&page=" + page;
        var res = await fetchLib.fetchApi(url);
        var body = await res.text();
        return this.parseNovelList(body);
    };

    LightNovelWorldPlugin.prototype.parseNovelList = function (html) {
        var $ = cheerio.load(html);
        var novels = [];
        var items = $('.novel-item, .novel-card, .novel-list li, .novel-item-item');
        var self = this;

        items.each(function (_, el) {
            var item = $(el);
            var titleEl = item.find('.novel-title, .title, h3.title a, .novel-name, a.novel-title').first();
            var linkEl = item.find("a[href*='/novel/']").first();
            var imgEl = item.find('img.cover, img.novel-cover, img').first();

            var name = titleEl.text().trim() || linkEl.attr('title') || linkEl.text().trim();
            var rawPath = linkEl.attr('href') || titleEl.attr('href') || '';
            var rawCover = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';

            if (name && rawPath) {
                if (rawPath.startsWith(self.baseUrl)) {
                    rawPath = rawPath.substring(self.baseUrl.length);
                }
                var cover = rawCover.startsWith('http') ? rawCover : (self.baseUrl + (rawCover.startsWith('/') ? '' : '/') + rawCover);
                novels.push({
                    name: name,
                    cover: cover,
                    path: rawPath
                });
            }
        });

        return novels;
    };

    return LightNovelWorldPlugin;
})();

module.exports = new LightNovelWorldPlugin();
