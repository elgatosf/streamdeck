/**
 * Defines the type of argument supplied by Stream Deck.
 */
export enum RegistrationParameter {
	/**
	 * Identifies the argument that specifies the web socket port that Stream Deck is listening on.
	 */
	Port = "-port",

	/**
	 * Identifies the argument that supplies information about the Stream Deck and the plugin.
	 */
	Info = "-info",

	/**
	 * Identifies the argument that specifies the unique identifier that can be used when registering the plugin.
	 */
	PluginUUID = "-pluginUUID",

	/**
	 * Identifies the argument that specifies the event to be sent to Stream Deck as part of the registration procedure.
	 */
	RegisterEvent = "-registerEvent"
}
