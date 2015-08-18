/**
 * Created by Alex on 5/10/2015.
 */
var express = require('express');
var session = require('express-session');
var assert = require('assert');
var flash = require('../app/bin/flash');

describe('flash middleware', function () {
    var app = express();
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }
    }));
    app.use(flash());
    describe('#flash()', function () {
        it('should be req.flash function', function (done) {
            app.use(function (req, res, next) {
                assert.ok(typeof req.flash === 'function', 'req.flash is not function');
                next();done();
            });

        });
        it('should return function', function (done) {
            app.use(function (req, res, next) {
                req.flash('info','should return function');
                console.log(req.flash());
                next();
            });
            app.use(function (req, res, next) {
                console.log(req.flash());
                next();
            });
            done();
        });
    });
});