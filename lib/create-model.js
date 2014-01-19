var ejs = require('ejs'),
        fs = require('fs'),
        path = require('path'),
        wrench = require('wrench'),
        util = require('./util'),
        logger = require('./logger'),
        inflection = require('./inflection');

/**
 * Script to create a default model
 *
 * @param {Array} params
 * @param {String} appPath
 * @param {Object} options
 * @param {Object} appLauncher
 */
exports.execute = function(params, appPath, options, callback) {

    var scrPath = appPath + '/app';
    var modPath = scrPath + '/models';

    if (!options.model) {
        util.question('You must specifiy a model name.', function(nameOfModel) {
            if (nameOfModel && nameOfModel.replace(/\s+/, "") !== "") {
                options.model = nameOfModel.replace(/\s+/, "").singularize().capitalize();
            } else {
                util.exit('Process Aborting!');
            }
        });
    }

    /**
     * Create the model based on a singular (e.g. people becomes person, users becomes user)
     */
    var modelName = options.model.singularize();
    if (modelName !== options.model) {
        logger.data("Creating model using singular not plural: " + modelName);
    }

    // Capitalise
    modelName = modelName.capitalize();
    var relPath = path.normalize('./app/models/' + modelName + '.js');
    // Define the files
    var modelFile = modPath + "/" + modelName + '.js';
    var modelTemplate = __dirname + '/../scripts/models/Model.ejs';

    if (!fs.existsSync(modPath)) {
        wrench.mkdirSyncRecursive(modPath, 755);
    }

    // Check if it already exists
    var fileCheck = fs.existsSync(modelFile);
    if (fileCheck) {
        if (params[0] !== "force") {
            logger.notice("The model already exists!");
            logger.notice("-- Add an additional paramater of 'force' to over write the model automaticaly.");
            logger.notice("-- e.g. g model " + modelName + " force [fields}*");
            util.confirm('This will over-write the existing model, continue (y/n)?', function(ok) {
                if (ok) {
                    createModel(params, appPath, modelTemplate);
                    logger.status('#   overwrite ./' + relPath);
                    logger.verbose("Model created!");
                    return callback && callback();
                } else {
                    logger.data('#   exists ./' + relPath);
                    logger.verbose("Skipped!");
                    return callback && callback();
                }
            });
        } else {
            createModel(params, appPath, modelTemplate);
            logger.status('#   overwrite ./' + relPath);
            logger.verbose("Model created!");
            return callback && callback();
        }
    } else {
        createModel(params, appPath, modelTemplate);
        logger.status('#   create ./' + relPath);        
        logger.verbose("Model created!");
        return callback && callback();
    }

    function createModel(params, appPath, modelTemplate) {
        // Read the template
        var str = fs.readFileSync(modelTemplate, 'utf8');
        var fields = [];
        var field = "	         FIELDNAME : { type: FIELDTYPE }";
        // params.slice(1);
        params.forEach(function(param) {
            var wf = param.split(':');
            if (wf[0] !== 'force') {
                var cf = field.replace(/FIELDNAME/gi, wf[0]);
                var ct = typeof wf[1] !== undefined ? wf[1] : "String";

                switch (true) {
                    case new RegExp('Number', 'gi').test(ct):
                    case new RegExp('Int', 'gi').test(ct):
                    case new RegExp('Integer', 'gi').test(ct):
                    case new RegExp('Real', 'gi').test(ct):
                    case new RegExp('Double', 'gi').test(ct):
                        ct = "Number";
                        break;
                    case new RegExp('Array', 'gi').test(ct):
                    case new RegExp('Arr', 'gi').test(ct):
                        ct = "Number";
                        break;
                    case new RegExp('Boolean', 'gi').test(ct):
                    case new RegExp('Bool', 'gi').test(ct):
                        ct = "Boolean";
                        break;
                    case new RegExp('String', 'gi').test(ct):
                    case new RegExp('Text', 'gi').test(ct):
                        ct = "String";
                        break;
                    case new RegExp('Date', 'gi').test(ct):
                        ct = "Date";
                        break;
                    case new RegExp('Mixed', 'gi').test(ct):
                        ct = "Mixed";
                        break;
                    case new RegExp('Buffer', 'gi').test(ct):
                    case new RegExp('Buf', 'gi').test(ct):
                        ct = "Buffer";
                        break;
                    case new RegExp('ObjectId', 'gi').test(ct):
                        ct = "ObjectId";
                        break;
                    default:
                        ct = "String";
                }

                cf = cf.replace(/FIELDTYPE/gi, ct);
                fields.push(cf);
            }
        });
        if (!fields.length) {
            fields.push("	         name:{ type: String }");
        }
        var projectdata = {
            name: "",
            description: "",
            version: "",
            author: ""
        };
        if (fs.existsSync(appPath + '/package.json')) {
            var pd = fs.readFileSync(appPath + '/package.json', "utf-8");
            try {
                projectdata = JSON.parse(pd);
            } catch (err) {
            }
        }
        // Render the model
        var ret = ejs.render(str, {
            locals: {
                name: modelName,
                pack: projectdata.name,
                description: projectdata.description,
                version: projectdata.version,
                author: projectdata.author,
                created: new Date().toISOString(),
                fields: fields.join(",\n")
            },
            open: "<?",
            close: "?>"
        });
        // Write the file
        fs.writeFileSync(modelFile, ret, 'utf8');
    }
};