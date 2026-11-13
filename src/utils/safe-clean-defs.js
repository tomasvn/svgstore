function safeCleanDefsAttrs(attrs) {
	if (attrs === true) {
		return ['style'];
	}
	if (!Array.isArray(attrs)) return [];
	// Exclude 'style' to preserve gradient stops and fills
	return attrs.filter((attr) => attr !== 'style' && attr !== 'id');
}

module.exports = safeCleanDefsAttrs;
