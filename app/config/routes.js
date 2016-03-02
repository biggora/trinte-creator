/**
 *  Routes manager
 *  Inject resource mapper reference
 *
 *  Created by trinte-creator script
 *  App based on TrinteJS MVC framework
 *  TrinteJS homepage http://www.trintejs.com
 *
 *  docs: https://github.com/biggora/trinte/wiki/Routes
 **/
/* jshint unused: false */
var Auth = require('./authorization/local');
var Mail = require('./addons/mailer');
var Uploader = require('./addons/uploader');
var Cart = require('./addons/cart');
var Recaptcha = require('./addons/recaptcha');
var config = require('./configuration');

/**
 * Define routes
 * @param {Object} map
 * @param {Object} app
 **/
module.exports = function routes(map, app) {
       map.root('apps#index');
       map.get('/login','apps#login');
       map.post('/login', Auth.localAuth('/login', '/'));
       map.all('/logout', Auth.logOut( '/' ));
       map.post('/sendmail', Mail.mailSender());
       map.post('/uploading', Uploader.middleware());
       map.get('/cart', Cart.getProductFromCart());
       map.post('/cart', Cart.addProductToCart());
        /**
        * recapcha usage Recaptcha.middleware()
        **/
       app.io.on('connection', function (socket) {
          if (config.debug) console.log('a client connected');
          socket.on('disconnect', function () {
             if (config.debug) console.log('client disconnected');
          });
       });
};