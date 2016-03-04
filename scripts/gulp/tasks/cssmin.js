/**
 * Created by Alex on 8/23/2015.
 */
var gulp = require('gulp');
var gulpConfig = require('../config');
var config_site = gulpConfig.site;
var minifyCSS = require('gulp-cssnano');
var size = require('gulp-filesize');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var gulpFilter = require('gulp-filter');

gulp.task('minify-css', ['clean-css'], function () {
    var filter = gulpFilter(['**/*.css', '**/!*.min.css']);
    return gulp.src(config_site.cssSrc)
        .pipe(filter)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(minifyCSS({keepBreaks: true}))
        .pipe(rename({suffix: '.min'}))
        .pipe(size())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config_site.cssDest));
});
