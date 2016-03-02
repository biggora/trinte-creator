/**
 *  Upload manager
 *  
 *
 *  Created by trinte-creator script
 *  App based on TrinteJS MVC framework
 *  TrinteJS homepage http://www.trintejs.com
 **/
/*global
mergeRecursive
*/
var Uploader = require('express-uploader');
var defaultOptions = {
    debug: true,
    validate: true,
    thumbnails: true,
    thumbToSubDir: true,
    tmpDir: __dirname + '/tmp',
    publicDir: __dirname + '/public',
    uploadDir: __dirname + '/public/files',
    uploadUrl: '/files/',
    thumbSizes: [140, [100, 100]]
};


/**
 * Define middleware
 * @param {Object} options
 **/
exports.middleware = function middleware(options) {
    return function(req, res) {
        var cOptions = mergeRecursive({}, defaultOptions);
            cOptions = mergeRecursive(cOptions, options);
        var uploader = new Uploader(cOptions);
        uploader.uploadFile(req, function(data) {
            res.send(data);
        });
    };
};