/**
 * An empty Jest transform, allowing for specific files to be omitted, for example CSS files.
 */
module.exports = {
	/**
	 * Processes the file, transforming it to a readable state.
	 * @param {string} sourceText Text of the file to transform.
	 * @param {string} sourcePath Path to the file being transformed.
	 * @param {object} options Jest options, and context, of the current transformation.
	 * @returns The code, and optional map, of the transformed file.
	 */
	process: (sourceText, sourcePath, options) => {
		return { code: "" };
	},
};
