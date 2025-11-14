import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		clearMocks: true,
		environment: "node",
		setupFiles: [
			"./tests/__setup__/global.ts",
			"./tests/__setup__/ws.ts",
		],
	},
});
