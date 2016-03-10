# `svgstore`

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Chat][gitter-img]][gitter-url] [![Tip][amazon-img]][amazon-url]

Combines multiple svg files into one using `<symbol>` elements which you may [`<use>` in your markup](https://css-tricks.com/svg-sprites-use-better-icon-fonts/). Heavily inspired by [`grunt-svgstore`](https://github.com/FWeinb/grunt-svgstore) and [`gulp-svgstore`](https://github.com/w0rm/gulp-svgstore), this is a standalone module that may be used in any asset pipeline.

## Install

    $ npm install --save svgstore

## Usage

```js
var svgstore = require('svgstore');
var fs = require('fs');

var sprites = svgstore()
    .add('unicorn', fs.readFileSync('./unicorn.svg', 'utf8'))
    .add('rainbow', fs.readFileSync('./rainbow.svg', 'utf8'));

fs.writeFileSync('./sprites.svg', sprites);
```

The resulting file may be consumed in markup as external content.

```html
<body>
    <svg role="img"><use xlink:href="./sprites.svg#unicorn"/></svg>
    <svg role="img"><use xlink:href="./sprites.svg#rainbow"/></svg>
</body>
```

See the [examples directory](https://github.com/shannonmoeller/svgstore/tree/master/examples) for more detail.

## API

### svgstore(): SvgStore

Creates a container svg sprites document.

### .element

The current [cheerio](https://github.com/cheeriojs/cheerio) instance.

### .add(id, svg): SvgStore

- `id` `String` Unique `id` for this svg file.
- `svg` `String` Raw source of the svg file.

Appends a file to the sprite with the given `id`.

### .toString([options]): String

- `options` `{Object}`
  - `inline` `{Boolean}` (default: `false`) Don't output `<?xml ?>` and `DOCTYPE`.

Outputs sprite as a string of XML.

## Contribute

Standards for this project, including tests, code coverage, and semantics are enforced with a build tool. Pull requests must include passing tests with 100% code coverage and no linting errors.

### Test

    $ npm test

----

© Shannon Moeller <me@shannonmoeller.com> (shannonmoeller.com)

Licensed under [MIT](http://shannonmoeller.com/mit.txt)

[amazon-img]:    https://img.shields.io/badge/amazon-tip_jar-yellow.svg?style=flat-square
[amazon-url]:    https://www.amazon.com/gp/registry/wishlist/1VQM9ID04YPC5?sort=universal-price
[coveralls-img]: http://img.shields.io/coveralls/shannonmoeller/svgstore/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/shannonmoeller/svgstore
[downloads-img]: http://img.shields.io/npm/dm/svgstore.svg?style=flat-square
[gitter-img]:    http://img.shields.io/badge/gitter-join_chat-1dce73.svg?style=flat-square
[gitter-url]:    https://gitter.im/shannonmoeller/shannonmoeller
[npm-img]:       http://img.shields.io/npm/v/svgstore.svg?style=flat-square
[npm-url]:       https://npmjs.org/package/svgstore
[travis-img]:    http://img.shields.io/travis/shannonmoeller/svgstore.svg?style=flat-square
[travis-url]:    https://travis-ci.org/shannonmoeller/svgstore
