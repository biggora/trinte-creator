/**
 * Created by Alex on 8/23/2015.
 */
var prefix = "./public";

module.exports = {
    images: {
        src: prefix + "/img/**",
        dest: prefix + "/img"
    },
    site: {
        cssSrc: prefix + '/css/**',
        cssDest: prefix + '/css',
        jsSrc: prefix + '/js/**',
        jsDest: prefix + '/js'
    },
    views: './app/views/**/*.ejs',
    yaml: './config/locales/**/*.yml',
    jslint: ['./*.js', './bin/*.js', './config/**/*.js', './app/**/*.js']
};