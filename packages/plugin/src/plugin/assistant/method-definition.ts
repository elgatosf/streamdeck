import * as z from "zod";
import type { JSONSchema } from "zod/v4/core";

import { methods } from "./dispatchers/method-dispatcher.js";
import type { AssistantMethodOptions } from "./method-options.js";

/**
 * Defines a method that can be used when automatically configuring an action.
 * @param methodConfig Configuration that defines the method.
 * @returns The method's definition.
 * @example
 * defineAssistantMethod({
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
export function defineAssistantMethod<I extends z.ZodObject | undefined, O extends z.ZodType>(
	methodConfig: AssistantMethodOptions<I, O>,
): AssistantMethodDefinition {
	const { name, description, inputSchema, outputSchema } = methodConfig;

	if (methods.has(name)) {
		throw new Error(`A method with the same name has already been defined: ${name}`);
	}

	const method: AssistantMethodDefinition = {
		[__brand]: __brand,
		name,
		description,
		inputSchema: inputSchema ? z.toJSONSchema(inputSchema) : undefined,
		outputSchema: z.toJSONSchema(outputSchema),
	};

	methods.set(
		methodConfig.name,
		methodConfig as unknown as AssistantMethodOptions<z.ZodObject | undefined, z.ZodObject>,
	);
	return method;
}

declare const __brand: unique symbol;

/**
 * Defines a method that can be used when automatically configuring an action.
 * @example
 * defineAssistantMethod({
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
export interface AssistantMethodDefinition {
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
