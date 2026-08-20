import { type SchemaObject } from "ajv";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parse, SemVer } from "semver";

import { getFileStoreDir } from "../config";

/**
 * A store for loading versioned JSON schemas from remote sources, and a local cache.
 */
export const schemaStore = {
	/**
	 * Gets a JSON schema from either the local cache, remote source, or the bundled schema, based on
	 * availability and the version of the schema, as defined within the id.
	 *
	 * When the schema is downloaded from the remote source, and newer, the local cache is updated.
	 * @param opts Options that define how the schema will be loaded.
	 * @returns The JSON schema.
	 */
	get: async (opts: GetOptions): Promise<SchemaObject> => {
		// Fallback to the default.
		let curr: VersionedSchemaObject = {
			schema: opts._default,
			version: parseVersion(opts._default),
		};

		// Check if we have a newer cached one.
		const cached = await getCache(opts.path);
		if (cached?.version?.compare?.(curr.version) === 1) {
			curr = cached;
		}

		// When we can, check if there is a newer remote one that can be cached and returned.
		if (opts.updateCheck) {
			const remote = await getRemote(opts.path);
			if (remote?.version?.compare?.(curr.version) === 1) {
				curr = remote;
				await setCache(opts.path, remote.schema);
			}
		}

		return curr.schema;
	},
};

/**
 * Gets the JSON schema from the local cache.
 * @param path Relative path to the schema.
 * @returns The JSON schema; otherwise undefined it not cached.
 */
async function getCache(path: string): Promise<VersionedSchemaObject | undefined> {
	// Check if we have a local file.
	const filePath = getCachePath(path);
	if (!existsSync(filePath)) {
		return;
	}

	try {
		// Parse the schema, and its version
		const contents = await readFile(filePath, { encoding: "utf8" });
		const schema = JSON.parse(contents) as SchemaObject;

		return {
			schema,
			version: parseVersion(schema),
		};
	} catch (e) {
		console.warn(`Failed to load local schema from ${filePath}`);
		if (process.env.ELGATO_CLI_DEBUG) {
			console.log(e);
		}
	}
}

/**
 * Persists the JSON schema to the local cache
 * @param path Relative path to the schema.
 * @param schema The JSON schema to cache.
 */
async function setCache(path: string, schema: SchemaObject): Promise<void> {
	const filePath = getCachePath(path);
	if (!existsSync(filePath)) {
		await mkdir(dirname(filePath), { recursive: true });
	}

	try {
		// Store the schema to the cache
		await writeFile(filePath, JSON.stringify(schema), {
			encoding: "utf8",
		});
	} catch (e) {
		if (process.env.ELGATO_CLI_DEBUG) {
			console.log(e);
		}
	}
}

/**
 * Gets the file path of a cached schema.
 * @param path Relative path to the schema.
 * @returns The cache file path.
 */
function getCachePath(path: string): string {
	return join(getFileStoreDir(), "schemas", path);
}

/**
 * Gets the JSON schema from the remote path, relative to https://schemas.elgato.com/.
 * @param path Relative path to the schema.
 * @returns The JSON schema; otherwise undefined if it could not be loaded.
 */
async function getRemote(path: string): Promise<VersionedSchemaObject | undefined> {
	const url = new URL(path, "https://schemas.elgato.com");

	try {
		// Fetch the remote schema.
		const res = await fetch(url);
		if (!res.ok) {
			throw res;
		}

		// Parse the contents, and the version.
		const schema = (await res.json()) as SchemaObject;
		return {
			schema,
			version: parseVersion(schema),
		};
	} catch (e) {
		console.warn(`Failed to load remote schema from ${url}`);
		if (process.env.ELGATO_CLI_DEBUG) {
			console.log(e);
		}
	}
}

/**
 * Parses the version of the JSON schema from the id.
 * @param schema The schema.
 * @returns The version.
 */
function parseVersion(schema: SchemaObject): SemVer {
	// We parse the version from the id.
	const id = schema.$id ?? schema.id;
	if (id === undefined) {
		throw new Error('Schema must define an "$id" or "id".');
	}

	// Ids must be package references, e.g. @elgato/schemas/streamdeck/plugins/manifest@0.4.14
	const verString = id.split("@").at(-1);
	const version = parse(verString);

	if (version === null) {
		throw new Error(`Failed to parse version from schema id: ${id}`);
	}

	return version;
}

/**
 * Extended information about a schema object that represents a JSON schema.
 */
interface VersionedSchemaObject {
	/**
	 * The version of the schema.
	 */
	readonly version: SemVer;

	/**
	 * The JSON schema.
	 */
	readonly schema: SchemaObject;
}

/**
 * Options that determine how to load the schema.
 */
interface GetOptions {
	/**
	 * The default JSON schema.
	 */
	readonly _default: SchemaObject;

	/**
	 * Path to the JSON schema, relative to https://schemas.elgato.com/.
	 */
	readonly path: string;

	/**
	 * Determines whether an update check should occur.
	 */
	readonly updateCheck: boolean;
}
