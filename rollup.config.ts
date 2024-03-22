import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { dirname, join, parse, resolve } from "node:path";
import url from "node:url";
import { RollupOptions } from "rollup";

const isWatching = !!process.env.ROLLUP_WATCH;
const banner = `/**!
 * @author Elgato
 * @module elgato/streamdeck
 * @license MIT
 * @copyright Copyright (c) Corsair Memory Inc.
 */`;

/**
 * Gets the rollup configuration for the specified {@link input}.
 * @param input Partial path to the input.
 * @param output Name of the output file.
 * @returns Rollup configuration for the specified input.
 */
function config(input: string, output: string): RollupOptions {
	const outputFileWithoutExtension = join("dist", `${parse(output).name}`);

	return {
		input,
		output: {
			file: `${outputFileWithoutExtension}.js`,
			banner,
			sourcemap: isWatching,
			sourcemapPathTransform: (relativeSourcePath: string, sourcemapPath: string): string => {
				return url.pathToFileURL(resolve(dirname(sourcemapPath), relativeSourcePath)).href;
			}
		},
		external: ["ws", "@elgato/schemas/streamdeck/plugins"],
		plugins: [
			typescript({
				tsconfig: join(dirname(input), "tsconfig.json"),
				mapRoot: isWatching ? "./" : undefined
			}),
			nodeResolve()
		]
	};
}

export default [config("src/plugin/index.ts", "index.js"), config("src/ui/index.ts", "browser.js")];
