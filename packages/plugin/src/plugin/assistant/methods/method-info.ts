import type { JSONSchema } from "zod/v4/core";

const __brand = Symbol();

/**
 * Creates a branded instance of method information.
 * @param info The information.
 * @returns Branded instance.
 */
export function createMethodInfo(info: Omit<AssistantMethodInfo, "__brand">): AssistantMethodInfo {
	return { ...info, __brand };
}

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
export interface AssistantMethodInfo {
	/**
	 * Brands the config method definition to ensure it has been created
	 */
	readonly __brand: typeof __brand;

	/**
	 * Name that identifies the method; must be unique amongst all methods exposed by the plugin.
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
