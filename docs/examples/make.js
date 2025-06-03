'use strict';

var svgstore = require('../../src/svgstore');
var fs = require('fs');

var sprites = svgstore({
	fragmentIdentifier: (id) => `view-${id}`,
	processGradient: true,
})
	.add('unicorn', fs.readFileSync('./assets/unicorn.svg', 'utf8'))
	.add('rainbow', fs.readFileSync('./assets/rainbow.svg', 'utf8'))
	.add('gradient', fs.readFileSync('./assets/gradient.svg', 'utf8'));

fs.writeFileSync('./sprites.svg', sprites.toString());
