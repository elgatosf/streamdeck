import { defineConfig } from "tsup";

const banner = {
	js: `/**!
 * @author Elgato
 * @module elgato/streamdeck
 * @license MIT
 * @copyright Copyright (c) Corsair Memory Inc.
 */`,
};

/**
 * Package exports.
 */
export default defineConfig([
	{
		entry: {
			index: "src/index.ts",
		},
		outDir: "dist",
		format: ["esm"],
		banner,
		clean: true,
		dts: true,
	},
]);
