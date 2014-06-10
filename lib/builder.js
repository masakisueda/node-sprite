var fs = require('fs');
var path = require('path');

var _ = require('underscore');
var async = require('async');
var mkdirp = require('mkdirp');

var layout = require('./layout');
var css = require('./css');
var imagemagick = require('./imagemagick');

/**
 * Builder
 * create sprite image and stylesheet
 */
var Builder = function (options) {
    this.configs = [];
    this.images = options.images || [];
    this.baseRatio = options.baseRatio;
    this.outputDirectory = options.outputDirectory;
    this.outputCSS = path.resolve(this.outputDirectory + path.sep + options.outputCss);
    this.selector = options.selector;
    this.options = options;
};

/**
 * Add ratio configuration
 *
 * @params {String} options[outputImage]
 * @params {Number} options[pixelRatio]
 */
Builder.prototype.addConfiguration = function addConfigure(name, options) {
    this.configs.push({
        name: name,
        outputImage: options.outputImage,
        pixelRatio: options.pixelRatio || 1,
        outputPath: path.resolve(this.outputDirectory + path.sep + options.outputImage)
    });
};

/**
 * Generate spritesheet and stylesheet
 * @param  {Function} done callback
 */
Builder.prototype.build = function build(done) {
    var self = this,
        base,
        css;

    if (this.baseRatio) {
        base = _.find(this.configs, function (config) {
            return config.pixelRatio === this.baseRatio;
        });
    }

    if (!this.baseRatio || !base) {
        base = _.max(this.configs, function (config) {
            return config.pixelRatio;
        });
        this.baseRatio = base.pixelRatio;
    }

    async.waterfall([
        // preparation
        function (next) {
            async.series(_.map(self.images, function (image) {
                return function (cb) {
                    imagemagick.getImageInfo(image, cb);
                };
            }), function (err, res) {
                next(err, res);
            });
        },
        function (images, next) {
            mkdirp(self.outputDirectory, function (err) {
                if (err) {
                    return next(err);
                }
                next(null, images);
            });
        },
        // create sprite
        function (images, next) {
            // add layout infomation
            self.layoutImage(images);
            // generate style sheet by the pixelRatio
            css = _.map(self.configs, function (config) {
                return self.generateCSS(config, images);
            }).join('\n');
            return fs.writeFile(self.outputCSS, css, function(err) {
                if (err) {
                    next(err);
                    return;
                }
                console.log('StyleSheet written to', self.outputCSS, '\n');
                return next(null, images);
            });
        },
        // create sprite
        function (images, next) {
            self.createSprite(base, images, next);
        },
        // create ratio size
        function (next) {
            var subconfigs = _.filter(self.configs, function (config) {
                return config.pixelRatio !== self.baseRatio;
            });
            async.eachSeries(subconfigs, function (config, cb) {
                imagemagick.resize({
                    width: self.layout.width * config.pixelRatio / self.baseRatio,
                    height: self.layout.height * config.pixelRatio / self.baseRatio,
                    input: base.outputPath,
                    output: config.outputPath,
                    strip: true
                }, cb);
            }, next);
        }
    ], done);

};

/**
 * Create sprite image
 *
 * @param  {Object} config sprite configuration
 * @param  {Function} callback
 */
Builder.prototype.createSprite = function createSprite(config, images, callback) {
    return imagemagick.composite({
        output: config.outputPath,
        images: images,
        width: this.layout.width,
        height: this.layout.height
    }, callback);
};

/**
 * Layout images
 *
 * @param  {Array} images image information;
 */
Builder.prototype.layoutImage = function layoutImage(images) {
    this.layout = layout.layout(images, this.options);
};

/**
 * Generate CSS
 *
 * @param {String} options[selector]
 * @param {Array} options[ratio]
 * @param {Number} options[baseRatio]
 * @param {Array} options[images]
 */
Builder.prototype.generateCSS = function generateCSS(config, images) {
    return css.build({
        width: this.layout.width,
        height: this.layout.height,
        selector: this.selector,
        pixelRatio: config.pixelRatio,
        baseRatio: this.baseRatio,
        images: images,
        relativePath: path.relative(this.outputDirectory, config.outputPath)
    });
};

module.exports = Builder;
