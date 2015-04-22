/**
 *  TrinteJS Script Creator
 *
 *  @project     TrinteJS
 *  @version     0.0.1
 *  @package     trinte-creator
 *  @author      Aleksejs Gordejevs
 *  @created     2013-09-26 11:51:06
 *
 *  Created by init script
 *  App based on TrinteJS MVC framework
 *  TrinteJS homepage http://www.trintejs.com
 **/

/**
 * Explicit module dependencies
 */
var fs = require('fs');
var wrench = require('wrench');
var path = require('path');
var util = require('./util');
var logger = require('./logger');
var parser = require('ejs');
var themer = require('trinte-themes');
var exec = require('child_process').exec;

parser.delimiter = '?';
parser.open = '<?';
parser.close = '?>';

/**
 * Library version.
 **/
exports.version = require('../package.json').version;


/**
 * Show help.
 *
 * @param {Objest} appLauncher
 * @param {String} version
 **/
exports.showHelp = function showHelp(appLauncher, version) {
    var script = (typeof appLauncher.script.model === 'undefined') ? 'all' : appLauncher.script.model;
    var helpFile = __dirname + '/../scripts/help/create-' + script + '.help.ejs';

    if (fs.existsSync(helpFile)) {
        var ret = exports.readAndRenderEjs(helpFile, appLauncher, version);
        logger.notice(ret);
    } else {
        logger.status('#   create ' + helpFile);
    }
};

/**
 * Create Application scripts.
 *
 * @param {Object} appLauncher
 **/
exports.createApp = function createApp(appLauncher) {
    util.emptyDirectory(appLauncher.projectPath + '/' + appLauncher.name, function (empty) {
        if (empty) {
            exports.buildApp(appLauncher);
        } else {
            util.confirm('This will over-write the existing application, continue (y/n)?', function (ok) {
                if (ok) {
                    appLauncher = exports.loadPackageInfo(appLauncher);
                    exports.buildApp(appLauncher);
                } else {
                    util.exit('Process Aborting!');
                }
            });
        }
    });
};

/**
 * Create Application scripts.
 *
 * @param {Object} appLauncher
 **/
exports.buildApp = function buildApp(appLauncher) {
    util.question('Enter Project author name (' + appLauncher.author + ')>', function (author) {
        if (author) {
            appLauncher.author = author;
        }
        util.question('Enter Project description (' + appLauncher.description + ')>', function (description) {
            if (description) {
                appLauncher.description = description;
            }
            util.question('Enter Project version (' + appLauncher.version + ')>', function (version) {
                if (version) {
                    appLauncher.version = version;
                }
                util.question('Enter Project license (' + appLauncher.license + ')>', function (license) {
                    if (license) {
                        appLauncher.license = license;
                    }
                    process.chdir(appLauncher.projectPath);
                    exports.buildAppStructure(appLauncher, function () {
                        logger.verbose('\nApplication created!');
                        logger.notice('\nNext step install dependencies:'.bold);
                        logger.notice(('cd ' + appLauncher.projectPath + ' && npm install').bold);
                    });
                });
            });
        });
    });
};

/**
 * Create Application scripts.
 *
 * @param {Object} appLauncher
 **/
exports.createScript = function createScript(appLauncher) {
    var script_name = "", options = {side: 'frontend'};

    if (util.isBootstrap(appLauncher.projectPath)) {
        logger.verbose("Start generate " + appLauncher.script.name);
    } else {
        util.abort("Invalid TrinteJS project!");
    }
    if(appLauncher.side) {
        options.side = appLauncher.side;
    }
    switch (appLauncher.script.name) {
        case "controller":
        case "model":
        case "view":
        case "rest":
            script_name = "create-" + appLauncher.script.name;
            break;
        case "crud":
             script_name = "generate-all";
            break;
        case "backend-crud":
            script_name = "generate-all";
            break;
        default:
            options.side = 'frontend';
            script_name = appLauncher.script.name;
    }

    try {
        var script = require('./' + script_name);
    } catch (err) {
        util.abort("You must specifiy a correct script name!" + script_name);
    }
    appLauncher = exports.loadPackageInfo(appLauncher, true);

    var params = appLauncher.script.params || [];
    options.action = script_name.replace("create-", "");

    if (params.length === 0) {
        util.abort("You must specifiy a name to generate the scripts against!");
    }

    var tmpName = params[0];
    var tmpTpl = tmpName.split(':');
    var tmpNs = tmpTpl[0].split('#');

    if (typeof tmpNs[1] !== 'undefined') {
        options.namespace = tmpNs[0];
        options.model = tmpNs[1];
    } else {
        options.model = tmpTpl[0];
    }

    if (/admin|backend/i.test(options.namespace)) {
        options.side = 'backend';
    }

    if (typeof tmpTpl[1] !== 'undefined') {
        options.anyside = tmpTpl[1];
    }
    options.bootstrapPath = appLauncher.bootstrapPath;
    script.execute(params.slice(1), appLauncher.projectPath, options, appLauncher);
};

/**
 * Create Application Structure.
 *
 * @param {Object} appLauncher
 * @param {Function} callback
 **/
exports.buildAppStructure = function buildAppStructure(appLauncher, callback) {
    var rootPath = appLauncher.projectPath + '/' + appLauncher.name;
    var scriptsPath = __dirname + '/../scripts';
    var relPath = path.relative(".", rootPath).replace(/\\/gi, "/");
    var tplEngine = 'trinte-ejs',  viewEngine;
    var rAddons = {inc: [], body: []};

    exports.createDir(rootPath, true);

    if(!appLauncher.side) {
        appLauncher.side = 'frontend';
    }


    try {
        process.chdir(rootPath);
        logger.msg('#   chdir  ./' + relPath);
    } catch (err) {
        util.abort('#   Directory ' + rootPath + ' not created!');
    }

    var filter = "." + appLauncher.js + "$";
    appLauncher.projectPath = rootPath;
    exports.copyFiles(appLauncher.bootstrapPath + '/app/core/', rootPath, new RegExp(filter + "|.md$"));
    exports.createDir(rootPath + '/bin');
    exports.copyFiles(appLauncher.bootstrapPath + '/app/bin/', rootPath + '/bin', new RegExp(filter));
    exports.createDir(rootPath + '/config');
    exports.copyFiles(appLauncher.bootstrapPath + '/app/config/', rootPath + '/config', new RegExp(filter + "|.yml$"));
    exports.createDir(rootPath + '/app');
    exports.createDir(rootPath + '/app/helpers');
    exports.copyFiles(scriptsPath + '/helpers/', rootPath + '/app/helpers', new RegExp(filter));
    exports.createDir(rootPath + '/app/lib');
    exports.copyFiles(scriptsPath + '/lib/', rootPath + '/app/lib', new RegExp(filter));

    try {
        if (!/^ejs$|^jade$|^jshtml$|^hogan$|^haml$/i.test(appLauncher.engine)) {
            appLauncher.engine = 'ejs';
        }
        tplEngine = 'trinte-' + appLauncher.engine;
        viewEngine = require(tplEngine);
    } catch (err) {
        console.log('ERROR Load view engine: ', err);
    }

    exports.createDir(rootPath + '/app/controllers');
    exports.writeModelFile(scriptsPath + '/controllers/AppsController.ejs', rootPath + '/app/controllers/AppsController.' + appLauncher.js, appLauncher);
    exports.createDir(rootPath + '/app/models');
    if (appLauncher.session === true) {
        exports.writeModelFile(appLauncher.bootstrapPath + '/app/snippets/session-store.ejs', appLauncher.projectPath + '/config/session.' + appLauncher.js, appLauncher);
        // exports.writeModelFile(scriptsPath + '/models/Session.ejs', rootPath + '/app/models/Session.' + appLauncher.js, appLauncher);
    } else {
        exports.writeModelFile(appLauncher.bootstrapPath + '/app/snippets/session.ejs', appLauncher.projectPath + '/config/session.' + appLauncher.js, appLauncher);
    }

    if (appLauncher.auth === true) {
        exports.createDir(rootPath + '/config/authorization');
        exports.writeModelFile(appLauncher.bootstrapPath + '/app/snippets/local-auth.ejs', appLauncher.projectPath + '/config/authorization/local.' + appLauncher.js, appLauncher);
        exports.writeModelFile(appLauncher.bootstrapPath + '/app/snippets/middleware-auth.ejs', appLauncher.projectPath + '/config/middleware.' + appLauncher.js, appLauncher);
        rAddons.inc.push("var Auth = require('./authorization/local');");
        rAddons.body.push("       map.post('/login', Auth.localAuth('/login', '/'));");
        rAddons.body.push("       map.all('/logout', Auth.logOut( '/' ));");
    } else {
        exports.writeModelFile(appLauncher.bootstrapPath + '/app/snippets/middleware.ejs', appLauncher.projectPath + '/config/middleware.' + appLauncher.js, appLauncher);
    }

    if (appLauncher.mailer === true) {
        exports.createDir(rootPath + '/config/addons');
        exports.writeModelFile(appLauncher.bootstrapPath + '/app/snippets/mailer.ejs', appLauncher.projectPath + '/config/addons/mailer.' + appLauncher.js, appLauncher);
        rAddons.inc.push("var Mail = require('./addons/mailer');");
        rAddons.body.push("       map.post('/sendmail', Mail.mailSender());");
    }

    if (appLauncher.uploader === true) {
        exports.createDir(rootPath + '/config/addons');
        exports.writeModelFile(appLauncher.bootstrapPath + '/app/snippets/uploader.ejs', appLauncher.projectPath + '/config/addons/uploader.' + appLauncher.js, appLauncher);
        rAddons.inc.push("var Uploader = require('./addons/uploader');");
        rAddons.body.push("       map.post('/uploading', Uploader.middleware());");
    }

    if (appLauncher.cart === true) {
        exports.createDir(rootPath + '/config/addons');
        exports.writeModelFile(appLauncher.bootstrapPath + '/app/snippets/cart.ejs', appLauncher.projectPath + '/config/addons/cart.' + appLauncher.js, appLauncher);
        rAddons.inc.push("var Cart = require('./addons/cart');");
        rAddons.body.push("       map.get('/cart', Cart.getProductFromCart());");
        rAddons.body.push("       map.post('/cart', Cart.addProductToCart());");
    }

    if (appLauncher.recaptcha === true) {
        exports.createDir(rootPath + '/config/addons');
        exports.writeModelFile(appLauncher.bootstrapPath + '/app/snippets/recaptcha.ejs', appLauncher.projectPath + '/config/addons/recaptcha.' + appLauncher.js, appLauncher);
        rAddons.inc.push("var Recaptcha = require('./addons/recaptcha');");
        rAddons.body.push("        /**");
        rAddons.body.push("        * recapcha usage Recaptcha.middleware()");
        rAddons.body.push("        **/");
    }

    if (appLauncher.socket === true) {
        rAddons.inc.push("var config = require('./configuration');");
        rAddons.body.push("       app.io.on('connection', function (socket) {");
        rAddons.body.push("          if (config.debug) console.log('a client connected');");
        rAddons.body.push("          socket.on('disconnect', function () {");
        rAddons.body.push("             if (config.debug) console.log('client disconnected');");
        rAddons.body.push("          });");
        rAddons.body.push("       });");
    }

    var routesFile = fs.readFileSync(appLauncher.bootstrapPath + '/app/snippets/routes.ejs', 'utf8');
    routesFile = routesFile
        .replace('{ADDONSINC}', rAddons.inc.join('\n'))
        .replace('{ADDONSBODY}', rAddons.body.join('\n'));
    fs.writeFileSync(appLauncher.projectPath + '/config/routes.' + appLauncher.js, routesFile, 'utf8');

    var coreView = viewEngine.getTemplatesDir();
    var vloc = {
        title: '',
        pack: appLauncher.name,
        description: appLauncher.description,
        version: appLauncher.version,
        author: appLauncher.author,
        debug: false,
        open: "<?",
        close: "?>"
    };
    var targetViews = rootPath + '/app/views';
    exports.createDir(targetViews);

    process.nextTick(function () {
        fs.writeFileSync(targetViews + '/_layout' + viewEngine.extension, parser.render(fs.readFileSync(coreView + '/'+appLauncher.side+'/_layout' + viewEngine.extension, 'utf8'), vloc), 'utf8');
        fs.writeFileSync(targetViews + '/_header' + viewEngine.extension, parser.render(fs.readFileSync(coreView + '/'+appLauncher.side+'/_header' + viewEngine.extension, 'utf8'), vloc), 'utf8');
        fs.writeFileSync(targetViews + '/_footer' + viewEngine.extension, parser.render(fs.readFileSync(coreView + '/'+appLauncher.side+'/_footer' + viewEngine.extension, 'utf8'), vloc), 'utf8');
        fs.writeFileSync(targetViews + '/_messages' + viewEngine.extension, parser.render(fs.readFileSync(coreView + '/'+appLauncher.side+'/_messages' + viewEngine.extension, 'utf8'), vloc), 'utf8');
        fs.writeFileSync(targetViews + '/login' + viewEngine.extension, parser.render(fs.readFileSync(coreView + '/'+appLauncher.side+'/login' + viewEngine.extension, 'utf8'), vloc), 'utf8');
    });

    exports.createDir(targetViews + '/app');
    exports.copyFiles(coreView + '/'+appLauncher.side+'/app', targetViews + '/app', new RegExp('.' + viewEngine.extension + "$"));
    var targetErrors = rootPath + '/app/views/errors';
    exports.createDir(targetErrors);
    var layoutOrg = fs.readFileSync(coreView + '/errors/_layout' + viewEngine.extension, 'utf8');
    var layoutParsed = parser.render(layoutOrg, vloc);
    process.nextTick(function () {
        fs.writeFileSync(targetErrors + '/_layout' + viewEngine.extension, layoutParsed, 'utf8');
    });
    var pubDir = themer.getPiblicDir();
    var themeDir = themer.getCurThemeDir(appLauncher.theme);
    var rgExt = new RegExp('([0-9]{3})' + viewEngine.extension + "$");
    exports.copyFiles(coreView + '/errors', targetErrors, rgExt);
    exports.createDir(rootPath + '/public');
    exports.copyFiles(pubDir, rootPath + '/public');
    exports.createDir(rootPath + '/public/' + appLauncher.css);
    exports.copyFiles(themeDir, rootPath + '/public/' + appLauncher.css, new RegExp('.' + appLauncher.css + "$"));

    if (!appLauncher.db) {
        appLauncher.db = ''
    }
    var aDb = appLauncher.db.split(':');
    var dbDriver = aDb[0] || "memory";
    var dfDb = {
        title: '',
        pack: appLauncher.name,
        description: appLauncher.description,
        version: appLauncher.version,
        author: appLauncher.author,
        driver: dbDriver,
        host: '',
        port: '',
        username: '',
        password: ''
    };


    if (/sqlite/i.test(dbDriver)) {
        dfDb.host = "";
        dfDb.database = aDb[1] || './db/trinte-dev.sqlite';
        if (/\/db\//i.test(dfDb.database)) {
            exports.createDir(rootPath + '/db');
        }
    } else {
        if (/^http/i.test(aDb[1])) {
            dfDb.url = aDb[1] || "";
        } else {
            dfDb.host = "localhost";
            dfDb.port = aDb[2] || "";
            dfDb.username = aDb[3] || "root";
            dfDb.password = aDb[4] || "";
            dfDb.database = aDb[1] || "trinte-dev";
        }
    }

    switch (dbDriver) {
        case 'sqlite3':
        case 'mysql':
        case 'mongodb':
        case 'mongoose':
        case 'nano':
        case 'neo4j':
        case 'redis':
        case 'tingodb':
            appLauncher.dbdriver = dbDriver;
            break;
        case 'sqlite':
            appLauncher.dbdriver = 'sqlite3';
            break;
        case 'postgres':
            appLauncher.dbdriver = 'pg';
            break;
        case 'maria':
        case 'mariadb':
            appLauncher.dbdriver = 'mysql';
            break;
        case 'rethinkdb':
            appLauncher.dbdriver = 'rethinkdb';
            appLauncher.deps = ['generic-pool', 'moment'];
            break;
        case 'riak':
            appLauncher.dbdriver = 'riak-js';
            appLauncher.deps = ['node-uuid'];
            break;
        default:
            appLauncher.dbdriver = 'memory';
    }

    var dloc = dfDb;
    dloc.open = "<?";
    dloc.close = "?>";

    if (dloc.driver === 'sqlite3') {
        if (!/\//.test(dloc.database)) {
            exports.createDir(rootPath + '/db');
            dloc.database = './db/' + dloc.database;
        }
    }
    fs.writeFileSync(rootPath + '/config/database.' + appLauncher.js, parser.render(fs.readFileSync(appLauncher.bootstrapPath + '/app/snippets/database.ejs', 'utf8'), dloc), 'utf8');

    [
        'logs',
        'uploads'
    ].forEach(function (dir) {
            exports.createDir(rootPath + '/' + dir);
        });
    exports.createPackageInfo(appLauncher);
    exports.copyLicense(appLauncher);
    logger.status('#   update ./' + relPath + '/package.json');
    fs.writeFileSync(rootPath + '/.trinte-status', 'created: ' + new Date().toISOString(), "utf8");
    logger.status('#   update ./' + relPath + '/.trinte-status');
    callback && callback();
};

/**
 * Create Directory.
 *
 * @param {String} dir
 **/
exports.createDir = function createDir(dir) {
    var relPath = path.relative(".", dir).replace(/\\/gi, "/");
    if (fs.existsSync(dir)) {
        logger.data('#   exists ./' + relPath);
    } else {
        wrench.mkdirSyncRecursive(dir, 0755);
        logger.status('#   create ./' + relPath);
    }
};

/**
 * Copy files.
 *
 * @param {String|Array} from
 * @param {String} to
 * @param {RegExp} filter
 **/
exports.copyFiles = function copyFiles(from, to, filter) {
    var relPath = path.relative(".", to).replace(/\\/gi, "/");
    if (typeof from === 'string') {
        from = [from];
    }
    if (!fs.existsSync(to)) {
        wrench.mkdirSyncRecursive(to, 0755);
        logger.status('#   create ./' + relPath);
    }

    from.forEach(function (file) {
        filter = typeof filter === 'undefined' ? new RegExp(".*") : filter;
        var cto = to + util.delimiter() + path.basename(file);
        var stats = fs.statSync(file);
        relPath = path.relative(".", cto).replace(/\\/gi, "/");

        if (stats.isFile()) {
            if (filter.test(file)) {
                if (fs.existsSync(cto)) {
                    logger.data('#   exists ./' + relPath);
                    fs.unlinkSync(cto);
                } else {
                    logger.status('#   create ./' + relPath);
                }
                fs.createReadStream(file).pipe(fs.createWriteStream(cto));
            }
        } else if (stats.isDirectory()) {
            if (!fs.existsSync(file)) {
                wrench.mkdirSyncRecursive(file, 0755);
                logger.status('#   create ./' + relPath);
            }
            var files = fs.readdirSync(file);
            files.forEach(function (mfile) {
                var ctats = fs.statSync(file + '/' + mfile), tto = to;
                if (ctats.isDirectory()) {
                    tto = to + '/' + mfile;
                }
                exports.copyFiles(file + '/' + mfile, tto, filter);
            });
        }
    });
};

/**
 * Read file package.json.
 *
 * @param {String} path
 **/
exports.readPackageInfo = function readPackageInfo(path) {
    var json;
    try {
        json = require(path);
    } catch (err) {
        util.abort('Invalid or not found file package.json!');
    }
    return json;
};

/**
 * Read file package.json.
 *
 * @param {Object} appLauncher
 * @param {Boolean} direct
 **/
exports.loadPackageInfo = function loadPackageInfo(appLauncher, direct) {
    var pathToPackage;
    if (direct) {
        pathToPackage = appLauncher.projectPath;
    } else {
        pathToPackage = new RegExp(appLauncher.name).test(appLauncher.projectPath) ? appLauncher.projectPath : appLauncher.projectPath + '/' + appLauncher.name;
    }
    var json = exports.readPackageInfo(pathToPackage + '/package.json');
    for (var key in json) {
        appLauncher[key] = json[key];
    }
    return appLauncher;
};

/**
 * Create file package.json.
 *
 * @param {Object} appLauncher
 **/
exports.createPackageInfo = function createPackageInfo(appLauncher) {
    var json = exports.readPackageInfo(appLauncher.bootstrapPath + '/app/package.json');
    var targetFile = appLauncher.projectPath + '/package.json';
    json.name = appLauncher.name;
    if (appLauncher.description !== "") {
        json.description = appLauncher.description;
    }
    if (appLauncher.author !== "") {
        json.author = appLauncher.author;
    }
    if (appLauncher.version !== "") {
        json.version = appLauncher.version;
    }
    if (appLauncher.license !== "") {
        json.license = appLauncher.license;
    }

    for (var key in appLauncher) {
        if (/^uploader$|^mailer$|^engine$|^css$|^js$|^theme$|^socket$|^auth$|^session$/i.test(key)) {
            json[key] = appLauncher[key];
        }
    }

    switch (appLauncher.engine) {
        case "jade":
            json.dependencies["jade"] = ">=0.35.0";
            break;
        case "jshtml":
            json.dependencies["jshtml-express"] = ">=0.0.1";
            break;
        case "hogan":
            json.dependencies["hogan"] = ">=3.0.0";
            break;
        case "haml":
            json.dependencies["hamljs"] = ">=0.6.1";
            break;
        default:
            json.dependencies["ejs"] = ">=2.0.0";
            json.dependencies["ejs-locals"] = ">=1.0.2";
            break;
    }

    switch (appLauncher.css) {
        case "less":
            json.dependencies["less"] = ">=1.5.0";
            break;
        case "sass":
            json.dependencies["node-sass"] = ">=0.6.6";
            break;
        case "stylus":
            json.dependencies["stylus"] = ">=0.38.0";
            break;
    }

    if (appLauncher.js === 'coffee') {
        json.dependencies["coffee-script"] = ">=1.6.3";
    }

    if (appLauncher.auth === true) {
        json.dependencies["passport"] = ">=0.2.0";
        json.dependencies["passport-local"] = ">=1.0.0";
        json.dependencies["trinte-auth"] = ">=0.0.x";
    }

    if (appLauncher.uploader === true) {
        json.dependencies["express-uploader"] = ">=0.0.3";
        json.dependencies["gm"] = ">=1.16.0";
        json.dependencies["node-uuid"] = ">=1.4.1";
    }

    if (appLauncher.socket === true) {
        json.dependencies["socket.io"] = ">=1.0.0";
    }

    if (appLauncher.mailer === true) {
        json.dependencies["nodemailer"] = ">=0.6.5";
    }

    if (appLauncher.recaptcha === true) {
        json.dependencies["recaptcha"] = ">=1.2.0";
    }

    if (appLauncher.session === true) {
        json.dependencies["connect-caminte"] = "*";
    }
    if (appLauncher.dbdriver !== 'memory') {
        json.dependencies[appLauncher.dbdriver] = "*";
    }
    if (appLauncher.deps && appLauncher.deps.length) {
        appLauncher.deps.forEach(function (dep) {
            json.dependencies[dep] = "*";
        });
    }

    util.writeJSON(targetFile, json);
};

/**
 * Copy license file.
 *
 * @param {Object} appLauncher
 **/
exports.copyLicense = function copyLicense(appLauncher) {
    var license = (appLauncher.license || 'MIT').toUpperCase(), licenseSource;
    var relPath = path.relative(".", appLauncher.projectPath + '/LICENSE').replace(/\\/gi, "/");
    try {
        if (fs.existsSync(appLauncher.bootstrapPath + '/app/LICENSES/' + license)) {
            licenseSource = appLauncher.bootstrapPath + '/app/LICENSES/' + license;
        }
    } catch (err) {
        licenseSource = appLauncher.bootstrapPath + '/LICENSES/MIT';
    }
    var LText = fs.readFileSync(licenseSource, "utf8");
    LText = LText.replace("{YEAR}", new Date().getFullYear())
        .replace("{AUTHOR}", appLauncher.author);
    if (fs.existsSync(appLauncher.projectPath + '/LICENSE')) {
        logger.data('#   exists ./' + relPath);
    } else {
        logger.status('#   create ./' + relPath);
    }
    fs.writeFileSync(appLauncher.projectPath + '/LICENSE', LText, "utf8");
};

/**
 * Convert .js file to .coffee.
 *
 * @param {String|Array} from
 * @param {String} to
 * @param {Boolean} dropjs
 **/
exports.jsToCoffee = function jsToCoffee(from, to, dropjs) {
    var basename = path.basename(from, ".js");
    var target = to + '/' + basename + '.coffee';
    var relPath = path.relative(".", target).replace(/\\/gi, "/");
    try {
        if (!fs.existsSync(target)) {
            logger.status('#   create ./' + relPath);
        }
    } catch (err) {
        logger.data('#   exists ./' + relPath);
    }
    try {
        exec('js2coffee ' + from + ' > ' + target, function (error, stdout, stderr) {
            if (error) {
                logger.error('error write file ./' + relPath);
            }
            if (dropjs) {
                fs.unlink(from);
            }
        });
    } catch (err) {

    }
};

/**
 * Copy .js files to .coffee files.
 *
 * @param {String|Array} from
 * @param {String} to
 **/
exports.copyJsToCoffee = function copyJsToCoffee(from, to) {
    var files = fs.readdirSync(from);
    files.forEach(function (file) {
        exports.jsToCoffee(from + '/' + file, to);
    });
};

/**
 * Read and render template file.
 *
 * @param {String} source
 * @param {Object} data
 **/
exports.readAndRenderEjs = function readAndRenderEjs(source, data, version) {
    var str = fs.readFileSync(source, 'utf8');
    // Render the model
    var ret = parser.render(str, {
        name: data.modelName || "",
        pack: data.name,
        description: data.description,
        version: version,
        author: data.author,
        created: new Date().toISOString(),
        fields: (data.fields || []).join(",\n"),
        open: "<?",
        close: "?>"
    });
    return ret;
};

/**
 * Copy .js files to .coffee files.
 *
 * @param {String} source
 * @param {String} target
 * @param {Object} data
 **/
exports.writeModelFile = function writeModelFile(source, target, data) {
    var relPath = path.relative(".", target).replace(/\\/gi, "/");
    // Render the model
    var ret = exports.readAndRenderEjs(source, data);

    if (fs.existsSync(target)) {
        logger.data('#   exists ./' + relPath);
        try {
            fs.truncateSync(target);
        } catch (err) {

        }
    } else {
        logger.status('create ./' + relPath);
    }

    if (new RegExp('.coffee$').test(target)) {
        var tmp = target.replace(/coffee$/, "js");
        fs.writeFile(tmp, ret, 'utf8', function (error) {
            if (error) {
                logger.error('error write file ./' + relPath);
            }
            exec('js2coffee ' + tmp + ' > ' + target, function (error, stdout, stderr) {
                if (error) {
                    logger.error('error write file ./' + relPath);
                }
                fs.unlinkSync(tmp);
            });
        });
    } else {
        fs.writeFileSync(target, ret, 'utf8');
    }
};

exports.modifyAuthMiddleware = function modifyAuthMiddleware(appLauncher) {
    var midFile = appLauncher.projectPath + '/config/middleware.' + appLauncher.js;
    if (fs.existsSync(midFile)) {
        var data = fs.readFileSync(midFile, 'utf8');
        // var Auth = require('./authorization/local');
        // module.exports
        // app.configure(function() {
        //        app.use(Auth.initialize());
        var strs = data.toString().split('\n');
        var i = 0;
        console.log(midFile, data);
        strs.forEach(function (str) {
            console.log(i, str);
            i++;
        });
    }
};

exports.logger = logger;
exports.util = util;