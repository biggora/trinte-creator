/**
 * Module dependencies.
 */
var fs = require('fs');
var express = require('express');
var multiparty = require('connect-multiparty');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var events = require('events');
var path = require('path');
var envConf = require('../config/environment');
var config = require('../config/configuration');
var database = require('../config/database');
var middleware = require('../config/middleware');
var session = require('../config/session');
var Trouter = require('./router');
var Resource = Trouter.Resource;
var locales = require('./locales');
var util = require('util');
var utils = require('./utils');
var http = require('http');
var flash = require('./flash');
var helper = require('./helper');
var engine = require('ejs-locals');

/**
 * Library version.
 **/
exports.version = '0.2.5';

/**
 * simplistic model support
 *
 * @param {TrinteJS} trinte - trinte app descriptor.
 * @param {Schema}  schema
 * @param {String}  file
 */
function bootModel(trinte, schema, file) {
    if (/\.js$/i.test(file)) {
        var name = file.replace(/\.js$/i, '');
        var modelDir = path.resolve(__dirname, '../app/models');
        trinte.models[name] = require(modelDir + '/' + name)(schema);// Include the mongoose file
        global[name] = trinte.models[name];
    }
}

/**
 * Bootstrap models
 *
 * @param {TrinteJS} trinte - trinte app descriptor.
 */
function bootModels(trinte) {
    var caminte = require('caminte');
    var Schema = caminte.Schema;
    var db = database[process.env.NODE_ENV || 'dev'];
    var schema = new Schema(db.driver, db);
    var modelsDir = path.resolve(__dirname, '../app/models');
    trinte.caminte = schema;
    global.caminte = schema;

    try {
        fs.readdir(modelsDir, function (err, files) {
            if (err) {
                console.log(err);
            }
            if (!files || files.length === 0) {
                if (config.debug) {
                    console.log('models_loaded');
                    console.log('Models files does not found');
                }
                trinte.emit('models_loaded');
            } else {
                var count = files.length;
                if (count > 0) {
                    files.forEach(function (file) {
                        bootModel(trinte, schema, file);
                        if (--count === 0) {
                            if ('function' === typeof schema.autoupdate) {
                                if (!process.env.AUTOUPDATE) {
                                    schema.autoupdate(function (err) {
                                        if (config.debug) {
                                            console.log('Run Caminte driver Autoupdate!');
                                        }
                                        process.env.AUTOUPDATE = true;
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }
                            }
                            trinte.emit('models_loaded');
                            if (config.debug) {
                                console.log('models_loaded');
                            }
                        }
                    });
                }
            }
        });
    } catch (err) {
        console.log('Error: Models dir does not found');
        process.exit(1);
    }
}

/**
 * Run app configutators in `conf/` and `conf/env`.
 * Also try to monkey patch ejs and jade. **weird**
 *
 * @param {TrinteJS} trinte - trinte app descriptor.
 * @param {Function} callback
 */
function configureApp(trinte, callback) {
    var app = trinte.app;
    var root = trinte.root;

    envConf(app, express);

    app.use(multiparty({
        uploadDir: config.parser.uploadDir,
        keepExtensions: config.parser.keepExtensions,
        encoding: config.parser.encoding
    }));
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({extended: true}));
    // parse application/json
    app.use(bodyParser.json());
    // parse application/vnd.api+json as json
    app.use(bodyParser.json({type: 'application/vnd.api+json'}));
    app.use(methodOverride('X-HTTP-Method'));              // Microsoft
    app.use(methodOverride('X-HTTP-Method-Override'));     // Google/GData
    app.use(methodOverride('X-Method-Override'));          // IBM
    app.use(methodOverride('_method')); 	               // simulate DELETE and PUT
    app.use(methodOverride(function (req) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));
    // Accepts json response
    app.use(function (req, res, next) {
        if (req.accepts('json') !== undefined) {
            req.params.format = 'json';
        }
        next();
    });
    app.use(cookieParser(config.session.secret));
    session(app, express);
    // Accepts json response
    app.use(function (req, res, next) {
        if (req.query.language !== undefined || req.query.lang !== undefined) {
            if (req.session) {
                req.session.language = req.query.language || req.query.lang;
            }
        }
        if (req.session && !req.session.language) {
            req.session.language = config.language;
        }
        next();
    });
    // Before router to enable dynamic routing
    app.use(express.static(root + '/public'));
    // Setup ejs views as default, with .ejs as the extension
    app.set('port', process.env.PORT || config.port);
    app.set('views', root + '/app/views');
    app.engine('ejs', engine);
    app.set('view engine', 'ejs');
    app.set('view options', {
        complexNames: true
    });
    app.use(helper.init(utils));
    app.use(utils.XMLResponse());
    app.use(utils.RSSResponse());
    app.use(utils.ErrorResponse());
    app.use(utils.fixCSRF());
    app.use(flash());
    app.use(locales.translator());
    middleware(app, express);

    // Initialize routes params
    require(root + '/config/params')(utils, app);
    callback(app);
}


function TrinteJS(app, root) {
    app.trinte = this;
    this.__defineGetter__('rootModule', function () {
        return module.parent;
    });
    this.app = app;
    this.root = app.root = root;
    this.utils = utils;
    this.helpers = {};
    this.models = {};
    this.middleware = [];
    this.app.mergeLocals = utils.mergeLocals;
    this.server = http.createServer(app);
    // socket.io support
    try {
        var sio = require('socket.io');
        this.app.io = sio(this.server);
    } catch (err) {
        this.app.io = null;
    }

    app.listen = function (port, host, cb) {
        this.server.listen(port, host, cb);
    }.bind(this);
}

util.inherits(TrinteJS, events.EventEmitter);

/**
 * Initialize trinte application:
 *
 *  - load modules
 *  - run configurators (conf/environment, conf/env/{env})
 *  - init controllers
 *  - init extensions (including ORM and db/schema)
 *  - init assets compiler
 *  - init models
 *  - add routes
 *  - start http server
 *  - locales
 *  - loggers
 *  - observers
 *  - assets
 *
 * @param {Object} app - express server, may contain optional `root` member.
 * @param {String} root
 * @return {TrinteJS} trinte - trinte app descriptor.
 */
exports.init = function init(app, root) {
    // create API publishing object
    var trinte = new TrinteJS(app, root || process.cwd());
    var map = new Resource(app);

    bootModels(trinte);

    trinte.on('models_loaded', function () {
        configureApp(trinte, function () {
            /* jshint unused: false */
            var ModelsHelper = require('../app/helpers/ModelsHelper');
            var ApplicationHelper = require('../app/helpers/ApplicationHelper');
            for (var key in ApplicationHelper) {
                global[key] = ApplicationHelper[key];
            }
            var ViewsHelper = require('../app/helpers/ViewsHelper');
            app.mergeLocals(ViewsHelper);
            trinte.emit('helpers_loaded');
            if (config.debug) {
                console.log('helpers_loaded');
            }
        });
    });

    trinte.on('helpers_loaded', function () {
        var locales;
        try {
            locales = require('./locales');
        } catch (err) {
            console.log('Yaml Error 0: ', err);
        }
        global.__lc = locales.load();
        trinte.emit('locales_loaded');
        if (config.debug) {
            console.log('locales_loaded');
        }
    });

    trinte.on('locales_loaded', function () {
        // Initialize app routes
        var routes = require('../config/routes');
        routes(map, app);
        // Initialize errors routes
        var errors = require(root + '/config/errors');
        errors(app);
        trinte.emit('routes_loaded');
        if (config.debug) {
            console.log('routes_loaded');
        }
    });

    trinte.on('routes_loaded', function () {
        global.pathTo = map.pathTo;
    });

    return trinte;
};

/**
 * Create http server object. Automatically hook up SSL keys stored in
 * app.root/config/tsl.{cert|key}
 *
 * @param {Object} options - example:
 *   {root: __dirname, any other options for express}.
 * @return {Function} express server.
 */
exports.createServer = function (options) {
    options = options || {};
    if (typeof options === 'string') {
        options = {
            root: options
        };
    }
    var root = options.root || process.cwd();
    delete options.root;
    var app = express(options);
    exports.init(app, root);
    if (typeof express.version === 'undefined') {
        app.express2 = false;
        app.express3 = true;
    } else {
        app.express2 = !!express.version.match(/^2/);
        app.express3 = !!express.version.match(/^3/);
        app.express4 = !!express.version.match(/^4/);
    }
    return app;
};