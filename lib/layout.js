var _ = require('underscore');

var Layout = function () {};

Layout.prototype.layout = function(images, options) {
    options = options || {};

    var self = this,
        hpadding,
        vpadding,
        hmargin,
        vmargin,
        root;

    hpadding = options.hpadding || 0;
    vpadding = options.vpadding || 0;
    hmargin = options.hmargin || 0;
    vmargin = options.vmargin || 0;

    _.each(images, function (image) {
        image.w = image.width + hpadding * 2 + hmargin * 2;
        image.h = image.height + vpadding * 2 + vmargin * 2;
    });

    // sort by size
    images.sort(function(a, b) {
        var diff;
        diff = self.compare(Math.max(b.w, b.h), Math.max(a.w, a.h));
        if (diff === 0) {
            diff = self.compare(Math.min(b.w, b.h), Math.min(a.w, a.h));
        }
        if (diff === 0) {
            diff = self.compare(b.h, a.h);
        }
        if (diff === 0) {
            diff = self.compare(b.w, a.w);
        }
        return diff;
    });

    // root node
    root = {
        x: 0,
        y: 0,
        w: images[0].w,
        h: images[0].h
    };

    var layout = function layout(image) {
        var node;
        node = self.findNode(root, image.w, image.h);

        if (node) {
            self.placeImage(image, node, hpadding, vpadding, hmargin, vmargin);
            self.splitNode(node, image.w, image.h);
            return;
        }

        root = self.grow(root, image.w, image.h);
        layout(image);
        return;

    };
    _.each(images, layout);

    return {
        width: root.w,
        height: root.h
    };
};

Layout.prototype.compare = function(a, b) {
    if (a > b) {
        return 1;
    }
    if (b > a) {
        return -1;
    }
    return 0;
};

Layout.prototype.placeImage = function(image, node, hpadding, vpadding, hmargin, vmargin) {
    image.cssx = node.x + hmargin;
    image.cssy = node.y + vmargin;
    image.cssw = image.w - (2 * hpadding) - (2 * hmargin);
    image.cssh = image.h - (2 * vpadding) - (2 * vmargin);
    image.x = image.cssx + hpadding;
    image.y = image.cssy + vpadding;
    return;
};

Layout.prototype.findNode = function(root, w, h) {
    if (root.used) {
        return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);
    }
    if ((w <= root.w) && (h <= root.h)) {
        return root;
    }
    return;
};

Layout.prototype.splitNode = function(node, w, h) {
    node.used = true;
    node.down = {
        x: node.x,
        y: node.y + h,
        w: node.w,
        h: node.h - h
    };
    node.right = {
        x: node.x + w,
        y: node.y,
        w: node.w - w,
        h: h
    };
    return node.right;
};

Layout.prototype.grow = function(root, w, h) {
    var canGrowDown,
        canGrowRight,
        shouldGrowDown,
        shouldGrowRight;

    canGrowDown = w <= root.w;
    canGrowRight = h <= root.h;
    shouldGrowRight = canGrowRight && (root.h >= (root.w + w));
    shouldGrowDown = canGrowDown && (root.w >= (root.h + h));

    if (shouldGrowRight) {
        return this.growRight(root, w, h);
    } else if (shouldGrowDown) {
        return this.growDown(root, w, h);
    } else if (canGrowRight) {
        return this.growRight(root, w, h);
    } else if (canGrowDown) {
        return this.growDown(root, w, h);
    } else {
        throw "Can't fit " + w + "x" + h + " block into root " + root.w + "x" + root.h + " - this should not happen if images are pre-sorted correctly";
    }
};

Layout.prototype.growRight = function(root, w, h) {
    return {
        used: true,
        x: 0,
        y: 0,
        w: root.w + w,
        h: root.h,
        down: root,
        right: {
            x: root.w,
            y: 0,
            w: w,
            h: root.h
        }
    };
};

Layout.prototype.growDown = function(root, w, h) {
    return {
        used: true,
        x: 0,
        y: 0,
        w: root.w,
        h: root.h + h,
        down: {
            x: 0,
            y: root.h,
            w: root.w,
            h: h
        },
        right: root
    };
};

module.exports = new Layout();
