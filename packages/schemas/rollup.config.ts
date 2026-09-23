import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { dirname, join, parse } from "node:path";
import { RollupOptions } from "rollup";
import dts from "rollup-plugin-dts";

const banner = `/**!
 * @author Elgato
 * @module elgato/streamdeck
 * @license MIT
 * @copyright Copyright (c) Corsair Memory Inc.
 */`;

/**
 * Gets the configuration based an input within the `src/` folder.
 * @param input Partial path to the input.
 * @returns Rollup configuration for the specified input.
 */
function getConfig(input: string): RollupOptions[] {
	const outputDir = join("dist", dirname(input));
	input = join("src", input);
	const pathWithoutExtension = join(outputDir, `${parse(input).name}`);

	return [
		{
			input,
			output: [
				{
					file: `${pathWithoutExtension}.cjs`,
					format: "cjs",
					banner
				},
				{
					file: `${pathWithoutExtension}.mjs`,
					format: "es",
					banner
				}
			],
			plugins: [
				typescript({
					exclude: ["scripts/**/*.ts"]
				}),
				nodeResolve(),
				json()
			]
		},
		{
			input,
			output: [
				{
					file: `${pathWithoutExtension}.d.ts`,
					banner
				}
			],
			plugins: [json(), dts()]
		}
	];
}

export default [...getConfig("index.ts"), ...getConfig("streamdeck/plugins/index.ts"), ...getConfig("streamdeck/plugins/json.ts")] satisfies RollupOptions[];
