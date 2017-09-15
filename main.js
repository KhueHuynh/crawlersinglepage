// 'use strict';

//CONFIG
var url = 'https://www.airbnb.com/',
    time = 600000; //1h


var Crawler = require("simplecrawler"),
    cheerio = require("cheerio"),
    _ = require('lodash'),
    fs = require('fs'),
    links = [],
    onTime = time - 30000,
    timeOut,
    crawler = Crawler(url);

function generateSiteMap() {
  var siteMapContainer = _.template('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><%= urls %></urlset>'),
      urlMap = _.template('<url><loc><%= url %></loc></url>'),
      urlMapData = '',
      siteMapString;

  for (var index in links) {
    urlMapData += urlMap({url: links[index]}) + '\n\r';
  }

  siteMapString = siteMapContainer({urls: urlMapData});

  fs.writeFile('sitemap.xml', siteMapString, function(error) {
    if (error) {
      throw error;
    }
    console.log('Qua trinh xu ly da xong. Ban da xay dung duoc sitemap co ', links.length, 'link');
  });

}

crawler
.on("fetchcomplete", function(queueItem, responseBuffer, response) {
  var currentUrl = queueItem.url,
      $ = cheerio.load(responseBuffer.toString("utf8")),
      languageUrls = $('[hreflang]'),
      languageHref;

  if (links.indexOf(currentUrl) == -1) {
    links.push(currentUrl);
  }


  try {
    for (var index in languageUrls) {
      languageHref = $(languageUrls[index]).attr('href');
      if (languageHref && currentUrl !== languageHref) {
        if (links.indexOf(languageHref) == -1) {
          links.push(languageHref);
        }
      }
    }
  } catch(e) {
    console.log('Something incorrect. Url: ', currentUrl);
  }
})
.on("complete", function() {
  if(timeout) {
    clearTimeout(timeout);
  }
  generateSiteMap();
});

crawler.userAgent = 'Googlebot/2.1 (+http://www.google.com/bot.html)';

crawler.interval = 1000; //1 second
crawler.maxConcurrency = 2;

crawler.languageHref

timeOut = setTimeout(function() {
  console.log('-------------------------------------------------------------------------------')
  generateSiteMap();
}, onTime);

crawler.start();