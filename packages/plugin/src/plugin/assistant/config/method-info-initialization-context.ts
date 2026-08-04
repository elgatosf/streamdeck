import type { AssistantMethodInfo } from "../methods/method-info.js";

/**
 * Initialization context that defines an action is initialized by invoking a method within the plugin.
 */
export interface MethodInfoInitializationContext {
	/**
	 * The action requires a plugin-defined method to be invoked before an action can be configured.
	 */
	readonly type: "method";

	/**
	 * The method responsible for initializing the action, prior to it being configured.
	 */
	readonly method: AssistantMethodInfo;
}
