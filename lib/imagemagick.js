var im = require('imagemagick');
var exec = require('child_process').exec;

var _ = require('underscore');
var async = require('async');

var exec2 = function exec2(command, callback) {
    return exec(command, callback);
};

var Imagemagick = function () {};

Imagemagick.prototype.composite = function composite(options, callback) {
    var self = this,
        images = options.images,
        outputpath = options.output,
        width = options.width,
        height = options.height,
        command;

    command = 'convert -size ' + width + 'x' + height + ' canvas:transparent -alpha transparent ' + outputpath + '';
    return exec2(command, function (err, stdout, stderr) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        async.eachSeries(images, function (image, done) {
            console.log('Composing image ', image.filepath);
            self.putImage(outputpath, image, done);
        }, callback);
    });

};

Imagemagick.prototype.putImage = function putImage(filepath, image, callback) {
    var command,
        mvcmd = process.platform === 'win32' ? 'move' : 'mv';

    command = ' composite -geometry ' + image.width + 'x' + image.height + '+' + image.cssx + '+' + image.cssy +
              ' ' + image.filepath + ' ' + filepath + ' ' + filepath + '.tmp && ' + mvcmd + ' ' + filepath + '.tmp ' + filepath;

    return exec2(command, function (err, stdout, stderr) {
        if (err) {
            return callback(err);
        }
        if (stderr) {
            return callback(stderr);
        }
        return callback(null);
    });
};

Imagemagick.prototype.resize = function resize(options, callback) {
    var width = options.width,
        height = options.height,
        input = options.input,
        output = options.output,

        resizeOptions = {
            srcPath: input,
            dstPath: output,
            width: width,
            height: height,
            strip: options.strip || true
        };

    console.log('Resize ', resizeOptions.srcPath, '->' , resizeOptions.dstPath);
    im.resize(resizeOptions, callback);
};

Imagemagick.prototype.getImageInfo = function getImageInfo(image, callback) {
    im.identify(image, function (err, res) {

        var filepath = res.artifacts.filename,
            filename = filepath.split('/').pop(),
            name = filename.split('.').shift();

        callback(err, {
            width: res.width,
            height: res.height,
            filepath: filepath,
            filename: filename,
            name: name,
        });

    });
};

module.exports = new Imagemagick();