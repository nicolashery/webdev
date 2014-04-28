'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var wutil = require('./util');

var ns = {};

ns.create = function(cache) {
  cache = cache || {};
  cache = _.defaults(cache, {_meta: {}});

  var tmpDir = cache._meta.tmpDir;
  tmpDir = wutil.tmp(tmpDir);
  cache._meta.tmpDir = tmpDir;

  return cache;
};

ns.containsHash = function(cache, key, hash) {
  return (cache[key] && cache[key].hash === hash);
};

ns.updateHash = function(cache, key, hash) {
  cache[key] = {hash: hash};
  return cache;
};

ns.path = function(cache, key) {
  return path.join(ns._tmpDir(cache), ns._fsReadyKey(key));
};

ns.streamContents = function(cache, key) {
  var filePath = ns.path(cache, key);
  return fs.createReadStream(filePath);
};

ns.writeContents = function(cache, key, contents, cb) {
  var filePath = ns.path(cache, key);
  return fs.writeFile(filePath, contents, function(err) {
    if (err) {
      return cb(err);
    }

    cb(null, contents);
  });
};

ns.getEntry = function(cache, key) {
  var entry = {};
  var value = cache[key];
  if (value) {
    entry[key] = value;
  }
  return entry;
};

ns._tmpDir = function(cache) {
  return cache._meta && cache._meta.tmpDir;
};

ns._fsReadyKey = function(key) {
  key = key.replace(/\//g, '-');
  if (key[0] === '-') {
    key = key.slice(1);
  }
  return key;
};

module.exports = ns;
