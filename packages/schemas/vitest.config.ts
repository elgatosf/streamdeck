import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		setupFiles: ["./tests/setup.ts"],
	},
	resolve: {
		alias: {
			"@tests": path.resolve(__dirname, "./tests/validate"),
		},
	},
});
