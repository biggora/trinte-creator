/**
 * Created by Alex on 8/23/2015.
 */
var gulp = require('gulp');
var gulpConfig = require('../config');
var config_site = gulpConfig.site;
var size = require('gulp-filesize');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var gulpFilter = require('gulp-filter');

gulp.task('uglify-js', function () {
    var filter = gulpFilter(['**/*.js', '**/!*.min.js']);
    return gulp.src(config_site.jsSrc)
        .pipe(filter)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(size())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config_site.jsDest));
});