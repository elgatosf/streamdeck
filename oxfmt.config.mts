import config from "@elgato/oxfmt-config";

export default {
	...config,
	ignorePatterns: [
		// Documentation Markdown is generated and linted by `docs:check`; formatting would alter inlined snippets.
		"packages/plugin/docs/**/*.md",
	],
};
