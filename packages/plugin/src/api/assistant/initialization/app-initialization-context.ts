/**
 * Initialization context that defines an action is initialized by launching an app.
 */
export interface AppInitializationContext {
	/**
	 * The action requires an app to be running in order to configure an action.
	 */
	readonly type: "app";

	/**
	 * App name or bundle identifier, for example "com.discord.desktop" or "Discord.exe".
	 */
	readonly app: string;
}
