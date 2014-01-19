/**
 * Script to create a model, controller and views
 *
 * @param {Array} params
 * @param {String} appPath
 * @param {Object} options
 */
exports.execute = function(params, appPath, options) {

    if (!options.model) {
        console.log("You must specifiy a model name to generate all of the assets for!");
        return;
    }

    var modelScript = require('./create-model');
    var controllerScript = require('./create-rest-controller');

    modelScript.execute(params, appPath, options, function(){
        controllerScript.execute(params, appPath, options);
    });    
    // testScript.execute(params, appPath, options);
}
;