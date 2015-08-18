/**
 * Module dependencies.
 */
var config = require('./config/configuration'), app;


/**
 * Initial bootstrapping
 */
exports.boot = function (port, cluster) {
    process.env.PORT = port || config.port || 3000;
    app = module.exports = require('./bin/trinte').createServer();
    if (!cluster) {
        if(config.debug) console.log('App Launching in single instance mode on port: ' + process.env.PORT);
    }
    return app;
};

// allow normal node loading if appropriate
if (!module.parent) {
    exports.boot(process.env.PORT).listen(process.env.PORT);
}