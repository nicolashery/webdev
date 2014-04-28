'use strict';

var fs = require('fs');
var crypto = require('crypto');

var _ = require('lodash');
var expandFiles = require('simple-glob');
var async = require('async');

var ns = {};

ns.lastModifiedFile = function(globs, cb) {
  var srcFiles = expandFiles(globs);
  async.map(srcFiles, fs.stat, function(err, stats) {
    if (err) {
      return cb(err);
    }

    var files = _.zip([srcFiles, stats]);
    files = _.map(files, function(zipped) {
      var fileName = zipped[0];
      var stat = zipped[1];
      return {
        name: fileName,
        mtime: stat.mtime
      };
    });
    files = _.sortBy(files, 'mtime');
    var lastModified = _.last(files);
    cb(null, lastModified);
  });
};

ns.lastModifiedPathFromFile = function(file) {
  return file.name;
};

ns.lastModifiedHashFromFile = function(file) {
  var hash = file.name + '-' + file.mtime.toISOString();
  hash = crypto.createHmac('sha1', 'secret').update(hash).digest('hex');
  hash = hash.substr(0, 7);
  return hash;
};

module.exports = ns;
