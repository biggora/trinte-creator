/**
 * Created by Alex on 8/23/2015.
 */
var gulp = require('gulp');
var gulpConfig = require('../config');
var config_site = gulpConfig.site;
var gulpFilter = require('gulp-filter');
var rimraf = require('gulp-rimraf');

gulp.task('clean-css', function () {
    var filter = gulpFilter(['**/*.min.css','**/*.css.map']);
    return gulp.src(config_site.cssSrc, {read: false})
        .pipe(filter)
        .pipe(rimraf({force: true}));
});

gulp.task('clean-js', function () {
    var filter = gulpFilter(['**/*.min.js','**/*.js.map']);
    return gulp.src(config_site.jsSrc, {read: false})
        .pipe(filter)
        .pipe(rimraf({force: true}));
});