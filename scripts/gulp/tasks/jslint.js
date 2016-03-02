/**
 * Created by Alex on 12/4/2015.
 */
var path = require('path');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var gulpFilter = require('gulp-filter');
var size = require('gulp-filesize');
var filter = gulpFilter(['*.js']);
var gulpConfig = require('../config');

gulp.task('lint', function () {
    return gulp.src(gulpConfig.jslint)
        .pipe(jshint())
        .pipe(size())
        .pipe(jshint.reporter('default'));
});
