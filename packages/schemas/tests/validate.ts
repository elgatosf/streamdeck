import Ajv, { type ErrorObject } from "ajv";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { keywordDefinitions } from "../src/index";
import type { Manifest } from "../src/streamdeck/plugins/";
import type { Layout } from "../src/streamdeck/plugins/schemas";

/**
 * Validates the specified manifest file.
 * @param filename Name of the manifest file.
 * @param modify Optional modifier to be applied before validation.
 * @returns Collection of errors as the result of validation.
 */
export function validateStreamDeckPluginManifest(filename: string, modify?: (manifest: Manifest) => void): ErrorObject<string, Record<string, unknown>, unknown>[] {
	return validate(`../src/streamdeck/plugins/manifest/__tests__/files/${filename}`, "../streamdeck/plugins/manifest.json", modify);
}

/**
 * Validates the specified layout file.
 * @param filename Name of the layout file.
 * @param modify Optional modifier to be applied before validation.
 * @returns Collection of errors as the result of validation.
 */
export function validateStreamDeckPluginLayout(filename: string, modify?: (layout: Layout) => void): ErrorObject<string, Record<string, unknown>, unknown>[] {
	return validate(`../src/streamdeck/plugins/layout/__tests__/files/${filename}`, "../streamdeck/plugins/layout.json", modify);
}

/**
 * Validates the specified content against the schema, after applying optional modifications.
 * @param path Path to the file that contains the contents to validate
 * @param schemaPath Path to the schema.
 * @param modify Optional modifier to be applied before validation.
 * @returns Collection of errors as the result of validation.
 */
function validate<T>(path: string, schemaPath: string, modify?: (value: T) => void): ErrorObject<string, Record<string, unknown>, unknown>[] {
	const schema = JSON.parse(getFileContents(schemaPath));
	const validate = new Ajv({ allErrors: true, strictTypes: false })
		.addKeyword(keywordDefinitions.errorMessage)
		.addKeyword(keywordDefinitions.filePath)
		.addKeyword(keywordDefinitions.imageDimensions)
		.addKeyword(keywordDefinitions.markdownDescription)
		.compile(schema);

	const contents = JSON.parse(getFileContents(path));
	if (modify) {
		modify(contents);
	}

	validate(contents);
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
