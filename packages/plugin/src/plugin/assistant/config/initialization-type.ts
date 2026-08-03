import type { InitializationContext } from "../../../api/assistant/initialization-context.js";
import type { MethodInitializationContext } from "../../../api/assistant/initialization/method-initialization-context.js";
import type { MethodInfoInitializationContext } from "./method-info-initialization-context.js";

/**
 * Determines the initialization-type of an action, before it can be configured.
 *
 * When an initialization-type is undefined, it indicates the action is either already initialized, or
 * does not require initialization.
 */
export type AssistantActionInitializationType =
	| Exclude<InitializationContext["initialization"], MethodInitializationContext>
	| MethodInfoInitializationContext
	| undefined;
