/**
 *  PRODUCTION Environment settings
 *
 *  Created by trinte-creator script
 *  App based on TrinteJS MVC framework
 *  TrinteJS homepage http://www.trintejs.com
 *
 *  @param {TrinteJS} app
 *  @param {ExpressJS} express
 **/
var morgan = require('morgan');
var errorHandler = require('errorhandler');
var compress = require('compression');

module.exports = function (app) {
    app.set('trust proxy', true);
    app.set('json spaces', 0);
    app.set('view cache', true);
    app.use(morgan('combined'));
    app.set('jsonp callback name', 'callback');
    app.use(compress());
    app.use(errorHandler({
        dumpExceptions: true,
        showStack: false
    }));
};
