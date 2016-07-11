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
			var child = load(file);
			var childOptions = assign({}, parentOptions, options);

			var childSvg = child(SELECTOR_SVG);
			var childDefs = child(SELECTOR_DEFS);
			var childSymbol = child(TEMPLATE_SYMBOL);

			var cleanDefs = childOptions.cleanDefs;
			var cleanObjects = childOptions.cleanObjects;

			// clean and merge <defs/>

			if (cleanDefs) {
				clean(child, childDefs, cleanDefs);
			}

			parentDefs.append(childDefs.contents());
			childDefs.remove();

			// clean and clone <svg/> as <symbol/>

			if (cleanObjects) {
				clean(child, childSvg, cleanObjects);
			}

			childSymbol.attr(ATTRIBUTE_ID, id);
			childSymbol.attr(ATTRIBUTE_VIEW_BOX, childSvg.attr(ATTRIBUTE_VIEW_BOX));
			childSymbol.append(childSvg.contents());

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
