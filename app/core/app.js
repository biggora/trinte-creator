/**
 * Module dependencies.
 */
var config = require('./config/configuration'), app;
var trinte = require('./bin/trinte');

process.env.PORT = process.env.PORT || config.port || 3000;
process.env.HOST = process.env.HOST || config.host || '127.0.0.1';

exports.trinte = trinte;

/**
 * Initial bootstrapping
 */
exports.boot = function (cluster) {
    app = module.exports = trinte.createServer();
    if (!cluster) {
        console.log('App Launching in single instance mode on port: ' + process.env.PORT);
    }
    return app;
};

// allow normal node loading if appropriate
if (!module.parent) {
    return exports.boot().listen(process.env.PORT, process.env.HOST);
}