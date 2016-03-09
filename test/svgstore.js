import svgstore from '../src/svgstore';
import fs from 'fs';
import test from 'ava';

var doctype = '<?xml version="1.0" encoding="UTF-8"?>' +
	'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
	'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

test('should create an svg document', async assert => {
	var store = svgstore();
	var svg = store.toString();

	assert.is(svg.slice(0, 5), '<?xml');
});

test('should create an svg element', async assert => {
	var store = svgstore();
	var svg = store.toString({inline: true});

	assert.is(svg.slice(0, 4), '<svg');
});

test('should combine svgs', async assert => {
	var store = svgstore();

	store.add('foo', doctype +
		'<svg viewBox="0 0 100 100"><defs><linear-gradient/></defs><path/></svg>'
	);

	store.add('bar', doctype +
		'<svg viewBox="0 0 200 200"><defs><radial-gradient/></defs><rect/></svg>'
	);

	var expected = doctype +
		'<svg xmlns="http://www.w3.org/2000/svg">' +
		'<defs><linear-gradient/><radial-gradient/></defs>' +
		'<symbol id="foo" viewBox="0 0 100 100"><path/></symbol>' +
		'<symbol id="bar" viewBox="0 0 200 200"><rect/></symbol>' +
		'</svg>';

	assert.is(store.toString(), expected);
});

test('should combine svgs', async assert => {
