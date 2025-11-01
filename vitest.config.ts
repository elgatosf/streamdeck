import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		clearMocks: true,
		environment: "node",
		include: [
			"src/plugin/__tests__/connection.test.ts",
			"src/plugin/__tests__/i18n.test.ts",
			"src/plugin/__tests__/index.test.ts",
			"src/plugin/__tests__/manifest.test.ts",
			"src/plugin/__tests__/profiles.test.ts",
			"src/plugin/__tests__/settings.test.ts",
			"src/plugin/__tests__/system.test.ts",
			"src/plugin/__tests__/ui.test.ts",
			"src/plugin/__tests__/validation.test.ts",
			"src/plugin/actions/__tests__/*",
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
