'use strict';

var copyAttributes = require('./utils/copy-attributes');
var loadXml = require('./utils/load-xml');
var removeAttributes = require('./utils/remove-attributes');
var setAttributes = require('./utils/set-attributes');
var svgToSymbol = require('./utils/svg-to-symbol');
var getSvgRect = require('./utils/get-svg-rect');
var safeCleanDefs = require("./utils/safe-clean-defs");

var SELECTOR_SVG = 'svg';
var SELECTOR_DEFS = 'defs';

var TEMPLATE_SVG = '<svg><defs/></svg>';
var TEMPLATE_DOCTYPE =
	'<?xml version="1.0" encoding="UTF-8"?>' +
	'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
	'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
/**
 * Default options used by svgstore.
 * @typedef {Object} SvgstoreOptions
 * @property {boolean} cleanDefs - Whether to clean <defs> elements.
 * @property {boolean} cleanSymbols - Whether to clean <symbol> elements.
 * @property {boolean} inline - Whether to output inline SVG.
 * @property {boolean|Object} svgAttrs - Attributes to set on the root <svg>.
 * @property {boolean|Object} symbolAttrs - Attributes to set on <symbol> elements.
 * @property {boolean} copyAttrs - Whether to copy attributes from original SVG.
 * @property {boolean} renameDefs - Whether to rename IDs inside <defs>.
 * @property {function|null} fragmentIdentifier - Function to generate fragment identifiers.
 * @property {boolean} processGradient - Whether to process gradients or not
 */
var DEFAULT_OPTIONS = {
	cleanDefs: false,
	cleanSymbols: false,
	inline: false,
	svgAttrs: false,
	symbolAttrs: false,
	copyAttrs: false,
	renameDefs: false,
	fragmentIdentifier: null,
	processGradient: false,
	log: true,
};

/**
 * Creates an SVG store to combine multiple SVG files into one.
 *
 * @param {Partial<SvgstoreOptions>} [options] - Configuration options to override defaults.
 * @returns {Object} An object with methods to add SVGs and output the combined SVG.
 */
function svgstore(options) {
	/** @type {SvgstoreOptions} */
	var svgstoreOptions = Object.assign({}, DEFAULT_OPTIONS, options);

	// <svg>
	var parent = loadXml(TEMPLATE_SVG);
	var parentSvg = parent(SELECTOR_SVG);
	var parentDefs = parent(SELECTOR_DEFS);

	let currentY = 0;

	return {
		element: parent,

		/**
		 * Adds an SVG file to the store.
		 *
		 * @param {string} id - Unique identifier for the SVG symbol.
		 * @param {string} file - SVG file content or path to load.
		 * @param {Partial<SvgstoreOptions>} [options] - Options to override defaults for this addition.
		 * @returns {Object} The svgstore instance for chaining.
		 */
		add: function (id, file, options) {
			var child = loadXml(file);
			var addOptions = Object.assign({}, svgstoreOptions, options);

			// <defs>
			var childDefs = child(SELECTOR_DEFS);

			removeAttributes(childDefs, safeCleanDefs(addOptions.cleanDefs));

			if (addOptions.processGradient) {
				var linearGradients = childDefs.find('linearGradient');
				if (linearGradients.length) {
					linearGradients.each(function (i, elem) {
						var $elem = child(elem);
						var oldId = $elem.attr('id');
						if (!oldId) return;

						var newId = id + '__' + oldId;
						$elem.attr('id', newId);

						// Update references in fill, stroke, filter, style attributes
						child('[fill], [stroke], [filter], [style]').each(
							function (i, refElem) {
								var $refElem = child(refElem);
								['fill', 'stroke', 'filter', 'style'].forEach(
									function (attr) {
										var val = $refElem.attr(attr);
										if (
											val &&
											val.includes('url(#' + oldId + ')')
										) {
											var newVal = val.replace(
												new RegExp(
													'url\\(#' + oldId + '\\)',
													'g'
												),
												'url(#' + newId + ')'
											);
											$refElem.attr(attr, newVal);
										}
									}
								);
							}
						);

						// Update <use> elements referencing the old gradient ID
						child('use').each(function (i, useElem) {
							var $useElem = child(useElem);
							['xlink:href', 'href'].forEach(function (prop) {
								var val = $useElem.attr(prop);
								if (val === '#' + oldId) {
									$useElem.attr(prop, '#' + newId);
								}
							});
						});
					});
				}
			}

			/* rename defs ids (existing original logic) */
			if (addOptions.renameDefs) {
				childDefs.children().each(function (i, _elem) {
					var elem = child(_elem);
					var oldDefId = elem.attr('id');
					var newDefId = id + '_' + oldDefId;
					elem.attr('id', newDefId);

					/* process use tags */
					child('use').each(function (i, use) {
						var hrefLink = '#' + oldDefId;
						var checkableProperties = ['xlink:href', 'href'];
						var foundProperty;
						for (var j = 0; j < checkableProperties.length; j++) {
							var currentProperty = checkableProperties[j];
							if (child(use).prop(currentProperty) === hrefLink) {
								foundProperty = currentProperty;
								break;
							}
						}
						if (!foundProperty) {
							return;
						}
						child(use).attr(foundProperty, '#' + newDefId);
					});

					/* process fill attributes */
					child('[fill="url(#' + oldDefId + ')"]').each(function (
						i,
						use
					) {
						child(use).attr('fill', 'url(#' + newDefId + ')');
					});
				});
			}

			parentDefs.append(childDefs.contents());
			childDefs.remove();

			// <symbol>
			var childSvg = child(SELECTOR_SVG);
			var childSymbol = svgToSymbol(id, child, addOptions);

			removeAttributes(childSymbol, addOptions.cleanSymbols);
			copyAttributes(childSymbol, childSvg, addOptions.copyAttrs);
			setAttributes(childSymbol, addOptions.symbolAttrs);
			parentSvg.append(childSymbol);

			if (typeof svgstoreOptions.fragmentIdentifier === 'function') {
				const { width, height } = getSvgRect(file);
				const childView = child('<view/>');
				childView.attr('id', svgstoreOptions.fragmentIdentifier(id));
				childView.attr('viewBox', `0 ${currentY} ${width} ${height}`);
				const childUse = child('<use/>');
				childUse.attr('xlink:href', `#${id}`);
				childUse.attr('width', width);
				childUse.attr('height', height);
				childUse.attr('x', 0);
				childUse.attr('y', currentY);
				currentY += height;
				parentSvg.append(childView);
				parentSvg.append(childUse);
			}

			return this;
		},

		/**
		 * Converts the stored SVG elements to a string.
		 *
		 * @param {Partial<SvgstoreOptions>} [options] - Options to override defaults for output.
		 * @returns {string} The combined SVG as a string.
		 */
		toString: function (options) {
			// Create a clone so we don't modify the parent document.
			var clone = loadXml(parent.xml());
			var toStringOptions = Object.assign({}, svgstoreOptions, options);

			// <svg>
			var svg = clone(SELECTOR_SVG);

			setAttributes(svg, toStringOptions.svgAttrs);

			// output inline
			if (toStringOptions.inline) {
				return clone.xml();
			}

			// output standalone
			svg.attr('xmlns', function (val) {
				return val || 'http://www.w3.org/2000/svg';
			});

			svg.attr('xmlns:xlink', function (val) {
				return val || 'http://www.w3.org/1999/xlink';
			});

			return TEMPLATE_DOCTYPE + clone.xml();
		},
	};
}

module.exports = svgstore;
