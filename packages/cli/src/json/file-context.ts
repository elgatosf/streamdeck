import { existsSync, readFileSync } from "node:fs";

import { type JsonObject, JsonObjectMap } from "./map";
import type { JsonSchema, JsonSchemaError } from "./schema";

/**
 * Provides information for a JSON file validated against a JSON schema, including the data mapped to an object.
 */
export class JsonFileContext<T extends object> {
	/**
	 * Collection of JSON schema validation errors.
	 */
	public readonly errors: ReadonlyArray<JsonSchemaError> = [];

	/**
	 * Map of the parsed JSON data.
	 */
	private readonly _map = new JsonObjectMap<T>();

	/**
	 * Initializes a new instance of the {@link JsonFileContext} class.
	 * @param path Path to the file, as defined within the plugin; the file may or may not exist.
	 * @param schema JSON schema to use when validating the file.
	 */
	constructor(
		public readonly path: string,
		public readonly schema: JsonSchema<T>,
	) {
		if (existsSync(this.path)) {
			const json = readFileSync(this.path, { encoding: "utf-8" }).replace(/^[\uFEFF]+/, "");
			({ errors: this.errors, map: this._map } = this.schema.validate(json));
		}
	}

	/**
	 * Parsed data with all valid value types set, including the location of which the value was parsed within the JSON.
	 * @returns Parsed data.
	 */
	public get value(): JsonObject<T> {
		return this._map.value;
	}

	/**
	 * Finds the node reference for the specified {@link instancePath}.
	 * @param instancePath Instance path.
	 * @returns The node associated with the {@link instancePath}.
	 */
	public find(instancePath: string): ReturnType<JsonObjectMap<T>["find"]> {
		return this._map.find(instancePath);
	}
}
