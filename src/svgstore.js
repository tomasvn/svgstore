'use strict';

var assign = require('object-assign');
var cheerio = require('cheerio');

var ATTRIBUTE_ID = 'id';
var ATTRIBUTE_VIEW_BOX = 'viewBox';

var SELECTOR_DEFS = 'defs';
var SELECTOR_SVG = 'svg';

var TEMPLATE_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><defs/></svg>';
var TEMPLATE_SYMBOL = '<symbol/>';
var TEMPLATE_DOCTYPE = '<?xml version="1.0" encoding="UTF-8"?>' +
	'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
	'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

var DEFAULT_OPTIONS = {
	cleanDefs: false,
	cleanObjects: false
};

function load(text) {
	return cheerio.load(text, {xmlMode: true});
}

function clean(el, attrs) {
	var localAttrs = attrs;

	if (typeof localAttrs === 'boolean') {
		localAttrs = ['style'];
	}

	el.find('*').each(function (i, el) {
		attrs.forEach(function (attr) {
			el.removeAttribute(attr);
		});
	});

	return el;
}

function svgstore(options) {
	var globalOptions = assign({}, DEFAULT_OPTIONS, options);

	var parent = load(TEMPLATE_SVG);
	var parentSvg = parent(SELECTOR_SVG);
	var parentDefs = parent(SELECTOR_DEFS);

	return {
		element: parent,

		add: function (id, file, options) {
			var child = load(file);
			var childSvg = child(SELECTOR_SVG);
			var childDefs = child(SELECTOR_DEFS);
			var symbol = child(TEMPLATE_SYMBOL);
			var localOptions = assign({}, globalOptions, options);

			var cleanDefs = localOptions.cleanDefs;
			var cleanObjects = localOptions.cleanObjects;

			if (cleanDefs) {
				clean(childDefs, cleanDefs);
			}

			if (cleanObjects) {
				clean(childSvg, cleanObjects);
			}

			// merge <defs/>
			parentDefs.append(childDefs.contents());
			childDefs.remove();

			// clone <svg/> as <symbol/>
			symbol.attr(ATTRIBUTE_ID, id);
			symbol.attr(ATTRIBUTE_VIEW_BOX, childSvg.attr(ATTRIBUTE_VIEW_BOX));
			symbol.append(childSvg.contents());

			// append <symbol/>
			parentSvg.append(symbol);

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
