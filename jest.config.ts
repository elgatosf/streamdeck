import type { Config } from "@jest/types";

/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
const config: Config.InitialOptions = {
	collectCoverageFrom: ["src/**/*.ts", "!<rootDir>/node_modules/"],
	coverageReporters: ["json-summary", "text"],
	maxWorkers: 1,
	verbose: true
};

// eslint-disable-next-line import/no-default-export
export default config;
