/**
 *  Order tests
 *
 *  Created by create caminte-cli script
 *  App based on CaminteJS
 *  CaminteJS homepage http://www.camintejs.com
 **/

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
}

var fs = require('fs');
var onlyJs = function(file) {
   return /\.js$/.test(file);
};

global.getCSRF = function getCSRF(server, done) {
    var csrf = '', found;
    server
        .get('/')
        .expect(200)
        .end(function (err, res) {
            if (err) { return done(err); }
            if(found = /\"x\-csrf\-token\"\s+content=\"([a-zA-Z0-9-=_]+)\"/i.exec(res.text)) {
                csrf = RegExp.$1;
                return done(csrf);
            } else {
                return done(new Error('CSRF Not found'));
            }
        });
};

/* units tests */
var units = fs.readdirSync(__dirname+'/units').filter(onlyJs);

units.forEach(function(unit){
    require('./units/' + unit);
});

/* models tests */
var models = fs.readdirSync(__dirname+'/models').filter(onlyJs);

models.forEach(function(model){
    require('./models/' + model);
});

/* routes tests */
var routes = fs.readdirSync(__dirname+'/controllers').filter(onlyJs);

routes.forEach(function(route){
    require('./controllers/' + route);
});