var ejs = require('ejs');
var fs = require('fs');
var wrench = require('wrench');
var path = require('path');
var inflection = require('../lib/inflection');

/**
 * Script to create a default view, requires the model to exist
 *
 * @param {Array} params
 * @param {String} appPath
 * @param {Object} options
 */
exports.execute = function (params, appPath, options) {

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
    var templater = require('trinte-' + projectdata.engine);
    var readFile = fs.readFileSync;
    var scrPath = appPath + '/app';
    var cvwPath = scrPath + '/views';
    var nvwPath = scrPath + '/views';
    var fileCheck;

    if (!options.model || options.model === "") {
        console.log("You must specifiy a model name to generate the views against!");
        return;
    }

    var modelName = options.model.singularize();
    var namespace = options.namespace ? '/' + options.namespace : null;

    if (namespace) {
        nvwPath += namespace;

        if (!fs.existsSync(nvwPath)) {
            wrench.mkdirSyncRecursive(nvwPath);
        }
        if (!fs.existsSync(nvwPath + '/_layout.' + projectdata.engine)) {
            var coreView = templater.getTemplatesDir() + '/';
            var vloc = {
                title: '',
                pack: projectdata.name,
                description: projectdata.description,
                version: projectdata.version,
                author: projectdata.author,
                open: "<?",
                close: "?>"
            };
            coreView += /admin|backend/i.test(namespace) ? 'backend' : 'frontend';

            fs.writeFileSync(nvwPath + '/_layout.' + projectdata.engine, ejs.render(readFile(coreView + '/_layout.' + projectdata.engine, 'utf8'), vloc, {delimiter: '?'}), 'utf8');
            fs.writeFileSync(nvwPath + '/login.' + projectdata.engine, ejs.render(readFile(coreView + '/login.' + projectdata.engine, 'utf8'), vloc, {delimiter: '?'}), 'utf8');
            fs.writeFileSync(nvwPath + '/_messages.' + projectdata.engine, ejs.render(readFile(coreView + '/_messages.' + projectdata.engine, 'utf8'), vloc, {delimiter: '?'}), 'utf8');
            fs.writeFileSync(nvwPath + '/_footer.' + projectdata.engine, ejs.render(readFile(coreView + '/_footer.' + projectdata.engine, 'utf8'), vloc, {delimiter: '?'}), 'utf8');
            fs.writeFileSync(nvwPath + '/_header.' + projectdata.engine, ejs.render(readFile(coreView + '/_header.' + projectdata.engine, 'utf8'), vloc, {delimiter: '?'}), 'utf8');
            wrench.copyDirSyncRecursive(templater.getTemplatesDir() + '/errors', nvwPath + '/errors');
            fs.writeFileSync(nvwPath + '/_layout.' + projectdata.engine, ejs.render(readFile(nvwPath + '/_layout.' + projectdata.engine, 'utf8'), vloc, {delimiter: '?'}), 'utf8');
            try {
                wrench.rmdirSyncRecursive(nvwPath + '/app');
            } catch (err) {

            }
        }
    }

    /**
     * Create the model based on a singular (e.g. people becomes person, users becomes user)
     */

    if (modelName !== options.model) {
        console.log("Using model name as singular not plural: " + modelName);
    }

    // Capitalize
    modelName = modelName.capitalize();
    var modelFile = scrPath + "/models/" + modelName + '.js';
    var controllerName = modelName.pluralize();
    var viewFolder = nvwPath + "/" + controllerName.toLowerCase();
    var side = /admin|backend/i.test(namespace) ? 'backend' : 'frontend';
    var viewIndexTemplate = templater.getTemplate('index', side);
    var viewEditTemplate = templater.getTemplate('edit', side);
    var viewShowTemplate = templater.getTemplate('show', side);
    var viewFormTemplate = templater.getTemplate('form', side);
    var viewNewTemplate = templater.getTemplate('new', side);

    // Check if the model exists
    fileCheck = fs.existsSync(modelFile);
    if (!fileCheck) {
        console.log("The views generator report!");
        console.log("The model you have specified doesn't exist!");
        console.log("You need to create the model first.");
        console.log("e.g. -g model " + modelName);
        return;
    }

    // Check if the view exists
    fileCheck = fs.existsSync(viewFolder);
    if (fileCheck) {
        if (params[0] !== "force") {
            console.log("The views folder already exists for this model!");
            console.log("Add an additional paramater of 'force' to over write the views.");
            console.log("e.g. -g view " + modelName + " force");
            return;
        }
    } else {
        wrench.mkdirSyncRecursive(viewFolder, 755);
    }

    // Read the template
    var tmpIndex = readFile(viewIndexTemplate, 'utf8');
    var tmpForm = readFile(viewFormTemplate, 'utf8');
    var tmpEdit = readFile(viewEditTemplate, 'utf8');
    var tmpShow = readFile(viewShowTemplate, 'utf8');
    var tmpNew = readFile(viewNewTemplate, 'utf8');

    var fields = [];
    params.forEach(function (param) {
        var wf = param.split(':');
        if (wf[0] !== 'force' && wf[0] !== modelName) {
            fields.push({
                param_name: wf[0].capitalize(),
                param_val: wf[0],
                param_type: (wf[1] || 'string').toString().toLowerCase()
            });
        }
    });

    if (!fields.length) {
        fields.push({
            param_name: "Name",
            param_val: "name",
            param_type: "string"
        });
    }

    var locals = {
        fields: fields,
        modelName: modelName,
        controllerName: controllerName,
        namespace: options.namespace
    };

    // Render the views
    var retIndex = ejs.render(tmpIndex, locals, {delimiter: '?'});
    var retEdit = ejs.render(tmpEdit, locals, {delimiter: '?'});
    var retNew = ejs.render(tmpNew, locals, {delimiter: '?'});
    var retShow = ejs.render(tmpShow, locals, {delimiter: '?'});
    var retForm = ejs.render(tmpForm, locals, {delimiter: '?'});

    // Write the file
    fs.writeFileSync(viewFolder + "/index.ejs", retIndex, 'utf8');
    fs.writeFileSync(viewFolder + "/edit.ejs", retEdit, 'utf8');
    fs.writeFileSync(viewFolder + "/show.ejs", retShow, 'utf8');
    fs.writeFileSync(viewFolder + "/form.ejs", retForm, 'utf8');
    fs.writeFileSync(viewFolder + "/new.ejs", retNew, 'utf8');

    if (options.anyside && options.namespace) {

        // view filenames
        var AnyviewIndexTemplate = __dirname + '/templates/create-view.template.client.index.ejs';
        var AnyviewShowTemplate = __dirname + '/templates/create-view.template.client.show.ejs';

        // Read the template
        var AnytmpIndex = readFile(AnyviewIndexTemplate, 'utf8');
        var AnytmpShow = readFile(AnyviewShowTemplate, 'utf8');

        // Render the views
        var AnyretIndex = ejs.render(AnytmpIndex, locals, {delimiter: '?'});
        var AnyretShow = ejs.render(AnytmpShow, locals, {delimiter: '?'});

        // Write the file
        fs.writeFileSync(cvwPath + "/" + controllerName.toLowerCase() + "/index.ejs", AnyretIndex, 'utf8');
        fs.writeFileSync(cvwPath + "/" + controllerName.toLowerCase() + "/show.ejs", AnyretShow, 'utf8');

        console.log('Views ' + modelName + ' created in app/views/' + modelName.toLowerCase());
    }
    if (!namespace) {
        namespace = "";
    }
    console.log('Views ' + modelName + ' created in app/views' + namespace + '/' + modelName.toLowerCase());

};