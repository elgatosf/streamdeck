import { type JSONSchema7 } from "json-schema";

/**
 * Versions the manifest JSON schema.
 * @param schema Schema source.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function versionManifests(schema: any): void {
	const { Manifest: manifest } = schema.definitions;

	// When there is only a single structure, our job here is done.
	if (manifest.anyOf === undefined) {
		return;
	}

	// Verify there are no properties already defined on the main definition.
	if (manifest.properties) {
		throw new TypeError("Cannot version Manifest, the root definition contains properties");
	}

	// Keep track of the supported versions, and set the `allOf` value to default.
	const versions = new Set<string>();
	manifest.allOf = [];

	// Iterate over the manifest version references.
	for (const manifestVersionDefinition of manifest.anyOf) {
		// Get the minimum versions the manifest version supports.
		const {
			properties: {
				Software: {
					properties: { MinimumVersion }
				}
			}
		} = manifestVersionDefinition;

		// Add each of the conditional statements for the versions.
		for (const version of MinimumVersion.enum || [MinimumVersion.const]) {
			if (versions.has(version)) {
				throw new Error(`Duplicate version found: ${version}`);
			}

			versions.add(version);
			schema.definitions.Manifest.allOf.push({
				if: getMinimumVersionSchema(version),
				then: manifestVersionDefinition
			});
		}
	}

	// We've replace the anyOf, so remove it; finally set type for all versions.
	delete schema.definitions.Manifest.anyOf;
	schema.definitions.Manifest = {
		...manifest,
		...getMinimumVersionSchema(versions)
	};
}

/**
 * Gets a JSON schema that represents an object of structure `Software.MinimumVersion`.
 * @param version Version, or versions, that the `Software.MinimumVersion` can be.
 * @returns The JSON schema.
 */
function getMinimumVersionSchema(version: Set<string> | string): JSONSchema7 {
	return {
		type: "object",
		properties: {
			Software: {
				type: "object",
				description: "Determines the Stream Deck software requirements for this plugin.",
				properties: {
					MinimumVersion: {
						type: "string",
						description: "Minimum version of the Stream Deck application required for this plugin to run.",
						const: version instanceof Set ? undefined : version,
						enum: version instanceof Set ? Array.from(version) : undefined
					}
				},
				required: ["MinimumVersion"]
			}
		},
		required: ["Software"]
	};
}
