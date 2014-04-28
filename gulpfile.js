'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var gutil = require('gulp-util');

var jshintFiles = ['gulpfile.js', 'index.js', 'lib/**/*.js'];

gulp.task('jshint', function(cb) {
  var stream = gulp.src(jshintFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));

  if (process.env.CI) {
    stream = stream.pipe(jshint.reporter('fail'));
  }

  stream.on('end', cb);
});

gulp.task('jshint-watch', ['jshint'], function(cb){
  gulp.watch(jshintFiles, ['jshint']);

  gutil.log('Watching files for changes...');

  return cb();
});

gulp.task('default', ['jshint']);
