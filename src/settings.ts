import type { IActionContainer } from "./actions/action-container";
import type { StreamDeckConnection } from "./connectivity/connection";
import type * as api from "./connectivity/events";
import { ActionEvent, DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent } from "./events";

/**
 * Provides management of settings associated with the Stream Deck plugin.
 */
export class SettingsClient {
	/**
	 * Initializes a new instance of the {@link SettingsClient} class.
	 * @param connection Underlying connection with the Stream Deck.
	 * @param container Action container capable of resolving Stream Deck actions.
	 */
	constructor(
		private readonly connection: StreamDeckConnection,
		private readonly container: IActionContainer
	) {}

	/**
	 * Gets the global settings associated with the plugin. Use in conjunction with {@link SettingsClient.setGlobalSettings}.
	 * @template T The type of global settings associated with the plugin.
	 * @returns Promise containing the plugin's global settings.
	 */
	public getGlobalSettings<T extends api.PayloadObject<T> = object>(): Promise<T> {
		return new Promise((resolve) => {
			this.connection.once("didReceiveGlobalSettings", (ev: api.DidReceiveGlobalSettings<T>) => resolve(ev.payload.settings));
			this.connection.send({
				event: "getGlobalSettings",
				context: this.connection.registrationParameters.pluginUUID
			});
		});
	}

	/**
	 * Gets the settings associated with an instance of an action, as identified by the {@link context}. An instance of an action represents a button, dial, pedal, etc. See also
	 * {@link SettingsClient.setSettings}.
	 * @template T The type of settings associated with the action.
	 * @param context Unique identifier of the action instance whose settings are being requested.
	 * @returns Promise containing the action instance's settings.
	 */
	public getSettings<T extends api.PayloadObject<T> = object>(context: string): Promise<T> {
		return new Promise((resolve) => {
			const callback = (ev: api.DidReceiveSettings<T>): void => {
				if (ev.context == context) {
					resolve(ev.payload.settings);
					this.connection.removeListener("didReceiveSettings", callback);
				}
			};

			this.connection.on("didReceiveSettings", callback);
			this.connection.send({
				event: "getSettings",
				context
			});
		});
	}

	/**
	 * Occurs when the global settings are requested using {@link SettingsClient.getGlobalSettings}, or when the the global settings were updated by the property inspector.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDidReceiveGlobalSettings<T extends api.PayloadObject<T> = object>(listener: (ev: DidReceiveGlobalSettingsEvent<T>) => void): void {
		this.connection.on("didReceiveGlobalSettings", (ev: api.DidReceiveGlobalSettings<T>) => listener(new DidReceiveGlobalSettingsEvent(ev)));
	}

	/**
	 * Occurs when the settings associated with an action instance are requested using {@link SettingsClient.getSettings}, or when the the settings were updated by the property inspector.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDidReceiveSettings<T extends api.PayloadObject<T> = object>(listener: (ev: DidReceiveSettingsEvent<T>) => void): void {
		this.connection.on("didReceiveSettings", (ev: api.DidReceiveSettings<T>) => listener(new ActionEvent<api.DidReceiveSettings<T>>(this.container.resolveAction<T>(ev), ev)));
	}

	/**
	 * Sets the global {@link settings} associated the plugin. **Note**, these settings are only available to this plugin, and should be used to persist information securely. Use in
	 * conjunction with {@link SettingsClient.getGlobalSettings}.
	 * @param settings Settings to save.
	 * @returns `Promise` resolved when the global `settings` are sent to Stream Deck.
	 * @example
	 * streamDeck.settings.setGlobalSettings({
	 *   apiKey,
	 *   connectedDate: new Date()
	 * })
	 */
	public setGlobalSettings<T>(settings: T): Promise<void> {
		return this.connection.send({
			event: "setGlobalSettings",
			context: this.connection.registrationParameters.pluginUUID,
			payload: settings
		});
	}

	/**
	 * Sets the {@link settings} associated with an instance of an action, as identified by the {@link context}. An instance of an action represents a button, dial, pedal, etc. Use
	 * in conjunction with {@link SettingsClient.getSettings}.
	 * @param context Unique identifier of the action instance whose settings will be updated.
	 * @param settings Settings to associate with the action instance.
	 * @returns `Promise` resolved when the {@link settings} are sent to Stream Deck.
	 * @example
	 * streamDeck.settings.setSettings(ctx, {
	 *   name: "Elgato"
	 * })
	 */
	public setSettings<T>(context: string, settings: T): Promise<void> {
		return this.connection.send({
			event: "setSettings",
			context,
			payload: settings
		});
	}
}
