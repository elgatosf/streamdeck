import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { dirname, join, parse, resolve } from "node:path";
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

/**
 * Gets the rollup configuration for the specified {@link input}.
 * @param input Partial path to the input.
 * @param output Name of the output file.
 * @returns Rollup configuration for the specified input.
 */
function getOptions(input: string, output: string): RollupOptions[] {
	const outputFileWithoutExtension = join("dist", `${parse(output).name}`);

	return [
		/**
		 * Main build.
		 */
		{
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
		},
		/**
		 * TypeScript declarations.
		 */
		{
			input,
			output: {
				file: `${outputFileWithoutExtension}.d.ts`
			},
			external: ["@elgato/schemas/streamdeck/plugins"],
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
}

export default [...getOptions("src/plugin/index.ts", "index.js"), ...getOptions("src/ui/index.ts", "ui.js")];
