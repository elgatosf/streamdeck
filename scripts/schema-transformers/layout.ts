import type { JSONSchema7, JSONSchema7Definition } from "json-schema";

/**
 * Transforms the specified {@link schema} so that the layout's `items` property provides a better structure for validation.
 * @param schema Schema to transform.
 */
export function layoutTransformer(schema: JSONSchema7): void {
	schema.definitions ??= {};

	validateSchema(schema.definitions.Layout);
	validateSchema(schema.definitions.Layout.properties?.items);
	const itemsProp = schema.definitions.Layout.properties.items;

	validateSchema(itemsProp.items);

	// Get the layout item types, and assign them to the top-level definitions object.
	const types = getTypes(itemsProp.items);
	for (const { type, definition } of types) {
		schema.definitions[type] = definition;
	}

	// Then replace the previous items schema with an if-then-else structure for better validation.
	itemsProp.items = {
		anyOf: [generateRecursiveLayoutTypeSchema(types.map(({ type }) => type))]
	};
}

/**
 * Parses the layout item types from the layout's JSON schema. NB. This is referencing the `/Layout/properties/items/items` value, whereby the first `items` is the property on the
 * layout, and the second `items` is the JSON schema that defines the valid items... items on items.
 * @param items JSON schema `items` value, of the layout's `items` property.
 * @returns Layout item definitions.
 */
function getTypes(items: JSONSchema7): LayoutItemDefinition[] {
	if (items.anyOf === undefined) {
		throw new Error("Unexpected items schema, expected 'anyOf'");
	}

	return items.anyOf.map((definition: JSONSchema7Definition) => {
		validateSchema(definition);

		if (definition.properties?.type === undefined || typeof definition.properties.type === "boolean") {
			throw new TypeError("Layout item does not contain a 'type' identifier");
		}

		const {
			properties: {
				type: { const: type }
			}
		} = definition;

		if (type === undefined || typeof type !== "string") {
			throw new TypeError("Layout item has a type that is not a string");
		}

		return {
			type,
			definition
		};
	});
}

/**
 * Recursively generates an if-then-else statement from the available layout item types. This is later assigned to the layout's `items` property to provide better validation.
 * @param types Layout item types.
 * @param index Current index.
 * @returns The JSON schema that references the current type definition; otherwise the next.
 */
function generateRecursiveLayoutTypeSchema(types: string[], index: number = 0): JSONSchema7 {
	const fallback: JSONSchema7 = {
		type: "object",
		additionalProperties: false,
		properties: {
			type: {
				type: "string",
				enum: types
			}
		}
	};

	return {
		if: {
			properties: {
				type: {
					const: types[index],
					enum: types
				}
			}
		},
		then: {
			$ref: `#/definitions/${types[index]}`
		},
		else: index < types.length - 1 ? generateRecursiveLayoutTypeSchema(types, index + 1) : fallback
	};
}

/**
 * Validates the {@link schema} is a {@link JSONSchema7}.
 * @param schema The schema to validate.
 */
function validateSchema(schema: JSONSchema7Definition | JSONSchema7Definition[] | undefined): asserts schema is JSONSchema7 {
	if (schema === undefined) {
		throw new TypeError("Schema is undefined");
	}

	if (typeof schema === "boolean") {
		throw new TypeError("Schema is boolean, expected schema");
	}
}

/**
 * Layout item JSON schema definition.
 */
type LayoutItemDefinition = {
	/**
	 * Type of the layout item, parsed from the layout type.
	 */
	type: string;

	/**
	 * JSON schema that represents the layout item structure.
	 */
	definition: JSONSchema7;
};
