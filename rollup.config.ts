import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import path from "node:path";
import url from "node:url";
import { RollupOptions } from "rollup";
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
		input: "src/index.ts",
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
		input: "src/index.ts",
		output: {
			file: "dist/index.d.ts"
		},
		plugins: [dts()]
	}
];

export default config;
