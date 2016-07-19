/**
 * Helper for set construction. In future ECMAScript 2015+ syntax,
 * `Set`s can just be made directly
 * @see <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set">Set</a>
 */
function union(a, b) {
	var obj = {};

	a.forEach(function (elem) {
		obj[elem] = elem;
	});
	b.forEach(function (elem) {
		obj[elem] = elem;
	});

	return Object.keys(obj).map(function (key) {
		return obj[key];
	});
}

module.exports = union;
