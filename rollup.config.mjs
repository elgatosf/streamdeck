import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { dirname, join, parse, resolve } from "node:path";
import url from "node:url";

const isWatching = !!process.env.ROLLUP_WATCH;
const banner = `/**!
 * @author Elgato
 * @module elgato/streamdeck
 * @license MIT
 * @copyright Copyright (c) Corsair Memory Inc.
 */`;

/**
 * Defines a rollup configuration for the specified input and output.
 * @param {string} input Path to the input TypeScript file, with "src/" omitted.
 * @param {string} output Path to the desired output JavaScript file, with "dist/" omitted.
 * @returns Rollup configuration.
 */
function defineConfig(input, output) {
	return {
		input: join("src", input),
		output: {
			banner,
			file: join("dist", output),
			sourcemap: isWatching,
			sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
				return url.pathToFileURL(resolve(dirname(sourcemapPath), relativeSourcePath)).href;
			},
		},
		external: ["ws", "@elgato/schemas/streamdeck/plugins"],
		plugins: [
			typescript({
				tsconfig: "tsconfig.build.json",
				mapRoot: isWatching ? "./" : undefined,
			}),
			nodeResolve(),
			{
				name: "emit-dts",
				generateBundle() {
					const types = `"../types/${dirname(input)}"`;
					this.emitFile({
						fileName: `${parse(output).name}.d.ts`,
						type: "asset",
						source: `${banner}
import streamDeck from ${types};

export * from ${types};
export default streamDeck;
`,
					});
				},
			},
		],
	};
}

/**
 * Rollup configuration.
 */
export default [defineConfig("plugin/index.ts", "index.js")];
