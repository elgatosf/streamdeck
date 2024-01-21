import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import path from "node:path";
import url from "node:url";
import { NormalizedOutputOptions, OutputBundle, RollupOptions } from "rollup";
import dts from "rollup-plugin-dts";

const isWatching = !!process.env.ROLLUP_WATCH;
const banner = `/**!
 * @author Elgato
 * @module elgato/streamdeck
 * @license MIT
 * @copyright Copyright (c) Corsair Memory Inc.
 */`;

const config: RollupOptions[] = [
	{
		input: "src/plugin/index.ts",
		output: {
			file: "dist/index.js",
			banner,
			sourcemap: isWatching,
			sourcemapPathTransform: (relativeSourcePath: string, sourcemapPath: string): string => {
				return url.pathToFileURL(path.resolve(path.dirname(sourcemapPath), relativeSourcePath)).href;
			}
		},
		plugins: [
			typescript({
				tsconfig: "tsconfig.build.json",
				mapRoot: isWatching ? "./" : undefined
			}),
			nodeResolve()
		],
		external: ["ws"]
	},
	{
		input: "src/plugin/index.ts",
		output: {
			file: "dist/index.d.ts"
		},
		plugins: [
			dts(),
			{
				name: "NameChecker",
				generateBundle: function (options: NormalizedOutputOptions, bundle: OutputBundle): void {
					// Search each file for variable names that resemble possible duplicates, e.g. ActionEvent$1, Event$1.
					const warnings = new Set(
						Object.values(bundle).reduce<string[]>((names, file) => ("code" in file ? [...names, ...(file.code.match(/[A-Za-z0-9\-_]+?\$\d/gm) || [])] : names), [])
					);

					// And warn for each possible duplicate.
					if (warnings.size) {
						warnings.forEach((value) => this.warn(`Type was renamed "${value}"`));
					}
				}
			}
		]
	}
];

export default config;
