const config = ({
	compilerOptions: { paths }
} = require("./tsconfig.json"));

/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
module.exports = {
	clearMocks: true,
	maxWorkers: 1,
	modulePathIgnorePatterns: ["<rootDir>/src/.+/__mocks__/.*"],
	verbose: true,
	roots: ["src"],
	setupFilesAfterEnv: ["./tests/setup.ts"],
	transform: {
		"^.+\\.ts$": [
			"@swc/jest",
			{
				jsc: {
					parser: {
						syntax: "typescript",
						decorators: true
					},
					baseUrl: "./",
					paths
				}
			}
		]
	}
};
