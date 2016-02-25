/**
 *  <?= controllerName ?> Controller Test
 *  Created by create-test script @<?= new Date().toISOString() ?>
 **/
<?
var modelVariable = modelName.toLowerCase();
var basePath = modelName.toLowerCase();
var basePathPlural = controllerName.toLowerCase();
var nsPath = namespace && namespace !== "" ? "/" + namespace + "/" : "/";
?>

var request = require('supertest');
var assert = require('assert');
var should = require('should');
var trinte = require('../../app');
var id, app, server, csrf, <?= basePath ?>;

describe('Controller <?= controllerName ?>:', function () {

    this.timeout(5000);

    before(function (cb) {
        app = trinte.boot(3000);
        app.listen(3000, '127.0.0.1');
        server = request.agent(app);
        setTimeout(function () {
           getCSRF(server, function (csrf_val) {
                csrf = csrf_val;
                cb();
           });
        }, 500);
    });

    after(function (done) {
        done();
    });

    describe('GET /<?= basePathPlural ?> (#index)', function () {

        it('respond with html', function (done) {
            server
                .get('/<?= basePathPlural ?>')
                .set('Accept', 'text/html')
                .expect('Content-Type', /html/)
                .expect(200, done);
        });

        it('respond with json', function (done) {
            server
                .get('/<?= basePathPlural ?>.json')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('respond with xml', function (done) {
            server
                .get('/<?= basePathPlural ?>.xml')
                .expect('Content-Type', /xml/)
                .expect(200, done);
        });

    });

    describe('GET /<?= basePathPlural ?>/new (#new)', function () {

        it('respond with html', function (done) {
            server
                .get('/<?= basePathPlural ?>/new')
                .set('Accept', 'text/html')
                .expect(200)
                .expect('Content-Type', /html/)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('respond with json', function (done) {
            server
                .get('/<?= basePathPlural ?>/new.json')
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) return done(err);
                    user = res.body;
                    done();
                });
        });

        it('respond with xml', function (done) {
            server
                .get('/<?= basePathPlural ?>/new.xml')
                .set('Accept', 'text/xml')
                .expect(200)
                .expect('Content-Type', /xml/)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });

    });

    describe('POST  /<?= basePathPlural ?> (#create)', function () {

        it('respond with html', function (done) {
            server
                .post('/<?= basePathPlural ?>')
                .send({
                    user: {name: 'admin'},
                    _csrf: csrf
                })
                .set('Accept', 'text/html')
                .expect(302)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('respond with json', function (done) {
            server
                .post('/<?= basePathPlural ?>.json')
                .send({
                    user: {name: 'admin-json'},
                    _csrf: csrf
                })
                .set('Accept', 'application/json')
                .expect(201)
                .end(function (err, res) {
                    if (err) return done(err);
                    user = res.body;
                    done();
                });
        });

        it('respond with xml', function (done) {
            server
                .post('/<?= basePathPlural ?>.xml')
                .send({
                    user: {name: 'admin-xml'},
                    _csrf: csrf
                })
                .set('Accept', 'text/xml')
                .expect(201)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });
    });
    /*
     describe('#show', function () {
     request(app)
     .get('/categories')
     .set('Accept', 'application/json')
     .expect(200)
     .end(function (err, res) {
     if (err) return done(err);

     done();
     });
     });

     describe('#edit', function () {

     });

     describe('#update', function () {

     });

     describe('#destroy', function () {

     });

     describe('#destroyall', function () {

     });
     */
});