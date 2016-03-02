/**
 * Module dependencies.
 */
var os = require('os');
var cluster = require('cluster');
var config = require('./config/configuration');
var numCPUs = os.cpus().length;
var single = require('./app');
var app;

process.env.PORT = process.env.PORT || config.port || 3000;
process.env.HOST = process.env.HOST || config.host || '127.0.0.1';
process.env.CLUSTER = true;

/**
 * Initial bootstrapping
 * @param {Number} port
 */
exports.boot = function () {
    if (config.debug) {
        console.log('App Launching in cluster mode on port: ' + process.env.PORT);
        console.log('Workers count: ' + numCPUs);
    }

    //Create our express instance
    app = single.boot(process.env.CLUSTER);

    cluster.on('fork', function (worker) {
        if (config.debug) {
            console.log('Start worker: %s online', worker.process.pid || '');
        }
    });
    cluster.on('exit', function (worker) {
        if (config.debug) {
            console.log('Worker: %s died', worker.process.pid || '');
        }
    });

    if (cluster.isMaster) {
        // Fork workers.
        for (var i = 0; i < numCPUs; i++) {
            if (i > 0) {
                process.env.AUTOUPDATE = config.autoupdate || true;
            }
            cluster.fork();
        }
    } else {
        app.listen(process.env.PORT, process.env.HOST);
    }
};