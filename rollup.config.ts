import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import path from "node:path";
import url from "node:url";
import { RollupOptions } from "rollup";
import dts from "rollup-plugin-dts";

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
			sourcemap: true,
			sourcemapPathTransform: (relativeSourcePath: string, sourcemapPath: string): string => {
				return url.pathToFileURL(path.resolve(path.dirname(sourcemapPath), relativeSourcePath)).href;
			}
		},
		plugins: [
			typescript({
				tsconfig: "tsconfig.build.json"
			}),
			nodeResolve(),
			commonjs({
				exclude: ["ws"]
			}),
			terser()
		]
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
