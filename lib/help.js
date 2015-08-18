var ejs = require('ejs');
var fs = require('fs');

/**
 * Help file
 * @param params
 * @param appPath
 */
exports.execute = function(params, appPath) {
    var str;
    if (params.length === 0) {
        str = fs.readFileSync(__dirname + '/templates/help.ejs', 'utf8');
    } else {
        if (fs.existsSync(__dirname + '/templates/' + params[0] + '.help.ejs')) {
            str = fs.readFileSync(__dirname + '/templates/' + params[0] + '.help.ejs', 'utf8');
        } else {
            console.error('   \033[31mHelp file not specified\x1b[0m\r\n');
            process.exit(1);
        }
    }

    var scripts = [];

    fs.readdir(__dirname + '/', function(err, files) {

        if (err) {
            console.log(err);
        }

        files.forEach(function(file) {
            if (file.replace('.js', '') !== file) {
                scripts.push(file.replace('.js', ''));
            }
        });

        var ret = ejs.render(str, {
            locals: {
                params: params,
                scripts: scripts
            },
            open: "<?",
            close: "?>"
        });

        console.log(ret);

    });
};