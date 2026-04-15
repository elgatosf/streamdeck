import Ajv, { type ErrorObject } from "ajv";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { keywordDefinitions } from "../src/index";
import type { Manifest } from "../src/streamdeck/plugins";

/**
 * Validates the specified manifest file; when the version is specified the `Software.MinimumVersion` is updated.
 * @param filename Name of the manifest file.
 * @param modify Optional modifier to be applied to the manifest before validation.
 * @returns Collection of errors as the result of validation.
 */
export function validateStreamDeckPluginManifest(
	filename: string,
	modify?: (manifest: Manifest) => void,
): ErrorObject<string, Record<string, unknown>, unknown>[] {
	const schema = JSON.parse(getFileContents("../dist/streamdeck/plugins/manifest.json"));
	const validate = new Ajv({ allErrors: true, strictTypes: false })
		.addKeyword(keywordDefinitions.errorMessage)
		.addKeyword(keywordDefinitions.filePath)
		.addKeyword(keywordDefinitions.imageDimensions)
		.addKeyword(keywordDefinitions.markdownDescription)
		.compile(schema);

	const manifest = JSON.parse(getFileContents(join(`../src/streamdeck/plugins/manifest/__tests__/files/${filename}`)));
	if (modify) {
		modify(manifest);
	}

	validate(manifest);
	return validate.errors ?? [];
}

/**
 * Gets the file contents from the specified path relative to the tests folder.
 * @param relativePath Path to the file, relative to the tests folder.
 * @returns The file contents.
 */
function getFileContents(relativePath: string): string {
	const path = resolve(__dirname, relativePath);
	if (!existsSync(path)) {
		console.log(path);
		throw new Error(`File not found: ${path}`);
	}

	return readFileSync(path, { encoding: "utf-8" });
}
