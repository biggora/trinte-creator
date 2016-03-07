/**
 *  Mail manager
 *
 *
 *  Created by trinte-creator script
 *  App based on TrinteJS MVC framework
 *  TrinteJS homepage http://www.trintejs.com
 **/
/*global
 mergeRecursive
 */
var nodemailer = require('nodemailer');
var mc = require('../mail');
var mailConf = mc[process.env.NODE_ENV || 'dev'];

// Message object
var defaultMessage = {
    // sender info
    from: mailConf.senderName + ' <' + mailConf.senderMail + '>',
    // Comma separated list of recipients
    to: '"Receiver Name" <nodemailer@example.com>',
    // Subject of the message
    subject: 'TrinteJS is unicode friendly',
    headers: {
        'X-Laziness-level': 1000
    },
    // plaintext body
    text: '',
    // HTML body
    html: '',
    // An array of attachments
    attachments: []
};

/**
 * Define createTransport
 * @param {Object} mailConfig
 **/
exports.createTransport = function createTransport(mailConfig) {
    mailConfig = mailConfig ? mailConfig : mailConf.config;
    return nodemailer.createTransport(mailConfig);
};

/**
 * Define sendMail
 * @param {Object} message
 * @param {Function} callback
 * @param {Bool} close
 **/
exports.sendMail = function sendMail(message, callback, close) {
    var close = close ? false : true;
    var transport = exports.createTransport();
    transport.sendMail(message, function (error, info) {
        if (error) {
            console.log(error.message);
            return callback && callback(error.message, info);
        }
        if (close) {
            transport.close();
        }
        return callback && callback(null, info);
    });
};

/**
 * Define mailSender
 **/
exports.mailSender = function mailSender() {
    return function (req, res) {
        var recMessage = req.body.message, message;
        if (recMessage) {
            message = mergeRecursive({}, defaultMessage);
            message = mergeRecursive(message, recMessage);
            // Create a transport object
            var locTransport = nodemailer.createTransport(mailConf.config);
            locTransport.sendMail(message, function (error) {
                if (error) {
                    console.log('Error occured');
                    console.log(error.message);
                    return res.send(error);
                }
                console.log('Message sent successfully!');
                // close the connection pool
                locTransport.close();
                // if you don't want to use this transport object anymore, uncomment following line
                return res.send('Message sent successfully!');
            });
        } else {
            return res.send('Invalid message!');
        }
    };
};