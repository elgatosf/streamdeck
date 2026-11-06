import config from "@elgato/oxfmt-config";
import { defineConfig } from "oxfmt";

const { ignorePatterns = [] } = config;

export default defineConfig({
	...config,
	ignorePatterns: [
		...ignorePatterns,

		// Ignore test fixtures as they intentionally have unexpected formats
		"packages/markdown/src/type-check/__tests__/fixtures/",
	],
});
