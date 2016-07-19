# `svgstore`

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url]

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

### svgstore([options]): SvgStore

- `options` `{Object}`: [Options for converting SVGs to symbols](#svgstore-options)

Creates a container svg sprites document.

### .element

The current [cheerio](https://github.com/cheeriojs/cheerio) instance.

### .add(id, svg [, options]): SvgStore

- `id` `String` Unique `id` for this svg file.
- `svg` `String` Raw source of the svg file.
- `options` `{Object}` Same as the [options of `svgstore()`](#svgstore-options), but will only apply to this svg file.

Appends a file to the sprite with the given `id`.

### .toString([options]): String

- `options` `{Object}`
  - `inline` `{Boolean}` (default: `false`) Don't output `<?xml ?>` and `DOCTYPE`.

Outputs sprite as a string of XML.

## <a name="svgstore-options"></a>Options

- `cleanDefs` `{Boolean|Array}` (default: `false`) Remove `style` attributes from SVG definitions, or a list of attributes to remove.
- `cleanObjects` `{Boolean|Array}` (default: `false`) Remove `style` attributes from SVG objects, or a list of attributes to remove.
- `customSymbolAttrs` `{Array}` (default: `[]`) Custom attributes to have `svgstore` attempt to copy to the newly created `<symbol/>` tag from the root SVG. These will be searched for in addition to `id`, `viewBox`, `aria-labelledby`, and `role`.

## Contribute

Standards for this project, including tests, code coverage, and semantics are enforced with a build tool. Pull requests must include passing tests with 100% code coverage and no linting errors.

### Test

    $ npm test

----

© Shannon Moeller <me@shannonmoeller.com> (shannonmoeller.com)

Licensed under [MIT](http://shannonmoeller.com/mit.txt)

[coveralls-img]: http://img.shields.io/coveralls/svgstore/svgstore/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/svgstore/svgstore
[downloads-img]: http://img.shields.io/npm/dm/svgstore.svg?style=flat-square
[npm-img]:       http://img.shields.io/npm/v/svgstore.svg?style=flat-square
[npm-url]:       https://npmjs.org/package/svgstore
[travis-img]:    http://img.shields.io/travis/svgstore/svgstore.svg?style=flat-square
[travis-url]:    https://travis-ci.org/svgstore/svgstore
