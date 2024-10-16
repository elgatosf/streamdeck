/**
 * An empty Jest transform, allowing for specific files to be omitted, for example CSS files.
 */
module.exports = {
	/**
	 * Processes the file, transforming it to a readable state... of no code.
	 * @returns An empty set of code, without a map, that mimics a transformed file.
	 */
	process: () => {
		return { code: "" };
	},
};
