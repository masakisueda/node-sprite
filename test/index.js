(function (global) {

    var Nodesprite = require('../index');
    var Builder = Nodesprite.Builder;
    var imagemagick = Nodesprite.ImageMagick;
    var should = require('should');
    var _ = require('underscore');
    var fs = require('fs');
    var prefix = process.cwd();
    var path = require('path');

    var builder,
        images = [
            prefix + '/test/image/100x200.png',
            prefix + '/test/image/200x100.png',
            prefix + '/test/image/100x100.png',
            prefix + '/test/image/100x100-2.png'
        ];

    describe('sprite builder', function () {

        it('create', function () {
            var outputCSS = '_sprite.styl';
            builder = new Builder({
                selector: '_sprite',
                images: images,
                baseRatio: 2,
                outputDirectory: prefix + '/test/sprite',
                outputCss: outputCSS
            });

            builder.images.length.should.equal(4);
            builder.outputCSS.should.equal(path.resolve(builder.outputDirectory + path.sep + outputCSS));
        });

        it('builder#addConfigure', function () {
            var ratios = [1.0, 1.3, 1.5, 2.0];
            _.each(ratios, function (ratio) {
                builder.addConfiguration('ratio' + ratio, {
                    pixelRatio: ratio,
                    outputImage: "output-" + ratio + ".png"
                });
            });
            builder.configs.length.should.equal(4);
        });

        it('builder#build', function (done) {
            builder.build(function () {
                fs.existsSync(prefix + '/test/sprite/_sprite.styl').should.be.ok;
                fs.existsSync(prefix + '/test/sprite/output-1.png').should.be.ok;
                fs.existsSync(prefix + '/test/sprite/output-2.png').should.be.ok;
                done();
            });
        });

    });

})(this);
