import * as z from "zod";
import type { JSONSchema } from "zod/v4/core";

import type { ConfigMethodOptions } from "./config-method-options.js";
import { methods } from "./dispatchers/config-method-dispatcher.js";

/**
 * Defines a method that can be used when automatically configuring an action.
 * @param methodConfig Configuration that defines the method.
 * @returns The method's definition.
 * @example
 * defineConfigMethod({
 * 	name: "get_user_id",
 * 	description: "Searches for a specific user by their name.",
 * 	inputSchema: z.object({
 * 		name: z.string()
 * 	}),
 * 	outputSchema: z.number(),
 * 	handler(args) {
 * 		return userService.find(args.name);
 * 	}
 * })
 */
export function defineConfigMethod<I extends z.ZodObject | undefined, O extends z.ZodType>(
	methodConfig: ConfigMethodOptions<I, O>,
): ConfigMethodDefinition {
	const { name, description, inputSchema, outputSchema } = methodConfig;

	if (methods.has(name)) {
		throw new Error(`A method with the same name has already been defined: ${name}`);
	}

	const method: ConfigMethodDefinition = {
		[__brand]: __brand,
		name,
		description,
		inputSchema: inputSchema ? z.toJSONSchema(inputSchema) : undefined,
		outputSchema: z.toJSONSchema(outputSchema),
	};

	methods.set(methodConfig.name, methodConfig as unknown as ConfigMethodOptions<z.ZodObject | undefined, z.ZodObject>);
	return method;
}

declare const __brand: unique symbol;

/**
 * Defines a method that can be used when automatically configuring an action.
 * @example
 * defineConfigMethod({
 * 	name: "get_user_id",
 * 	description: "Searches for a specific user by their name.",
 * 	inputSchema: z.object({
 * 		name: z.string()
 * 	}),
 * 	outputSchema: z.number(),
 * 	handler(args) {
 * 		return userService.find(args.name);
 * 	}
 * })
 */
export interface ConfigMethodDefinition {
	/**
	 * Name that identifies the method; must be unique amongst all methods exposed by the plugin.
	 */
	readonly name: string;

	/**
	 * Description that describes what the method does.
	 */
	readonly description: string;

	/**
	 * Brands the config method definition to ensure it has been created
	 */
	readonly [__brand]: typeof __brand;

	/**
	 Schema that represents the input arguments.
	 */
	readonly inputSchema?: JSONSchema.JSONSchema;

	/**
	 * Schema that represents the output result.
	 */
	readonly outputSchema: JSONSchema.JSONSchema;
}
