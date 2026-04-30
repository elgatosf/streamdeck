import type { JSONSchema } from "zod/v4/core";

/**
 * Metadata that defines a method exposed by the plugin.
 */
export interface MethodMetadata {
	/**
	 * Name that identifies the method.
	 */
	readonly name: string;

	/**
	 * Description that describes what the method does.
	 */
	readonly description: string;

	/**
	 * Schema that represents the input arguments.
	 */
	readonly inputSchema?: JSONSchema.JSONSchema;

	/**
	 * Schema that represents the output result.
	 */
	readonly outputSchema: JSONSchema.JSONSchema;
}
