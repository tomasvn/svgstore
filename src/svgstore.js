'use strict';

var cheerio = require('cheerio');

var ATTRIBUTE_ID = 'id';
var ATTRIBUTE_VIEW_BOX = 'viewBox';

var SELECTOR_DEFS = 'defs';
var SELECTOR_SVG = 'svg';

var TEMPLATE_DOCTYPE = '<?xml version="1.0" encoding="UTF-8"?>' +
	'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
	'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
var TEMPLATE_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><defs/></svg>';
var TEMPLATE_SYMBOL = '<symbol/>';

function load(text) {
	return cheerio.load(text, {xmlMode: true});
}

function svgstore() {
	var parent = load(TEMPLATE_SVG);
	var parentSvg = parent(SELECTOR_SVG);
	var parentDefs = parent(SELECTOR_DEFS);

	function add(id, file) {
		var child = load(file);
		var childSvg = child(SELECTOR_SVG);
		var childDefs = child(SELECTOR_DEFS);
		var symbol = child(TEMPLATE_SYMBOL);

		// merge <defs/>
		parentDefs.append(childDefs.contents());
		childDefs.remove();

		// clone <svg/> as <symbol/>
		symbol.attr(ATTRIBUTE_ID, id);
		symbol.attr(ATTRIBUTE_VIEW_BOX, childSvg.attr(ATTRIBUTE_VIEW_BOX));
		symbol.append(childSvg.contents());

		// append <symbol/>
		parentSvg.append(symbol);
	}

	function toString(options) {
		var xml = parent.xml();
		var inline = options && options.inline;

		if (!inline) {
			return TEMPLATE_DOCTYPE + xml;
		}

		return xml;
	}

	return {
		add: add,
		toString: toString
	};
}

module.exports = svgstore;
