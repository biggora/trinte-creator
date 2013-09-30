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

var fs = require('fs')
        , wrench = require('wrench')
        , path = require('path')
        , util = require('./util')
        , logger = require('./logger')
        , parser = require('ejs')
        , themer = require('trinte-themes')
        , exec = require('child_process').exec;

/**
 * Library version.
 **/
exports.version = '0.0.1';

/**
 * Create Application scripts.
 * 
 * @param {Object} appLauncher
 **/
exports.createApp = function createApp(appLauncher) {
    util.emptyDirectory(appLauncher.projectPath + '/' + appLauncher.app, function(empty) {
        if (empty) {
            exports.buildApp(appLauncher);
        } else {
            util.confirm('This will over-write the existing application, continue (y/n)?', function(ok) {
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
    util.question('Enter Project author name (' + appLauncher.author + ')>', function(author) {
        if (author) {
            appLauncher.author = author;
        }
        util.question('Enter Project description (' + appLauncher.description + ')>', function(description) {
            if (description) {
                appLauncher.description = description;
            }
            util.question('Enter Project version (' + appLauncher.version + ')>', function(version) {
                if (version) {
                    appLauncher.version = version;
                }
                util.question('Enter Project license (' + appLauncher.license + ')>', function(license) {
                    if (license) {
                        appLauncher.license = license;
                    }
                    process.chdir(appLauncher.projectPath);
                    exports.buildAppStructure(appLauncher);
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
exports.createScript = function createApp(appLauncher) {
    var self = this;
    if (util.isBootstrap(util.projectPath)) {
        self.logger.info("Create!")
        console.log(appLauncher)
    } else {
        util.abort("Invalid TrinteJS project!");
    }
};

/**
 * Create Application Structure.
 * 
 * @param {Object} appLauncher
 **/
exports.buildAppStructure = function buildAppStructure(appLauncher) {
    var rootPath = appLauncher.projectPath + '/' + appLauncher.app;
    var scriptsPath = __dirname + '/../scripts';
    var relPath = path.relative(".", rootPath).replace(/\\/gi, "/");
    var tplEngine = 'trinte-ejs', viewEngine;

    exports.createDir(rootPath, true);

    try {
        process.chdir(rootPath);
        logger.msg('chdir  ./' + relPath);
    } catch (err) {
        util.abort('Directory ' + rootPath + ' not created!');
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
        tplEngine = 'trinte-' + (appLauncher.engine || "ejs").toLocaleString();
        viewEngine = require(tplEngine);
    } catch (err) {
        console.log(err)
    }

    exports.createDir(rootPath + '/app/controllers');
    exports.writeModelFile(scriptsPath + '/controllers/AppsController.ejs', rootPath + '/app/controllers/AppsController.' + appLauncher.js, appLauncher);

    exports.createDir(rootPath + '/app/models');
    if (appLauncher.session === true) {
        exports.writeModelFile(appLauncher.bootstrapPath + '/app/snippets/session.ejs', appLauncher.projectPath + '/config/session.' + appLauncher.js, appLauncher);
        exports.writeModelFile(scriptsPath + '/models/Session.ejs', rootPath + '/app/models/Session.' + appLauncher.js, appLauncher);
    } else {
        exports.writeModelFile(appLauncher.bootstrapPath + '/app/snippets/nosession.ejs', appLauncher.projectPath + '/config/session.' + appLauncher.js, appLauncher);
    }

    exports.createDir(rootPath + '/app/views');
    exports.copyFiles(viewEngine.getTemplatesDir() + '/main', rootPath + '/app/views', new RegExp('.' + viewEngine.extension + "$"));

    var pubDir = themer.getPiblicDir();
    var themeDir = themer.getCurThemeDir(appLauncher.theme);
    exports.createDir(rootPath + '/public');
    exports.copyFiles(pubDir, rootPath + '/public');
    exports.createDir(rootPath + '/public/' + appLauncher.css);
    exports.copyFiles(themeDir + '/' + appLauncher.css, rootPath + '/public/' + appLauncher.css, new RegExp('.' + appLauncher.css + "$"));

    // var layout = viewEngine.getTemplate('layout');
    // console.log(layout);

    [
        'logs',
        'uploads'
    ].forEach(function(dir) {
        exports.createDir(rootPath + '/' + dir);
    });
    exports.createPackageInfo(appLauncher);
    exports.copyLicense(appLauncher);
    logger.msg('create ./' + relPath + '/package.json');
};

/**
 * Create Directory.
 * 
 * @param {String} dir
 **/
exports.createDir = function createDir(dir) {
    var relPath = path.relative(".", dir).replace(/\\/gi, "/");
    if (fs.existsSync(dir)) {
        logger.data('exists ./' + relPath);
    } else {
        wrench.mkdirSyncRecursive(dir, 0755);
        logger.status('create ./' + relPath);
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
        logger.status('create ./' + relPath);
    }

    from.forEach(function(file) {
        filter = typeof filter === 'undefined' ? new RegExp(".*") : filter;
        var cto = to + util.delimiter() + path.basename(file);
        var stats = fs.statSync(file);
        relPath = path.relative(".", cto).replace(/\\/gi, "/");

        if (stats.isFile()) {
            if (filter.test(file)) {
                if (fs.existsSync(cto)) {
                    logger.data('exists ./' + relPath);
                    fs.unlinkSync(cto);
                } else {
                    logger.status('create ./' + relPath);
                }
                fs.createReadStream(file).pipe(fs.createWriteStream(cto));
            }
        } else if (stats.isDirectory()) {
            if (!fs.existsSync(file)) {
                wrench.mkdirSyncRecursive(file, 0755);
                logger.status('create ./' + relPath);
            }
            var files = fs.readdirSync(file);
            files.forEach(function(mfile) {
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
        util.abort('Invalid file package.json!');
    }
    return json;
};

/**
 * Read file package.json.
 * 
 * @param {Object} appLauncher
 **/
exports.loadPackageInfo = function readPackageInfo(appLauncher) {
    var pathToPackage = new RegExp(appLauncher.app).test(appLauncher.projectPath) ? appLauncher.projectPath : appLauncher.projectPath + '/' + appLauncher.app;
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
    json.name = appLauncher.app;
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

    switch (appLauncher.engine) {
        case "ejs":
            json.dependencies["ejs-locals"] = ">=1.0.2";
            break;
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
    }
    json.dependencies["trinte-" + appLauncher.engine] = ">=0.0.1";

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
        json.dependencies["everyauth"] = ">=0.4.5";
    }

    if (appLauncher.socket === true) {
        json.dependencies["socket.io"] = ">=1.0.0";
    }

    if (appLauncher.session === true) {
        json.dependencies["trinte-session"] = ">=0.0.1";
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
    fs.writeFileSync(appLauncher.projectPath + '/LICENSE', LText, "utf8");
    logger.msg('create ./' + relPath);
};

/**
 * Convert .js file to .coffee.
 * 
 * @param {String|Array} from
 * @param {String} to
 **/
exports.jsToCoffee = function jsToCoffee(from, to) {
    var basename = path.basename(from, ".js");
    var target = to + '/' + basename + '.coffee';
    var relPath = path.relative(".", target).replace(/\\/gi, "/");
    try {
        if (!fs.existsSync(target)) {
            logger.status('create ./' + relPath);
        }
    } catch (err) {
        logger.data('exists ./' + relPath);
    }
    try {
        exec('js2coffee ' + from + ' > ' + target, function(error, stdout, stderr) {
            if (error) {
                logger.error('error write file ./' + relPath);
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
    files.forEach(function(file) {
        exports.jsToCoffee(from + '/' + file, to);
    });
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
    var str = fs.readFileSync(source, 'utf8');
    // Render the model
    var ret = parser.render(str, {
        locals: {
            name: data.modelName || "",
            pack: data.app,
            description: data.description,
            version: data.version,
            author: data.author,
            created: new Date().toISOString(),
            fields: (data.fields || []).join(",\n")
        },
        open: "<?",
        close: "?>"
    });
    if (fs.existsSync(target)) {
        logger.data('exists ./' + relPath);
        try {
            fs.truncateSync(target);
        } catch (err) {

        }
    } else {
        logger.status('create ./' + relPath);
    }

    if (new RegExp('.coffee$').test(target)) {
        var tmp = target.replace(/coffee$/, "js");
        fs.writeFile(tmp, ret, 'utf8', function(error) {
            if (error) {
                logger.error('error write file ./' + relPath);
            }
            exec('js2coffee ' + tmp + ' > ' + target, function(error, stdout, stderr) {
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

exports.logger = logger;
exports.util = util;
//js2coffee C:/Projects/JS_Projects/tester/TrinteGS/app/controllers/AppsController.coffee-tmp > C:/Projects/JS_Projects/tester/TrinteGS/app/controllers/AppsController.coffee