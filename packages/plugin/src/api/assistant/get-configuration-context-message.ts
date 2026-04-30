/**
 * Request for the configuration context associated with an action.
 */
export interface GetConfigurationContextMessage {
	/**
	 * Event type.
	 */
	readonly event: "getConfigurationContext";

	/**
	 * Unique identifier of the action as defined within the manifest.
	 */
	readonly action: string;

	/**
	 * Identifies the request.
	 */
	readonly id: string;
}
