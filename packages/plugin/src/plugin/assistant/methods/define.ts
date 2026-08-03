import * as z from "zod";

import { type AssistantMethodInfo, createMethodInfo } from "./method-info.js";
import type { AssistantMethodOptions } from "./options.js";
import { methodRegistry } from "./registry.js";

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
): AssistantMethodInfo {
	const { name, description, inputSchema, outputSchema } = methodConfig;

	if (methodRegistry.has(name)) {
		throw new Error(`A method with the same name has already been defined: ${name}`);
	}

	// Created a branded instance of the method information.
	const method: AssistantMethodInfo = createMethodInfo({
		name,
		description,
		inputSchema: inputSchema ? z.toJSONSchema(inputSchema) : undefined,
		outputSchema: z.toJSONSchema(outputSchema),
	});

	// Register the method.
	methodRegistry.set(
		methodConfig.name,
		methodConfig as unknown as AssistantMethodOptions<z.ZodObject | undefined, z.ZodObject>,
	);

	return method;
}
