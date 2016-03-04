/**
 * Created by Alex on 2/20/2016.
 */

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

var options = {};
var gulp = require('gulp');
var gls = require('gulp-live-server');
var gulpConfig = require('../config');

gulp.task('server', function() {

    options.env = process.env;
    options.port = 35729;

    var server = gls.new('app.js', options);

    server.start();

    /* app restart */
    gulp.watch([gulpConfig.jslint, gulpConfig.yaml], function() {
        server.start.bind(server)();
    });
    /* only reload */
    gulp.watch(gulpConfig.views, function (evt) {
        server.notify.apply(server, [evt]);
    });
    /* lint js */
    gulp.watch(gulpConfig.jslint, function() {
        gulp.start('lint');
        server.start.bind(server)();
    });
    /* minify css */
    gulp.watch(gulpConfig.site.cssSrc, function (evt) {
        gulp.start('clean-css','minify-css');
        server.notify.apply(server, [evt]);
    });
    /* uglify js */
    gulp.watch(gulpConfig.site.jsSrc, function (evt) {
        gulp.start('clean-js','uglify-js');
        server.notify.apply(server, [evt]);
    });
});