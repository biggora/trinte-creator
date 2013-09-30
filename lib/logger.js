/**
 * TrinteJS MVC Bootstrap
 * 
 * @project  trinte
 * @author   Alexey Gordeyev
 * @created  2013-09-27 07:25:26
 * @Params - cmd - server | script | params
 * 
 */

var util = require('util');
var colors = require('colors');

var methods = [];
var customColors = {
    notice: 'white',
    input: 'grey',
    verbose: 'cyan',
    alert: 'inverse',
    critical: 'red',
    info: 'blue',
    status: 'blue',
    msg: 'green',
    data: 'grey',
    help: 'cyan',
    warning: 'yellow',
    debug: 'grey',
    error: 'red'
};

colors.setTheme(customColors);

for (var key in customColors) {
    methods.push(key);
}

var logger = {
    options: {},
    log: function log(type, message) {
        if (typeof logger[type] !== 'undefined') {
            logger[type](message);
        } else if (typeof console[type] !== 'undefined') {
            console[type](message);
        } else {
            console.log(type, message);
        }
    }
};

methods.forEach(function(method) {
    logger[method] = function(message, title) {
        if(title) {
            message = method.toUpperCase() + ": " + message;
        }
        if (/critical|status|warn/.test(method)) {
            console.log(message['bold'][method].toString());
        } else {
            console.log(message[method].toString());
        }
    };
});

module.exports = logger;