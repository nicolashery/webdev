'use strict';

var mkdirp = require('mkdirp');

var DEFAULT_TMP_DIR = '.tmp';

module.exports = function(tmpDir) {
  tmpDir = tmpDir || DEFAULT_TMP_DIR;
  mkdirp.sync(tmpDir);
  return tmpDir;
};
