import type { JsonObject, JsonPrimitive } from "@elgato/utils";
import z from "zod";

/**
 * Defines a method that can be used when automatically configuring an action.
 */
export interface AssistantMethodOptions<I extends AssistantMethodInput, O extends AssistantMethodOutput> {
	/**
	 * Name that identifies the method; must be unique amongst all methods exposed by the plugin.
	 */
	readonly name: string;

	/**
	 * Description that describes what the method does.
	 */
	readonly description: string;

	/**
     Schema that represents the input arguments.
	 */
	readonly inputSchema?: I;

	/**
	 * Schema that represents the output result.
	 */
	readonly outputSchema: O;

	/**
	 * Function invoked when the method is called.
	 * @returns The result of calling the method.
	 */
	readonly handler: I extends undefined
		? () => Promise<z.infer<O>> | z.infer<O>
		: (input: z.infer<I>) => Promise<z.infer<O>> | z.infer<O>;
}

/**
 * Input type for an assistant method; a JSON object, or undefined.
 */
export type AssistantMethodInput = z.ZodType<JsonObject> | undefined;

/**
 * Output result type for an assistant method; a defined JSON value.
 */
export type AssistantMethodOutput = z.ZodType<Exclude<JsonPrimitive, undefined> | JsonObject | JsonPrimitive[]>;
