/**
 * TrinteJS MVC Bootstrap
 * 
 * @project  trinte
 * @author   Alexey Gordeyev
 * @created  2013-09-27 07:25:26
 * @Params - cmd - server | script | params
 * 
 */
var util = require('util'),
        fs = require('fs'),
        os = require('os'),
        logger = require('./logger'),
        readline = require('readline');

/**
 * Main Command router
 */
util.appLauncher = {
    name: 'TestApp',
    author: '',
    description: 'Web-based Application',
    created: new Date().toISOString(),
    version: '0.0.1',
    license: 'MIT',
    command: 'help',
    server: {
        port: process.env.PORT || 3000,
        env: 'development'
    },
    engine: 'ejs', // allowed ejs|jade|hogan|jshtml|haml
    theme: 'violet',
    css: 'css', // allowed css|less|sass|stylus
    js: 'js', // allowed js|coffee
    session: false,
    auth: false,
    socket: false,
    script: {
        name: 'all',
        params: []
    }
};

util.validCommands = [
    "|",
    "V",
    "version",
    "p",
    "port",
    "h",
    "help",
    "g",
    "script",
    "s",
    "server",
    "c",
    "cluster",
    "i",
    "create-app",
    "init",
    "|"];

/**
 * Check if command exists
 * 
 * @param {String} command
 **/
util.validateCommand = function(command) {
    return util.validCommands.join("|").indexOf("|" + command + "|") > -1 ? true : false;
};

/**
 * Parse arguments
 **/
util.parseArgs = function() {
    for (var i in process.argv) {
        // Skip the first two - Node and app.js path
        if (i > 1) {
            util.initParams(process.argv, i);
        }
    }

    if (util.validateCommand(util.appLauncher.command)) {
        util.appLauncher = util.getModel(util.appLauncher);
        return util.appLauncher;
    } else {
        util.abort("Invalid command '" + util.appLauncher.command + "'");
    }
};

/**
 * Parse arguments
 * 
 * @param {Array} params
 * @param {Number} i
 **/
util.initParams = function(params, i) {
    var paramArray = params[i].split("="),
            i = parseInt(i),
            fparam = (paramArray[0] || "").replace(/^-+/, "");
     fparam = fparam.replace(/^\s+|\s+/, "");

    // Run command - must always come after the app
    if (i === 2) {
        util.appLauncher.command = (params[i] || "").replace(/^-+/, "").replace(/^\s+|\s+/, "");
        if (/g|script/.test(util.appLauncher.command)) {
            util.appLauncher.command = 'script';
        } else if (/^h|^help/.test(util.appLauncher.command)) {
            util.appLauncher.command = 'help';
        } else if (/^init|^create-app|^i/.test(util.appLauncher.command)) {
            util.appLauncher.command = 'init';
            var appname = (params[1 + i] || "").replace(/^\s+|\s+$/, "");
            if (appname !== '') {
                util.appLauncher.name = appname;
            } else {
                util.abort("Require Application name!");
            }
        } else if (util.appLauncher.command === 's' || util.appLauncher.command === 'p' || util.appLauncher.command === 'port') {
            util.appLauncher.command = 'server';
        } else if (util.appLauncher.command === 'c') {
            util.appLauncher.command = 'cluster';
        } 
    }

    // Server.port
    if ((fparam === "port" || fparam === "p") && params[1 + i] !== 'undefined') {
        util.appLauncher.server.port = params[1 + i];
        process.env.PORT = util.appLauncher.server.port;
    }
 
    if (/ejs|jade|jshtml|hogan|haml/i.test(fparam)) {
        util.appLauncher.engine = fparam;
    }

    if (/css|less|sass|stylus/i.test(fparam)) {
        util.appLauncher.css = fparam;
    }

    if (/^js$|^coffee$/i.test(fparam)) {
        util.appLauncher.js = fparam;
    }

    if (/^theme$|^db$/i.test(fparam) && params[1 + i] !== 'undefined') {
        util.appLauncher[fparam] = params[1 + i];
    }
    
    if (/^auth$/i.test(fparam)) {
        util.appLauncher.auth = true;
    }

    if (/^session$|^sess$/i.test(fparam)) {
        util.appLauncher.session = true;
    }

    if (fparam === "env" && params[1 + i] !== 'undefined') {
        if (/test|development|production/.test(params[1 + i])) {
            util.appLauncher.server.env = params[1 + i];
        }
    }

    if ((util.appLauncher.command === "g" || util.appLauncher.command === "script" || util.appLauncher.command === "test") && i === 3) {
        if (util.appLauncher.command === 'g'){
            util.appLauncher.command = "script";
        }
        util.appLauncher.script.name = fparam;
    }

    if (util.appLauncher.command === "h" || util.appLauncher.command === "help") {
        util.appLauncher.script.name = 'help';
        if (i === 3) {
            util.appLauncher.script.model = fparam;
        }
    }

    // Script params
    if ((util.appLauncher.command === 'g' || util.appLauncher.command === 'script') && i > 3) {
        util.appLauncher.command = "script";
        util.appLauncher.script.params.push(fparam);
    }
};

/**
 * Get Model name
 * 
 * @param {Object} appLauncher
 **/
util.getModel = function getModel(appLauncher) {
    var tmpNs = (appLauncher.script.params[0] || "").split('#');

    if (typeof tmpNs[1] !== 'undefined') {
        appLauncher.script.namespace = tmpNs[0];
        appLauncher.script.model = tmpNs[1];
    } else if (typeof tmpNs[0] !== 'undefined' && tmpNs[0] !== '') {
        appLauncher.script.model = tmpNs[0];
    }
    return appLauncher;
};

/**
 * Check if os Windows
 **/
util.isWindows = function isWindows() {
    return (/windows/gi.test(os.type())) ? true : false;
};

/**
 * Path delimiter
 **/
util.delimiter = function delimiter() {
    return (util.isWindows()) ? "\\" : "/";
};

/**
 * Check if express app.js exists
 * 
 * @param {String} path
 **/
util.isLibrary = function isLibrary(path) {
    return fs.existsSync(path + '/lib/trinte.js');
};

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */
util.emptyDirectory = function emptyDirectory(path, fn) {
    fs.readdir(path, function(err, files) {
        if (err && 'ENOENT' !== err.code)
            console.log(err);// throw err;
        fn(!files || !files.length);
    });
};

/**
 * Check if .trinte-status exists
 * 
 * @param {String} path
 **/
util.isBootstrap = function isBootstrap(path) {
    return fs.existsSync(path + '/.trinte-status');
};

/**
 * Critical Exit with the given `str`.
 *
 * @param {String} str
 */
util.abort = function abort(str) {
    logger.critical(str, false);
    process.exit(1);
};

/**
 * Critical Exit with the given `str`.
 *
 * @param {String} str
 */
util.exit = function exit(str) {
    logger.notice(str);
    process.exit(1);
};

/**
 * Prompt confirmation with the given `msg`.
 *
 * @param {String} msg
 * @param {Function} fn
 */

util.confirm = function confirm(msg, fn) {
    var rli = util.createInterface();
    msg = (msg || "").replace(/^\s+|\s+$/, "") + " ";
    process.stdout.write('\x1B[33m\x1B[1m');
    rli.question(msg, function(line) {
        rli.close();
        process.stdout.write('\x1B[22m\x1B[39m');
        fn(/^y(es)?/i.test(line));
    });
};

/**
 * Prompt question with the given `msg`.
 * 
 * @param {String} msg
 * @param {Function} fn
 * @param {String} color
 */
util.question = function question(msg, fn, color) {
    var rli = util.createInterface();
    color = color ? color : 'white';
    msg = (msg || "").replace(/^\s+|\s+$/, "") + " ";
    process.stdout.write('\x1B[37m\x1B[1m');
    rli.question(msg, function(line) {
        rli.close();
        process.stdout.write('\x1B[33m\x1B[39m');
        fn(line);
    });
};

util.prompt = util.question;

/**
 * Create readline Interface.
 **/
util.createInterface = function createInterface() {
    process.stdin.setRawMode(true);
    process.stdin.setEncoding('utf8');
    return readline.createInterface(process.stdin, process.stdout);
};

/**
 * Write JSON to file.
 * 
 * @param {String} filename
 * @param {Object} json
 */
util.writeJSON = function writeJSON(filename, json) {
    fs.writeFileSync(filename, JSON.stringify(json, null, 4), "utf8");
};

/**
 * Launch a server
 * 
 * @param {Object} appLauncher
 */
util.runServer = function runServer(appLauncher) {
    var path = appLauncher.projectPath;
    // Ensure we run in the local folder of the application
    process.chdir(path);
    var app = require(path + '/app').boot(process.env.PORT);
    app.listen(process.env.PORT);
};

/**
 * Launch a cluster
 * 
 * @param {Object} appLauncher
 */
util.runCluster = function runCluster(appLauncher) {
    var path = appLauncher.projectPath;
    // Ensure we run in the local folder of the application
    process.chdir(path);
    require(path + '/app-cluster').boot(process.env.PORT);
};

module.exports = util;