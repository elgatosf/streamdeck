import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		clearMocks: true,
		environment: "node",
		include: [
			"src/plugin/__tests__/connection.test.ts",
			"src/plugin/actions/__tests__/action.test.ts",
			"src/plugin/actions/__tests__/decorators.test.ts",
			"src/plugin/actions/__tests__/dial.test.ts",
			"src/plugin/actions/__tests__/key.test.ts",
			"src/plugin/common/__tests__/*",
			"src/plugin/devices/__tests__/*",
			"src/plugin/events/__tests__/*",
			"src/plugin/logging/__tests__/*",
		],
		setupFiles: [
			"./tests/__setup__/global.ts",
			"./tests/__setup__/ws.ts",
		],
	},
});
