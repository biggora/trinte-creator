/**
 * Module dependencies.
 */

exports.init = function (utils) {
    return function (req, res, next) {
        var session = (req.session || {});
        var locals = {
            controllers: [],
            session: session,
            request: req,
            headers: {
                feed: {},
                icons: '',
                openGraph: {}
            },
            isNumber: function (n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            },
            formVal: function (val) {
                return typeof val === 'undefined' ? '' : val;
            },
            sortFor: function (field, title, tooltip) {
                var direction = '-', query = req.query,
                    sort = false, uri = [], icon = '', dd, dt = '';
                for (var q in query) {
                    if (q === 'sort') {
                        sort = true;
                        direction = /^-/.test(query.sort) ? '' : '-';
                        uri.push(q + '=' + direction + field);
                        if (new RegExp(field, 'gi').test(query.sort)) {
                            icon = direction === '-' ? 'headerSortDown' : 'headerSortUp';
                        }
                    } else {
                        uri.push(q + '=' + query[q]);
                    }
                }
                if (!sort) {
                    uri.push('sort=' + direction + field);
                }
                dd = direction === '-' ? 'DESC' : 'ASC';
                dt = tooltip ? 'rel="tooltip" data-title="' + tooltip + '"' : '';
                return '<a ' + dt + ' class="sorter ' + icon + '" data-field="' + field + '" data-direction="' + dd + '" href="?' + uri.join('&') + '">' + title + '</a>';
            },
            form: {
                makeName: function (name, resource) {
                    var resourceName = false;
                    if (typeof resource === 'string') {
                        resourceName = resource;
                    } else {
                        resourceName = resource && resource.constructor && resource.constructor.modelName || false;
                    }
                    return resourceName ? (resourceName.toLowerCase() + '[' + name + ']') : name;
                },
                makeId: function (name, resource) {
                    var resourceName = false;
                    if (typeof resource === 'string') {
                        resourceName = resource;
                    } else {
                        resourceName = resource && resource.constructor && resource.constructor.modelName || false;
                    }
                    return resourceName ? (resourceName.toLowerCase() + '_' + name) : name;
                },
                inputTag: function (params, override) {
                    return '<input' + locals.htmlTagParams(params, override) + ' />';
                },
                labelTag: function (text, params, override) {
                    return locals.genericTag('label', text, params, override);
                },
                getValue: function (name, params, resource) {
                    params = params || {};
                    if (typeof params.value === 'undefined') {
                        if (typeof resource === 'undefined' || typeof resource === 'string') {
                            params.value = '';
                        } else {
                            var obj = {};
                            try {
                                obj = resource.toJSON();
                            } catch (err) {
                            }
                            params.value = typeof obj[name] !== 'undefined' ? obj[name] : '';
                        }
                    }
                    return params;
                },
                input: function (name, params, resource) {
                    params = params || {};
                    params = locals.form.getValue(name, params, resource);
                    return locals.form.inputTag({
                        name: locals.form.makeName(name, resource),
                        id: locals.form.makeId(name, resource)
                    }, params);
                },
                checkbox: function (name, params, resource) {
                    params = params || {};
                    params = locals.form.getValue(name, params, resource);
                    if (params.value !== '' && parseInt(params.value) !== 0) {
                        params.checked = 'checked';
                    }
                    return locals.form.inputTag({
                        name: locals.form.makeName(name, resource),
                        id: locals.form.makeId(name, resource),
                        value: 1,
                        type: 'checkbox'
                    }, params);
                },
                radio: function (name, params, resource, inval, prefix) {
                    params = params || {};
                    params = locals.form.getValue(name, params, resource);
                    if ((params.value || '').toString() === (inval || '').toString()) {
                        params.checked = 'checked';
                    }
                    if (!prefix) {
                        prefix = '';
                    }
                    return locals.form.inputTag({
                        name: locals.form.makeName(name, resource),
                        id: locals.form.makeId(name, resource) + prefix.toString(),
                        value: inval.toString(),
                        type: 'radio'
                    }, params);
                },
                file: function (name, params, resource) {
                    params = params || {};
                    params = locals.form.getValue(name, params, resource);
                    return locals.form.inputTag({
                        name: locals.form.makeName(name, resource),
                        id: locals.form.makeId(name, resource),
                        type: 'file'
                    }, params);
                },
                label: function (name, caption, params, resource) {
                    return locals.form.labelTag(
                        caption || name,
                        {for: locals.form.makeId(name, resource)},
                        params);
                },
                submit: function (name, params) {
                    return locals.genericTag('button', name || 'Commit', {type: 'submit'}, params);
                },
                textarea: function (name, params, resource) {
                    params = params || {};
                    params.value = params.value || '';
                    params = locals.form.getValue(name, params, resource);
                    return locals.genericTag('textarea', params.value, {
                        name: locals.form.makeName(name, resource),
                        id: locals.form.makeId(name, resource)
                    }, params);
                },
                select: function (name, list, current, params, resource) {
                    var __selectTags = '';
                    // Only do something when there is value in the f_list.
                    // Setup the opening tag for select.
                    if (list.length > 0) {
                        list.forEach(function (listEntry) {
                            var item = typeof listEntry === 'string' ? {name: listEntry, value: listEntry} : listEntry;
                            if (params.fields) {
                                if (listEntry[params.fields[0]]) {
                                    item.name = listEntry[params.fields[0]];
                                }
                                if (listEntry[params.fields[1]]) {
                                    item.value = listEntry[params.fields[1]];
                                }
                            }

                            // Setup the option tag with selected = specified.
                            __selectTags = __selectTags + '<option value = "' + item.value + '" ';
                            if ((current !== null) && (current === item.value)) {
                                __selectTags = __selectTags + 'selected = "selected"';
                            }
                            // close the bracket.
                            __selectTags = __selectTags + '> ' + item.name + ' </option>';
                        }); // End of forEach loop.
                    }  // end of if f_list.length > 1 check.
                    // close out the select tag
                    return locals.genericTag('select', __selectTags, {
                        name: locals.form.makeName(name, resource),
                        id: locals.form.makeId(name, resource)
                    }, params);
                }
            },
            genericTag: function (name, inner, params, override) {
                return '<' + name + locals.htmlTagParams(params, override) + '>' + inner + '</' + name + '>';
            },
            htmlTagParams: function (params, override) {
                var maybeParams = '';
                locals.safeMerge(params, override);
                for (var key in params) {
                    if (params[key] !== null && params[key] !== 'undefined') {
                        maybeParams += ' ' + key + '="' + params[key].toString().replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"';
                    }
                }
                return maybeParams;
            },
            safeMerge: function (mergeWhat) {
                mergeWhat = mergeWhat || {};
                Array.prototype.slice.call(arguments).forEach(function (mergeWith, i) {
                    if (i === 0)
                        return;
                    for (var key in mergeWith) {
                        if (!mergeWith.hasOwnProperty(key) || key in mergeWhat)
                            continue;
                        mergeWhat[key] = mergeWith[key];
                    }
                });
                return mergeWhat;
            },
            getSiteParam: function (name, params, defval) {
                var cur = '';
                params.forEach(function (param) {
                    if (name === param.name) {
                        cur = param.curvalue;
                    }
                });
                return cur || defval || '';
            },
            loggerDate: function (date) {
                var now = new Date().toISOString();
                if (date) {
                    var time = Date.parse(date);
                    now = new Date(time).toISOString();
                }
                var iso = now.split('T');
                return iso[0].replace('-', '_');
            },
            getCurrentDate: function (date) {
                var self = this, now = new Date().toISOString();
                if (date) {
                    var time = date;
                    if (self.isNumeric(date)) {
                        time = parseFloat(date);
                    } else if (isNaN(date)) {
                        time = new Date();
                    } else if (typeof date !== 'number') {
                        time = Date.parse(date);
                    }
                    now = new Date(time).toISOString();
                }
                var iso = now.replace('T', ' ').split('.');
                return iso[0];
            },
            openGraph: function (data) {
                var head = '';
                if (data && typeof data === 'object') {
                    head = (Object.keys(data).length) ? '<!-- Open Graph -->\n' : '';
                    if (data.image) {
                        head += '<meta property="og:image" content="' + data.image + '" />\n';
                    }
                    if (data.title) {
                        head += '<meta property="og:title" content="' + data.title + '" />\n';
                    }
                    if (data.siteName) {
                        head += '<meta property="og:site_name" content="' + data.siteName + '" />\n';
                    }
                    if (data.description) {
                        head += '<meta property="og:description" content="' + data.description + '" />\n';
                    }
                    if (data.url) {
                        head += '<meta property="og:url" content="' + data.url + '" />\n';
                    }
                    if (data.type) {
                        head += '<meta property="og:type" content="' + data.type + '" />\n';
                    }
                    if (data.locale) {
                        head += '<meta property="og:locale" content="' + data.type + '" />\n';
                    }
                    if (data.publishedTime) {
                        head += '<meta property="article:published_time" content="' + data.publishedTime + '">\n';
                    }
                    if (data.modifiedTime) {
                        head += '<meta property="article:modified_time" content="' + data.modifiedTime + '">\n';
                    }
                }
                return head;
            },
            siteIcons: function (data) {
                var head = '';
                if (!data) {
                    data = {
                        icon: '/favicon.ico'
                    };
                } else if (typeof data === 'string') {
                    data = {
                        icon: data
                    };
                }
                head = '<!-- Icons -->\n';
                head += '<link rel="shortcut icon" href="' + (data.icon ? data.icon : '/favicon.ico') + '">\n';
                head += '<link rel="icon" type="image/x-icon" href="' + (data.icon ? data.icon : '/favicon.ico') + '">\n';

                if (data && typeof data === 'object') {
                    if (data['144'] || data.all) {
                        head += '<link rel="apple-touch-icon" sizes="144x144" href="' + (data['144'].link || data.all.link ? data['144'].link || data.all.link : '/img/logo-default-lg.png') + '">\n';
                    }
                    if (data['114'] || data.all) {
                        head += '<link rel="apple-touch-icon" sizes="114x114" href="' + (data['114'].link || data.all.link ? data['114'].link || data.all.link : '/img/logo-default-lg.png') + '">\n';
                    }
                    if (data['72'] || data.all) {
                        head += '<link rel="apple-touch-icon" sizes="72x72" href="' + (data['72'].link || data.all.link ? data['72'].link || data.all.link : '/img/logo-default-lg.png') + '">\n';
                    }
                    if (data['57'] || data.all) {
                        head += '<link rel="apple-touch-icon" sizes="57x57" href="' + (data['57'].link || data.all.link ? data['57'].link || data.all.link : '/img/logo-default-lg.png') + '">\n';
                    }
                    if (data.link) {
                        head += '<link rel="apple-touch-icon" href="' + (data.link ? data.link : '/img/logo-default-lg.png') + '">\n';
                    }
                }
                return head;
            },
            siteFeed: function (data) {
                var head = '';
                if (data && data.title) {
                    return '<!-- RSS Feed -->\n<link rel="alternate" type="application/rss+xml" title="' + data.title + '" href="' + data.link + '">';
                }
                return head;
            },
            siteFBHeaders: function (data) {
                data = data ? data : {};
                var head = '';
                // <meta property="fb:admins" content="1234,1235" />
                // <meta property="fb:app_id" content="your_app_id" />
                return head;
            },
            siteTWHeaders: function (data) {
                data = data ? data : {};
                var head = '';
                // <meta name="twitter:site" content="@site">
                // <meta name="twitter:title" content="">
                // <meta name="twitter:card" content="summary">
                // <meta name="twitter:description" content="">
                return head;
            },
            siteDRHeaders: function (data) {
                data = data ? data : {};
                var head = '';
                // <meta property="fb:admins" content="1234,1235" />
                // <meta property="fb:app_id" content="your_app_id" />
                return head;
            },
            siteHeaders: function (data) {
                data = data ? data : {};
                var self = this, headers = '';
                headers += self.siteFeed(data.feed);
                headers += self.siteIcons(data.icons);
                headers += self.openGraph(data.openGraph);
                headers += self.siteFBHeaders(data.facebook || {});
                headers += self.siteTWHeaders(data.twitter || {});
                headers += self.siteDRHeaders(data.draugiem || {});
                return headers;
            },
            mergeRecursive: function (trg, src) {
                var self = this;
                for (var p in src) {
                    try {
                        // Property in destination object set; update its value.
                        if (src[p].constructor === Object) {
                            trg[p] = self.mergeRecursive(trg[p], src[p]);
                        } else {
                            trg[p] = src[p];
                        }
                    } catch (e) {
                        // Property in destination object not set; create it and set its value.
                        trg[p] = src[p];
                    }
                }
                return trg;
            }
        };
        if (!res.mergeLocals) {
            res.mergeLocals = utils.mergeLocals;
        }
        res.mergeLocals(locals);
        next();
    };
};