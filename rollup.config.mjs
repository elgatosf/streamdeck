import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { dirname, resolve } from "node:path";
import url from "node:url";

const isWatching = !!process.env.ROLLUP_WATCH;
const external = ["ws", "@elgato/schemas/streamdeck/plugins"];

const output = {
	banner: `/**!
 * @author Elgato
 * @module elgato/streamdeck
 * @license MIT
 * @copyright Copyright (c) Corsair Memory Inc.
 */`,
	sourcemap: isWatching,
	sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
		return url.pathToFileURL(resolve(dirname(sourcemapPath), relativeSourcePath)).href;
	},
};

/**
 * Generates a wrapped DTS file.
 * @param {string} index File path to the index.d.ts file.
 * @returns The wrapped DTS file.
 */
function dts(index) {
	return `import streamDeck from "${index}";

export * from "${index}";
export default streamDeck;`;
}

/**
 * Rollup configuration.
 */
export default [
	/**
	 * Main build.
	 */
	{
		input: "src/plugin/index.ts",
		output: {
			...output,
			file: `dist/index.js`,
		},
		external,
		plugins: [
			typescript({
				tsconfig: "src/plugin/tsconfig.build.json",
				mapRoot: isWatching ? "./" : undefined,
			}),
			nodeResolve(),
			{
				name: "emit-dts",
				generateBundle() {
					this.emitFile({
						fileName: "index.d.ts",
						source: dts("../types/plugin"),
						type: "asset",
					});
				},
			},
		],
	},

	/**
	 * Browser build.
	 */
	{
		input: "src/ui/index.ts",
		output: {
			...output,
			file: `dist/browser.js`,
		},
		external,
		plugins: [
			typescript({
				tsconfig: "src/ui/tsconfig.build.json",
				mapRoot: isWatching ? "./" : undefined,
			}),
			nodeResolve(),
			{
				name: "emit-dts",
				generateBundle() {
					this.emitFile({
						fileName: "browser.d.ts",
						source: dts("../types/ui"),
						type: "asset",
					});
				},
			},
		],
	},
];
