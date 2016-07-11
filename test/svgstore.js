import test from 'ava';
import svgstore from '../src/svgstore';

const doctype = '<?xml version="1.0" encoding="UTF-8"?>' +
	'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
	'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

test('should create an svg document', async t => {
	const store = svgstore();
	const svg = store.toString();

	t.is(svg.slice(0, 5), '<?xml');
});

test('should create an svg element', async t => {
	const store = svgstore();
	const svg = store.toString({inline: true});

	t.is(svg.slice(0, 4), '<svg');
});

test('should combine svgs', async t => {
	const store = svgstore()
		.add('foo', doctype + '<svg viewBox="0 0 100 100"><defs><linear-gradient/></defs><path/></svg>')
		.add('bar', doctype + '<svg viewBox="0 0 200 200"><defs><radial-gradient/></defs><rect/></svg>');

	const expected = doctype +
		'<svg xmlns="http://www.w3.org/2000/svg">' +
		'<defs><linear-gradient/><radial-gradient/></defs>' +
		'<symbol id="foo" viewBox="0 0 100 100"><path/></symbol>' +
		'<symbol id="bar" viewBox="0 0 200 200"><rect/></symbol>' +
		'</svg>';

	t.is(store.toString(), expected);
});

test('should clean defs', async t => {
	const store = svgstore()
		.add('foo', doctype + '<svg viewBox="0 0 100 100"><defs><linear-gradient style="fill: red;" /></defs><path/></svg>')
		.add('bar', doctype + '<svg viewBox="0 0 200 200"><defs><radial-gradient/></defs><rect/></svg>');

	const expected = doctype +
		'<svg xmlns="http://www.w3.org/2000/svg">' +
		'<defs><linear-gradient/><radial-gradient/></defs>' +
		'<symbol id="foo" viewBox="0 0 100 100"><path/></symbol>' +
		'<symbol id="bar" viewBox="0 0 200 200"><rect/></symbol>' +
		'</svg>';

	t.is(store.toString(), expected);
});

test('should clean objects', async t => {
	const store = svgstore()
		.add('foo', doctype + '<svg viewBox="0 0 100 100"><defs><linear-gradient/></defs><path/></svg>')
		.add('bar', doctype + '<svg viewBox="0 0 200 200"><defs><radial-gradient/></defs><rect/></svg>');

	const expected = doctype +
		'<svg xmlns="http://www.w3.org/2000/svg">' +
		'<defs><linear-gradient/><radial-gradient/></defs>' +
		'<symbol id="foo" viewBox="0 0 100 100"><path/></symbol>' +
		'<symbol id="bar" viewBox="0 0 200 200"><rect/></symbol>' +
		'</svg>';

	t.is(store.toString(), expected);
});
