/**
 *  Order tests
 *
 *  Created by create caminte-cli script
 *  App based on CaminteJS
 *  CaminteJS homepage http://www.camintejs.com
 **/

var fs = require('fs');
var onlyJs = function(file) {
   return /\.js$/.test(file);
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