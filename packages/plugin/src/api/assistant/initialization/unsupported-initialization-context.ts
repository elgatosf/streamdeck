/**
 * Initialization context that defines an action does not support a standard initialization, and further
 * steps are required by the user (as defined by the message).
 */
export interface UnsupportedInitializationContext {
	/**
	 * Initialization is not supported as part of the Elgato assistant.
	 */
	readonly type: "unsupported";

	/**
	 * Message shown to the user indicating the next step.
	 */
	readonly message: string;
}
