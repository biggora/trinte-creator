/**
 *  TEST Environment settings
 *
 *  Created by trinte-creator script
 *  App based on TrinteJS MVC framework
 *  TrinteJS homepage http://www.trintejs.com
 *
 *  @param {TrinteJS} app
 *  @param {ExpressJS} express
 **/
var errorHandler = require('errorhandler');

module.exports = function (app) {
    app.set('trust proxy', true);
    app.set('json spaces', 0);
    app.set('view cache', true);
    app.set('jsonp callback name', 'callback');
    app.use(errorHandler({
        dumpExceptions: false,
        showStack: false
    }));
};
