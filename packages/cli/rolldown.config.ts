import { defineConfig } from "rolldown";

const isWatching = !!process.env.WIREIT_WATCH;

const banner = `#!/usr/bin/env node

/**!
 * @author Elgato
 * @module elgato/cli
 * @license MIT
 * @copyright Copyright (c) Corsair Memory Inc.
 */`;

/**
 * CLI bundling.
 */
export default defineConfig({
	input: "src/cli.ts",
	output: {
		banner,
		file: "bin/streamdeck.mjs",
		sourcemap: isWatching,
		minify: !isWatching,
	},
	platform: "node",
	resolve: {
		conditionNames: ["node"],
	},
});
