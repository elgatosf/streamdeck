import type { AppInitializationContext } from "./initialization/app-initialization-context.js";
import type { MethodInitializationContext } from "./initialization/method-initialization-context.js";
import type { UnsupportedInitializationContext } from "./initialization/unsupported-initialization-context.js";

/**
 * Initialization context that defines how an action can be initialized, prior to configuration.
 */
export interface InitializationContext {
	/**
	 * Information about how the action can be initialized.
	 */
	readonly initialization: AppInitializationContext | MethodInitializationContext | UnsupportedInitializationContext;

	/**
	 * Indicates the action requires initializing before it can be configured.
	 */
	readonly status: "initialize";
}
