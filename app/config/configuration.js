/**
 *  Default configuration file
 *
 *  Created by trinte-creator script
 *  App based on TrinteJS MVC framework
 *  TrinteJS homepage http://www.trintejs.com
 **/

module.exports = {
    debug: true,
    autoupdate: true,
    language: 'en',
    port: 3000,
    host: '0.0.0.0',
    session: {
        maxAge: 8640000,
        key: 'trinte',
        secret: 'feb723690aeccfa92ca9ee6fdf06e55a',
        clear_interval: 60
    },
    parser: {
        encoding: 'utf-8',
        keepExtensions: true,
        uploadDir: __dirname + '/../uploads'
    },
    uploader: {
        tmpDir: __dirname + '/../uploads',
        publicDir: __dirname + '/../public',
        uploadDir: __dirname + '/../public/files',
        uploadUrl: '/files/'
    },
    recaptcha: {
        public_key: '',
        private_key: ''
    },
    analytics: {
        code: '',
        domain: ''
    }
};