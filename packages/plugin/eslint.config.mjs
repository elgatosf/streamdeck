import { config } from "@elgato/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		// Documentation snippets are intentionally minimal examples, and are type checked by `docs:check` instead.
		ignores: ["docs/"],
	},
	config.strict,
]);
