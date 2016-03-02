/**
 *  Application Tools
 *
 *  Created by init script
 *  App based on TrinteJS MVC framework
 *  TrinteJS homepage http://www.trintejs.com
 **/
var crypto = require('crypto');
var fs = require('fs');

module.exports = {
    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    uid: function (len) {
        var buf = [],
            chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            charlen = chars.length;

        for (var i = 0; i < len; ++i) {
            buf.push(chars[this.getRandomInt(0, charlen - 1)]);
        }

        return buf.join('');
    },
    createKey: function (data, prefix) {
        var hash = crypto.createHash('sha1');
        data = !data ? new Date().getTime() : data;
        prefix = prefix ? prefix.toString() : 'SCRTKEY_';
        hash.update(data.toString());
        return prefix + hash.digest('hex').toString();
    },
    createPasswordHash: function (pass, salt, algorithm) {
        algorithm = algorithm ? algorithm.toString() : 'sha1';
        salt = salt ? salt.toString() : '';
        var hash = crypto.createHash(algorithm);
        hash.update(pass.toString() + salt);
        var nPass = hash.digest('hex').toString();
        return pass && pass !== '' ? nPass : '';
    },
    normalizeDate: function (date) {
        if (typeof date === 'number') {
            return new Date(date).toISOString();
        } else if (date.getTime) {
            return date.toISOString();
        } else {
            return new Date().toISOString();
        }
    },
    getClientIp: function (req) {
        var ipAddress;
        // The request may be forwarded from local web server.
        var forwardedIpsStr = req.header('x-forwarded-for');
        if (forwardedIpsStr) {
            // 'x-forwarded-for' header may return multiple IP addresses in
            // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
            // the first one
            var forwardedIps = forwardedIpsStr.split(',');
            ipAddress = forwardedIps[0];
        }
        if (!ipAddress) {
            // If request was not forwarded
            ipAddress = req.connection.remoteAddress;
        }
        return ipAddress;
    },
    parseBool: function (str) {
        if (typeof str === 'string' && str.toLowerCase() === 'true') {
            return true;
        }
        return (parseInt(str) > 0);
    },
    forDB: function (val, type) {
        var self = this, nVal = val;
        switch (type.toString().toLowerCase()) {
            case 'boolean':
                return self.parseBool(val);
            case 'number':
                nVal = parseInt(val);
                return isNaN(nVal) ? null : nVal;
            case 'double':
            case 'float':
                nVal = parseFloat(val);
                return typeof nVal !== Number ? null : nVal;
            case 'date':
                nVal = Date.parse(val) > 0 ? new Date().setTime(Date.parse(val)) : {};
                nVal = (typeof nVal !== 'number' && parseInt(val) > 0) ? new Date().setTime(parseInt(val)) : nVal;
                return nVal.getTime || !isNaN(parseInt(nVal)) ? nVal : null;
            default:
                return val;
        }
    },
    validateFields: function (Ins, query, options, callback) {
        var filtered = {}, model, self = this, errors = [];
        model = new Ins();
        model = typeof model === 'object' && model.toJSON ? model.toJSON() : model;
        query = typeof query === 'object' ? query : {};
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        options = typeof options === 'object' ? options : {};
        var setForDB = function (prop) {
            'use strict';
            return function (kVal) {
                return self.forDB(kVal, Ins.whatTypeName(prop));
            };
        };

        for (var prop in query) {
            if (Object.prototype.hasOwnProperty.call(model, prop)) {
                var sVal;
                if (Object.prototype.toString.call(query[prop]) === '[object Array]') {
                    sVal = query[prop].map(setForDB(prop));
                } else {
                    sVal = self.forDB(query[prop], Ins.whatTypeName(prop));
                }

                if (options.ignored) {
                    if (Object.prototype.toString.call(options.ignored) === '[object Array]') {
                        if (options.ignored.join('#').toString().indexOf(prop) === -1) {
                            if (sVal === null) {
                                errors.push(' `' + prop + '` ivalid value ' + query[prop]);
                            } else {
                                filtered[prop] = sVal;
                            }
                        } else {
                            errors.push(' `' + prop + '` not allowed');
                        }
                    } else if (typeof options.ignored === 'string') {
                        if (options.ignored.toString().indexOf(prop) === -1) {
                            if (sVal === null) {
                                errors.push(' `' + prop + '` ivalid value ' + query[prop]);
                            } else {
                                filtered[prop] = sVal;
                            }
                        } else {
                            errors.push(' `' + prop + '` not allowed');
                        }
                    } else {
                        if (sVal === null) {
                            errors.push(' `' + prop + '` ivalid value ' + query[prop]);
                        } else {
                            filtered[prop] = sVal;
                        }
                    }
                } else {
                    if (sVal === null && model[prop] !== null) {
                        errors.push(' `' + prop + '` ivalid value ' + query[prop]);
                    } else {
                        filtered[prop] = sVal;
                    }
                }
            }
        }

        errors = errors.length && options.validate === true ? errors : [];
        if (options.validate === true) {
            var newModel = new Ins(filtered);
            newModel.isValid(function (valid) {
                if (!valid) {
                    Object.keys(newModel.errors).forEach(function (key) {
                        errors.push(' `' + key + '` ' + newModel.errors[key].join(', '));
                    });
                }
                return callback && callback(errors, filtered);
            });
        } else {
            return callback && callback(errors, filtered);
        }
    },
    queryToDb: function (Ins, query) {
        var self = this;
        var dbQuery = {};
        var model = new Ins();
        model = typeof model === 'object' && model.toJSON ? model.toJSON() : model;
        query = typeof query === 'object' ? query : {};
        var setForDB = function (type) {
            'use strict';
            return function (val) {
                return self.forDB(val, type);
            };
        };
        for (var prop in query) {
            var sType = Ins.whatTypeName(prop) || 'String';
            if (typeof query[prop] === 'object') {
                if (Object.prototype.toString.call(query[prop]) === '[object Array]') {
                    dbQuery[prop] = {
                        'inq': query[prop].map(setForDB(sType))
                    };
                }
            } else {
                if (Object.prototype.hasOwnProperty.call(model, prop)) {
                    var sVal = self.forDB(query[prop], sType);
                    sVal = /string|text/gi.test(sType) ? sVal.replace(/\.|,|-|;|:|&/gi, ' ') : sVal;
                    sVal = /string|text/gi.test(sType) ? sVal.replace(/\s+/gi, '|') : sVal;
                    sVal = /string|text/gi.test(sType) ? new RegExp(sVal, 'gi') : sVal;
                    dbQuery[prop] = sVal;
                }
            }
        }
        return dbQuery;
    },
    removeFiles: function (item) {
        var mainsrc = item.source_path || item.image_source;
        var thumbs = item.source_thumbs || item.image_thumbs;

        if (typeof thumbs === 'string') {
            try {
                thumbs = JSON.parse(thumbs);
            } catch (err) {
            }
        }

        if (thumbs instanceof Array) {
            thumbs.forEach(function (thumb) {
                try {
                    var stats = fs.statSync(__dirname + '/../../public' + thumb);
                    if (stats.isFile()) {
                        fs.unlinkSync(__dirname + '/../../public' + thumb);
                    }
                } catch (err) {
                }
            });
        }
        if (mainsrc && typeof mainsrc !== 'undefined' && mainsrc !== '') {
            try {
                var stats = fs.statSync(__dirname + '/../../public' + mainsrc);
                if (stats.isFile()) {
                    fs.unlinkSync(__dirname + '/../../public' + mainsrc);
                }
            } catch (err) {

            }
        }
    },
    parseJsonFields: function (item) {
        if (typeof item.image_thumbs === 'string') {
            try {
                item.image_thumbs = JSON.parse(item.image_thumbs);
            } catch (err) {

            }
        }
        return item;
    }
};