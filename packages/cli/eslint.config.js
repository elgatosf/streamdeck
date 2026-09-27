import { config } from "@elgato/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		ignores: [
			".wireit/",
		],
	},
	config.strict,
]);
