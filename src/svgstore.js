'use strict';

var assign = require('object-assign');
var cheerio = require('cheerio');

var svgToSymbol = require('./utils/svg-to-symbol');

var SELECTOR_DEFS = 'defs';
var SELECTOR_SVG = 'svg';

var TEMPLATE_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><defs/></svg>';
var TEMPLATE_DOCTYPE = '<?xml version="1.0" encoding="UTF-8"?>' +
	'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
	'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

var DEFAULT_OPTIONS = {
	cleanDefs: false,
	cleanObjects: false,
	customSymbolAttrs: []
};

function load(text) {
	return cheerio.load(text, {xmlMode: true});
}

function clean($, el, attrs) {
	var localAttrs = attrs;

	if (typeof localAttrs === 'boolean') {
		localAttrs = ['style'];
	}

	if (!localAttrs || !localAttrs.length) {
		return el;
	}

	el.find('*').each(function (i, el) {
		localAttrs.forEach(function (attr) {
			$(el).removeAttr(attr);
		});
	});

	return el;
}

function svgstore(options) {
	var parentOptions = assign({}, DEFAULT_OPTIONS, options);

	var parent = load(TEMPLATE_SVG);
	var parentSvg = parent(SELECTOR_SVG);
	var parentDefs = parent(SELECTOR_DEFS);

	return {
		element: parent,

		add: function (id, file, options) {
			var childOptions = assign({}, parentOptions, options);

			var child = load(file);
			var childDefs = child(SELECTOR_DEFS);

			var cleanDefs = childOptions.cleanDefs;
			if (cleanDefs) {
				clean(child, childDefs, cleanDefs);
			}
			parentDefs.append(childDefs.contents());
			childDefs.remove();

			var childSymbol = svgToSymbol(id, child, childOptions);

			// clean <symbol/>
			var cleanObjects = childOptions.cleanObjects;
			if (cleanObjects) {
				clean(child, childSymbol, cleanObjects);
			}

			// append <symbol/>
			parentSvg.append(childSymbol);

			return this;
		},

		toString: function (options) {
			var xml = parent.xml();
			var inline = options && options.inline;

			if (!inline) {
				return TEMPLATE_DOCTYPE + xml;
			}

			return xml;
		}
	};
}

module.exports = svgstore;
