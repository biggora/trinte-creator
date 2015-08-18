/**
 *  Application Tools
 *
 *  Created by init script
 *  App based on TrinteJS MVC framework
 *  TrinteJS homepage http://www.trintejs.com
 **/

module.exports = {
    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    uid: function (len) {
        var buf = []
            , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            , charlen = chars.length;

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
        return  pass && pass !== '' ? nPass : '';
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
                break;
            case 'double':
            case 'float':
                nVal = parseFloat(val);
                return typeof nVal !== number ? null : nVal;
                break;
            case 'date':
                nVal = Date.parse(val) > 0 ? new Date().setTime(Date.parse(val)) : {};
                nVal = (typeof nVal !== 'number' && parseInt(val) > 0) ? new Date().setTime(parseInt(val)) : nVal;
                return nVal.getTime || !isNaN(parseInt(nVal)) ? nVal : null;
                break;
            default:
                return val;
        }
    },
    validateFields: function (ins, query, options, callback) {
        var filtered = {}, err, model, self = this, errors = [];
        model = new ins();
        model = typeof model === 'object' && model.toJSON ? model.toJSON() : model;
        query = typeof query === 'object' ? query : {};
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        options = typeof options === 'object' ? options : {};
        for (var prop in query) {
            if (Object.prototype.hasOwnProperty.call(model, prop)) {
                var sVal;
                if (Object.prototype.toString.call(query[prop]) === '[object Array]') {
                    sVal = query[prop].map(function(kVal){
                        return self.forDB(kVal, ins.whatTypeName(prop));
                    });
                } else {
                    sVal = self.forDB(query[prop], ins.whatTypeName(prop));
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
            var newModel = new ins(filtered);
            newModel.isValid(function (valid) {
                if (!valid) {
                    Object.keys(newModel.errors).forEach(function (key) {
                        errors.push(' `' + key + '` ' + newModel.errors[key].join(', '));
                    });
                }
                callback && callback(errors, filtered);
            });
        } else {
            callback && callback(errors, filtered);
        }
    },
    queryToDb: function (ins, query) {
        var self = this;
        var dbQuery = {};
        var model = new ins();
        model = typeof model === 'object' && model.toJSON ? model.toJSON() : model;
        query = typeof query === 'object' ? query : {};
        for (var prop in query) {
            var sType = ins.whatTypeName(prop) || 'String';
            if (typeof query[prop] === 'object') {
                if (Object.prototype.toString.call(query[prop]) === '[object Array]') {
                    dbQuery[prop] = {
                        'inq': query[prop].map(function (val) {
                            return self.forDB(val, sType);
                        })
                    }
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
        return dbQuery
    }
};