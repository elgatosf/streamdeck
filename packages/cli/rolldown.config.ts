import { defineConfig } from "rolldown";

const isWatching = !!process.env.ROLLUP_WATCH;

const banner = `#!/usr/bin/env node

/**!
 * @author Elgato
 * @module elgato/streamdeck
 * @license MIT
 * @copyright Copyright (c) Corsair Memory Inc.
 */`;

// Ignore @elgato/schema to enable auto-update.
const external = [
	"@elgato/schemas",
	"@elgato/schemas/streamdeck/plugins/",
	"@elgato/schemas/streamdeck/plugins/json",
];

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
	external,
	platform: "node",
	resolve: {
		conditionNames: ["node"],
	},
});
