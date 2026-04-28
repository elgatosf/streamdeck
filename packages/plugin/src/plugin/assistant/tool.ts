import type z from "zod";
import type { JSONSchema } from "zod/v4/core";

/**
 * Defines a tool that is accessible to the Elgato assistant.
 */
interface AssistantToolBase<I extends z.ZodType = z.ZodType, O extends z.ZodType = z.ZodType> {
	/**
	 * Name that identifies the tool; must be unique amongst all tools exposed by the plugin.
	 */
	readonly name: string;

	/**
	 * Describes the purpose of the tool.
	 */
	readonly description: string;

	/**
	 * The handler function fired when the tool is called.
	 * @returns The output of the tool.
	 */
	readonly handler: I extends z.ZodUndefined | undefined
		? () => Promise<z.infer<O>> | z.infer<O>
		: (input: z.infer<I>) => Promise<z.infer<O>> | z.infer<O>;
}

/**
 * Defines a tool that is accessible to the Elgato assistant.
 */
export interface TypedAssistantTool<
	I extends z.ZodType = z.ZodType,
	O extends z.ZodType = z.ZodType,
> extends AssistantToolBase<I, O> {
	/**
	 * Schema that represents the tool's input.
	 */
	readonly inputSchema?: I;

	/**
	 * Schema that represents the tool's output.
	 */
	readonly outputSchema: O;
}

/**
 * Defines a tool that is accessible to the Elgato assistant.
 */
export interface AssistantTool<
	I extends z.ZodType = z.ZodType,
	O extends z.ZodType = z.ZodType,
> extends AssistantToolBase<I, O> {
	/**
	 * Schema that represents the tool's input.
	 */
	readonly inputSchema?: JSONSchema.JSONSchema;

	/**
	 * Schema that represents the tool's output.
	 */
	readonly outputSchema: JSONSchema.JSONSchema;
}
