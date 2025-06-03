function safeCleanDefsAttrs(attrs) {
	if (attrs === true) {
		// Default to removing 'style' only outside of defs, but skip inside defs
		return [];
	}
	if (!Array.isArray(attrs)) return [];
	// Exclude 'style' to preserve gradient stops and fills
	return attrs.filter((attr) => attr !== 'style' && attr !== 'id');
}

module.exports = safeCleanDefsAttrs;
