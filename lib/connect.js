'use strict';

var url = require('url');

var _ = require('lodash');
var prettyTime = require('pretty-hrtime');

var cache = require('./cache');
var files = require('./files');
var wutil = require('./util');

var ns = {};

ns.middleware = function(opts) {
  opts = opts || {};

  opts = _.defaults(opts, {
    contentType: 'text/plain',
    cache: null,
    key: null,
    src: ['**/*'],
    build: function(cb) { return cb(null, ''); }
  });

  if (!opts.cache) {
    opts.cache = cache.create();
  }

  return function(req, res, next) {
    res.setHeader('Content-Type', opts.contentType);

    var start = wutil.time();
    var key = opts.key || ns._requestUrlPath(req);

    var cacheContainsHash = cache.containsHash.bind(cache, opts.cache, key);
    var streamCacheContents = cache.streamContents.bind(cache, opts.cache, key);
    var writeCacheContents = cache.writeContents.bind(cache, opts.cache, key);
    var updateCacheHash = cache.updateHash.bind(cache, opts.cache, key);
    var getCacheEntry = cache.getEntry.bind(cache, opts.cache, key);
    var cachePath = cache.path(opts.cache, key);

    files.lastModifiedFile(opts.src, function(err, file) {
      if (err) {
        return next(err);
      }

      var lastModifiedPath = files.lastModifiedPathFromFile(file);
      var hash = files.lastModifiedHashFromFile(file);

      if (cacheContainsHash(hash)) {
        streamCacheContents()
          .pipe(res)
          .on('finish', function() {
            var duration = wutil.time(start);
            duration = prettyTime(duration);
            ns.logWithReq(req, 'Served from cache',
              '\''+wutil.colors.cyan(cachePath)+'\'',
              'in', wutil.colors.magenta(duration));
          });
        return;
      }

      opts.build(function(err, contents) {
        if (err) {
          return next(err);
        }

        writeCacheContents(contents, function(err, contents) {
          if (err) {
            return next(err);
          }

          updateCacheHash(hash);
          res.end(contents);

          var duration = wutil.time(start);
          duration = prettyTime(duration);
          ns.logWithReq(req, 'Last file changed since cache',
            '\''+wutil.colors.cyan(lastModifiedPath)+'\'');
          ns.logWithReq(req, 'Cache updated with',
            wutil.colors.grey(JSON.stringify(getCacheEntry())));
          ns.logWithReq(req, 'Built and served in',
            wutil.colors.magenta(duration));
          });
      });
    });
  };
};

ns.logWithReq = function(req) {
  var method = req.method;
  var path = ns._requestUrlPath(req);
  var args = Array.prototype.slice.call(arguments, 1);
  var prefix = '['+wutil.colors.grey(method)+' '+wutil.colors.cyan(path)+']';
  args.unshift(prefix);
  wutil.log.apply(wutil.log, args);
  return this;
};

ns._requestUrlPath = function(req) {
  var originalUrl = url.parse(req.originalUrl || req.url);
  return originalUrl.pathname;
};

module.exports = ns;
