/**
 * Created by Alex on 8/23/2015.
 */
var gulp = require('gulp');

gulp.task('default', ['lint','minify-css','uglify-js'], function() {
    return true;
});