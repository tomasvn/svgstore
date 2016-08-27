/**
 * Utility method to create an XML document object with a jQuery-like
 * interface for node manipulation.
 */

'use strict';

var cheerio = require('cheerio');

function load(text) {
	return cheerio.load(text, {
		xmlMode: true
	});
}

module.exports = load;
