import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		clearMocks: true,
		environment: "node",
		include: [
			"src/api/**/__tests__/*.test.ts",
			"src/common/__tests__/disposable.test.ts",
			//"src/common/__tests__/enumerable.test.ts",
			"src/common/__tests__/event-emitter.test.ts",
			"src/common/__tests__/i18n.test.ts",
			"src/common/__tests__/lazy.test.ts",
			"src/common/__tests__/promises.test.ts",
			"src/common/__tests__/utils.test.ts",
			"src/common/events/**/__tests__/*.test.ts",
			"src/common/logging/**/__tests__/*.test.ts",
			"src/plugin/**/__tests__/*.test.ts",
		],
		setupFiles: [
			"./tests/__setup__/global.ts",
			"./tests/__setup__/ws.ts",
		],
	},
});
