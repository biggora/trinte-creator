/**
 * Created by Alex on 2/20/2016.
 */

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

var gulp = require('gulp');
var gls = require('gulp-live-server');
var gulpConfig = require('../config');

gulp.task('server', function() {

    var server = gls.new('app.js', {
        env: {
            NODE_ENV: process.env.NODE_ENV
        }
    });
    server.start();

    /* restart */
    gulp.watch([gulpConfig.jslint, gulpConfig.yaml], function() {
        server.start.bind(server)()
    });
    /* lint js */
    gulp.watch(gulpConfig.jslint, ['lint'], function (file) {
        server.notify.apply(server, [file]);
    });
    /* minify css */
    gulp.watch(gulpConfig.site.cssSrc, ['clean-css','minify-css'], function (file) {
        server.notify.apply(server, [file]);
    });
    /* uglify js */
    gulp.watch(gulpConfig.site.jsSrc, ['clean-js','uglify-js'], function (file) {
        server.notify.apply(server, [file]);
    });
});