import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		clearMocks: true,
		environment: "node",
		include: [
			"src/api/**/__tests__/*.test.ts",
			"src/plugin/**/__tests__/*.test.ts",
		],
		setupFiles: [
			"./tests/__setup__/global.ts",
			"./tests/__setup__/ws.ts",
		],
	},
});
