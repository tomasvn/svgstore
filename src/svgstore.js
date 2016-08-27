'use strict';

var assign = require('object-assign');
var cheerio = require('cheerio');

var svgToSymbol = require('./utils/svg-to-symbol');

var SELECTOR_SVG = 'svg';
var SELECTOR_DEFS = 'defs';

var TEMPLATE_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><defs/></svg>';
var TEMPLATE_DOCTYPE = '<?xml version="1.0" encoding="UTF-8"?>' +
	'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
	'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

var DEFAULT_OPTIONS = {
	cleanDefs: false,
	cleanObjects: false,
	svgAttr: {},
	defsAttr: {},
	symbolAttr: {},
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
	var svgstoreOptions = assign({}, DEFAULT_OPTIONS, options);

	// <svg>
	var parent = load(TEMPLATE_SVG);
	var parentSvg = parent(SELECTOR_SVG);
	var parentDefs = parent(SELECTOR_DEFS);

	return {
		element: parent,

		add: function (id, file, options) {
			var child = load(file);
			var addOptions = assign({}, svgstoreOptions, options);

			// <defs>
			var childDefs = child(SELECTOR_DEFS);
			var cleanDefs = addOptions.cleanDefs;

			if (cleanDefs) {
				clean(child, childDefs, cleanDefs);
			}

			parentDefs.append(childDefs.contents());
			childDefs.remove();

			// <symbol>
			var childSymbol = svgToSymbol(id, child, addOptions);
			var cleanObjects = addOptions.cleanObjects;

			if (cleanObjects) {
				clean(child, childSymbol, cleanObjects);
			}

			parentSvg.append(childSymbol);

			return this;
		},

		toString: function (options) {
			var toStringOptions = assign({}, svgstoreOptions, options);
			var xml = parent.xml();

			if (!toStringOptions.inline) {
				return TEMPLATE_DOCTYPE + xml;
			}

			return xml;
		}
	};
}

module.exports = svgstore;
