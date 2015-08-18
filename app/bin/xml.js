/**
 * copyright Ryan Day 2010 <http://ryanday.org>, Joscha Feth 2013 <http://www.feth.com> [MIT Licensed]
 */

var elementStartChar = 'a-zA-Z_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FFF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD';
var elementNonStartChar = '\-.0-9\u00B7\u0300-\u036F\u203F\u2040';
var elementReplace = new RegExp('^([^' + elementStartChar + '])|^((x|X)(m|M)(l|L))|([^' + elementStartChar + elementNonStartChar + '])', 'g');

/**
 * cdata
 *
 * @param str
 * @returns {*}
 */
function cdata(str) {
    if (str) return '<![CDATA[' + str.replace(/]]>/g, '') + ']]>';
    return '<![CDATA[]]>';
}

/**
 * esc
 *
 * @param str
 * @returns {string}
 */
function esc(str) {
    return ('' + str).replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&apos;')
        .replace(/"/g, '&quot;');
}

/**
 * processToXML
 *
 * @param nodeData
 * @param options
 */
var processToXML = function (nodeData, options) {

    var makeNode = function (name, content, attributes, level, hasSubNodes) {

        var indentValue = options.indent !== undefined ? options.indent : '\t';
        var indent = options.prettyPrint ? '\n' + new Array(level).join(indentValue) : '';
        if (options.removeIllegalNameCharacters) {
            name = name.replace(elementReplace, '_');
        }

        var node = [indent, '<', name, (attributes || '')];
        if (content && content.length > 0) {
            node.push('>');
            node.push(content);
            if(hasSubNodes) node.push(indent);
            node.push('</');
            node.push(name);
            node.push('>');
        } else {
            node.push('/>');
        }
        return node.join('');
    };

    return (function fn(nodeData, nodeDescriptor, level) {
        var type = typeof nodeData;
        if ((Array.isArray) ? Array.isArray(nodeData) : nodeData instanceof Array) {
            type = 'array';
        } else if (nodeData instanceof Date) {
            type = 'date';
        }

        switch (type) {
            //if value is an array create child nodes from values
            case 'array':
                var ret = [];
                nodeData.map(function (v) {
                    ret.push(fn(v, 1, level + 1));
                    //entries that are values of an array are the only ones that can be special node descriptors
                });
                if(options.prettyPrint) ret.push('\n');
                return ret.join('');
            case 'date':
                // cast dates to ISO 8601 date (soap likes it)
                return nodeData.toJSON ? nodeData.toJSON() : nodeData + '';
            case 'object':
                if (nodeDescriptor === 1 && nodeData.name) {
                    var content = [], attributes = [], c = '';

                    if (nodeData.attrs) {
                        if (typeof nodeData.attrs !== 'object') {
                            // attrs is a string, etc. - just use it as an attribute
                            attributes.push(' ');
                            attributes.push(nodeData.attrs);
                        } else {
                            for (var key in nodeData.attrs) {
                                var value = nodeData.attrs[key];
                                attributes.push(' ');
                                attributes.push(key);
                                attributes.push('="');
                                attributes.push(options.escape ? esc(value) : value);
                                attributes.push('"');
                            }
                        }
                    }

                    //later attributes can be added here
                    if (typeof nodeData.value !== 'undefined') {
                        c = '' + nodeData.value;
                        content.push(options.escape ? esc(c) : c);
                    } else if (typeof nodeData.text !== 'undefined') {
                        c = '' + nodeData.text;
                        content.push(options.escape ? esc(c) : c);
                    }

                    if (nodeData.children) {
                        content.push(fn(nodeData.children, 0, level + 1));
                    }

                    return makeNode(nodeData.name, content.join(''), attributes.join(''), level, !!nodeData.children);
                } else {
                    var nodes = [];
                    for (var name in nodeData) {
                        nodes.push(makeNode(name, fn(nodeData[name], 0, level + 1), null, level + 1));
                    }
                    if(options.prettyPrint && nodes.length > 0) nodes.push('\n');
                    return nodes.join('');
                }
            /* falls through */
            case 'function':
                return nodeData();
            default:
                return options.escape ? esc(nodeData) : '' + nodeData;
        }
    }(nodeData, 0, 0));
};

/**
 * xmlHeader
 *
 * @param standalone
 * @returns {string}
 */
var xmlHeader = function (standalone) {
    var ret = ['<?xml version="1.0" encoding="utf-8"'];

    if (standalone) {
        ret.push(' standalone="yes"');
    }

    ret.push('?>');

    return ret.join('');
};

module.exports = function (obj, options) {

    var Buffer = this.Buffer || function Buffer() {
        };

    if (typeof obj === 'string' || obj instanceof Buffer) {
        try {
            obj = JSON.parse(obj.toString());
        } catch (e) {
            return false;
        }
    }

    var xmlheader = '';
    var docType = '';
    if (options) {
        if (typeof options === 'object') {
            // our config is an object

            if (options.xmlHeader) {
                // the user wants an xml header
                xmlheader = xmlHeader(!!options.xmlHeader.standalone);
            }

            if (typeof options.docType !== 'undefined') {
                docType = '<!DOCTYPE ' + options.docType + '>';
            }
        } else {
            // our config is a boolean value, so just add xml header
            xmlheader = xmlHeader();
        }
    }
    options = options || {};

    var ret = [
        xmlheader,
        (options.prettyPrint && docType ? '\n' : ''),
        docType,
        processToXML(obj, options)
    ];

    return ret.join('');
};

module.exports.jsonToXML = module.exports.objToXML = module.exports;
module.exports.escape = esc;
module.exports.cdata = cdata;
