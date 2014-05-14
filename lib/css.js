var _ = require('underscore');

/**
 * CSS
 * create sprite image and stylesheet
 */
var CSS = function () {};

CSS.prototype.build = function build(options, callback) {
    var self = this,
        baseRatio = options.baseRatio,
        images = options.images,
        pixelRatio = options.pixelRatio,
        relativePath = options.relativePath,
        selector = options.selector,
        width = options.width,
        height = options.height,
        cssText = '',
        x, y, attr;

    cssText = self.css(selector, [
        "  background-image: url( '" + relativePath + "' )",
        '  background-repeat: no-repeat',
        "  background-size: " + (width / baseRatio) + "px " + (height / baseRatio) + "px"
    ]);
    cssText = self.wrapMediaQuery(pixelRatio, cssText);

    cssText += "\n";

    if (baseRatio === pixelRatio) {
        _.each(images, function (image) {
            x = - image.cssx / baseRatio;
            if (x !== 0) {
                x = x + 'px';
            }
            y = - image.cssy / baseRatio;
            if (y !== 0) {
                y = y + 'px';
            }
            attr = [
                "  width: " + (image.cssw / baseRatio) + "px",
                "  height: " + (image.cssh / baseRatio) + "px",
                "  background-position: " + x + " " + y
            ];
            cssText += self.css(selector + "." + image.name, attr);
        });
    }

    return cssText;
};

CSS.prototype.css = function css(selector, attributes) {
    return selector + " {\n" + attributes.join(";\n") + ";\n}\n";
};

CSS.prototype.wrapMediaQuery = function wrapMediaQuery(pixelRatio, css) {
    return "@media (min--moz-device-pixel-ratio: " + pixelRatio + "),\n" +
           "(-o-min-device-pixel-ratio: " + pixelRatio + "),\n" +
           "(-webkit-min-device-pixel-ratio: " + pixelRatio + "),\n" +
           "(min-device-pixel-ratio: " + pixelRatio + ") {\n" + css + "}\n";
};

module.exports = new CSS();
