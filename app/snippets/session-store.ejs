/**
 *  Default session configuration
 *  Inject app and express reference
 *
 *  Created by trinte-creator script
 *  App based on TrinteJS MVC framework
 *  TrinteJS homepage http://www.trintejs.com
 **/
var config = require('./configuration');
var expressSession = require('express-session');
var caminteStore = require('connect-caminte');
var database = require('./database' )[process.env.NODE_ENV || 'dev'];

/**
 * Define SessionStore
 * @param {Object} app
 * @param {Object} express
 **/
module.exports = function (app) {
    var SessionStore = caminteStore(expressSession);
    app.use(expressSession({
         cookie: {
             maxAge: config.session.maxAge
         },
         key: config.session.key,
         secret: config.session.secret,
         saveUninitialized: true,
         resave: true,
         store: new SessionStore({
             driver: database.driver,
             collection: 'session',
             db: database,
             secret: config.session.secret,
             maxAge: config.session.maxAge,
             clear_interval: config.session.clear_interval
         })
     }));
};