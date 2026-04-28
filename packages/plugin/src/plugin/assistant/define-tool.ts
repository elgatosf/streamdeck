import * as z from "zod";

import { tools } from "./dispatcher.js";
import type { AssistantTool, TypedAssistantTool } from "./tool.js";

/**
 * Defines and registers a tool that can be used by the Elgato assistant.
 * @param config Configuration that defines the tool.
 * @returns The tool's definition.
 */
export function defineAssistantTool<TOutput extends z.ZodType, TInput extends z.ZodType = z.ZodUndefined>(
	config: TypedAssistantTool<TInput, TOutput>,
): AssistantTool {
	const { name, description, handler, inputSchema, outputSchema } = config;

	if (tools.has(name)) {
		throw new Error(`A tool with the same name has already been defined: ${name}`);
	}

	const tool: AssistantTool = {
		name,
		description,
		inputSchema: inputSchema ? z.toJSONSchema(inputSchema) : undefined,
		outputSchema: z.toJSONSchema(outputSchema),
		handler,
	};

	tools.set(config.name, tool);
	return tool;
}
