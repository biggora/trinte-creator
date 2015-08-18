/**
 *  Routes manager
 *  Inject resource mapper reference
 *
 *  Created by trinte-creator script
 *  App based on TrinteJS MVC framework
 *  TrinteJS homepage http://www.trintejs.com
 **/

/**
 * Define routes
 * @param {Object} map
 */
module.exports = function routes(map, app) {
       map.root('apps#index');
       map.get('/login','apps#login');

};