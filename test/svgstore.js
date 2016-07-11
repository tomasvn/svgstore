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
	const store = svgstore({cleanDefs: true})
		.add('foo', doctype + '<svg viewBox="0 0 100 100"><defs><linear-gradient style="fill: red;"/></defs><path style="fill: red;"/></svg>')
		.add('bar', doctype + '<svg viewBox="0 0 200 200"><defs><radial-gradient style="stroke: red;"/></defs><rect style="stroke: red;"/></svg>')
		.add('baz', doctype + '<svg viewBox="0 0 200 200"><defs><linear-gradient style="fill: red;"/></defs><path style="fill: red;"/></svg>', {
			cleanDefs: []
		})
		.add('qux', doctype + '<svg viewBox="0 0 200 200"><defs><radial-gradient style="stroke: red;" fill="blue"/></defs><rect style="stroke: red;" fill="blue"/></svg>', {
			cleanDefs: ['fill']
		});

	const expected = doctype +
		'<svg xmlns="http://www.w3.org/2000/svg">' +
		'<defs><linear-gradient/><radial-gradient/><linear-gradient style="fill: red;"/><radial-gradient style="stroke: red;"/></defs>' +
		'<symbol id="foo" viewBox="0 0 100 100"><path style="fill: red;"/></symbol>' +
		'<symbol id="bar" viewBox="0 0 200 200"><rect style="stroke: red;"/></symbol>' +
		'<symbol id="baz" viewBox="0 0 200 200"><path style="fill: red;"/></symbol>' +
		'<symbol id="qux" viewBox="0 0 200 200"><rect style="stroke: red;" fill="blue"/></symbol>' +
		'</svg>';

	t.is(store.toString(), expected);
});

test('should clean objects', async t => {
	const store = svgstore({cleanObjects: true})
		.add('foo', doctype + '<svg viewBox="0 0 100 100"><defs><linear-gradient style="fill: red;"/></defs><path style="fill: red;"/></svg>')
		.add('bar', doctype + '<svg viewBox="0 0 200 200"><defs><radial-gradient style="stroke: red;"/></defs><rect style="stroke: red;"/></svg>')
		.add('baz', doctype + '<svg viewBox="0 0 200 200"><defs><linear-gradient style="fill: red;"/></defs><path style="fill: red;"/></svg>', {
			cleanObjects: []
		})
		.add('qux', doctype + '<svg viewBox="0 0 200 200"><defs><radial-gradient style="stroke: red;" fill="blue"/></defs><rect style="stroke: red;" fill="blue"/></svg>', {
			cleanObjects: ['fill']
		});

	const expected = doctype +
		'<svg xmlns="http://www.w3.org/2000/svg">' +
		'<defs><linear-gradient style="fill: red;"/><radial-gradient style="stroke: red;"/><linear-gradient style="fill: red;"/><radial-gradient style="stroke: red;" fill="blue"/></defs>' +
		'<symbol id="foo" viewBox="0 0 100 100"><path/></symbol>' +
		'<symbol id="bar" viewBox="0 0 200 200"><rect/></symbol>' +
		'<symbol id="baz" viewBox="0 0 200 200"><path style="fill: red;"/></symbol>' +
		'<symbol id="qux" viewBox="0 0 200 200"><rect style="stroke: red;"/></symbol>' +
		'</svg>';

	t.is(store.toString(), expected);
});
