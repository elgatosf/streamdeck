/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
const config = {
	clearMocks: true,
	collectCoverageFrom: ["src/**/*.ts", "!<rootDir>/node_modules/"],
	coverageReporters: ["json-summary", "text"],
	globalSetup: "./tests/__setup__/global.ts",
	maxWorkers: 1,
	modulePathIgnorePatterns: ["<rootDir>/src/.+/__mocks__/.*"],
	verbose: true,
	roots: ["src"],
	transform: {
		"^.+\\.ts$": [
			"@swc/jest",
			{
				jsc: {
					parser: {
						syntax: "typescript",
						decorators: true,
					},
					transform: {
						// Stage 3 decorators (https://swc.rs/docs/configuration/compilation#jsctransformdecoratorversion)
						decoratorVersion: "2022-03",
					},
				},
			},
		],
	},
};

export default config;
