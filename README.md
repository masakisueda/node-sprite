# node-sprite

Genera a set of style sheets and sprite image from images using Node.js.

## Example

```javascript
    var Builder = require('node-sprite').Builder;

    var builer = new Builder({
        images: ['test1.png', 'test2.png'],
        outputDirectory: process.cwd(),
        outputCSS: 'sprites.css',
        selector: 'sprite',
        baseRatio: 2
    });

    builder.build(function (err) {
        if (err) {
            trhow err;
        }
        console.log('success!!');
    });

```

## Device pixel ratio

If you want to get multiple resolutions, set configuration of pixelratio

```javascript
    builder.addConfiguration({
        pixelRatio: 1.0,
        outputImage: 'sprite-1.0.png'
    });
```