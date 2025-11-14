import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		exclude: [
			"node_modules/",
			// Temporary exclude tests causing a freeze
			"src/plugin/__tests__/ui.test.ts",
			"src/plugin/actions/__tests__/service.test.ts",
		],
		clearMocks: true,
		environment: "node",
		setupFiles: [
			"./tests/__setup__/global.ts",
			"./tests/__setup__/ws.ts",
		],
	},
});
