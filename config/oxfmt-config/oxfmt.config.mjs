import { defineConfig } from "oxfmt";

export default defineConfig({
	/**
	 * Main formatting
	 */
	endOfLine: "lf",
	printWidth: 120,
	semi: true,
	singleQuote: false,
	trailingComma: "all",
	useTabs: true,
	ignorePatterns: ["**/CHANGELOG.md"],

	/**
	 * Import sorting
	 */
	sortImports: {
		newlinesBetween: true,
	},

	/**
	 * Overrides
	 */
	overrides: [
		{
			files: ["*.jsonc"],
			options: {
				trailingComma: "none",
			},
		},
		{
			files: ["*.json", "*.jsonc", "*.md"],
			options: {
				tabWidth: 4,
				useTabs: false,
			},
		},
		{
			files: ["*.yaml", "*.yml"],
			options: {
				tabWidth: 2,
				useTabs: false,
			},
		},
	],
});
