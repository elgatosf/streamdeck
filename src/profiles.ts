import { StreamDeckConnection } from "./connectivity/connection";

/**
 * Provides interaction with Stream Deck profiles.
 */
export class ProfileClient {
	/**
	 * Initializes a new instance of the {@link ProfileClient} class.
	 * @param connection Connection with Stream Deck.
	 */
	constructor(private readonly connection: StreamDeckConnection) {}

	/**
	 * Requests the Stream Deck switches the current profile of the specified {@link deviceId} to the {@link profile}; when no {@link profile} is provided the previously active profile
	 * is activated. **NB**, plugins can only switch to profiles included as part
	 * of the plugin and defined within the manifest, and cannot switch to custom profiles created by users.
	 * @param deviceId Unique identifier of the device where the profile should be set.
	 * @param profile Optional name of the profile to switch to; when `undefined` the previous profile will be activated. **NB** name must be identical to the one provided in the manifest.
	 * @param page Optional page to show when switching to the {@link profile}, indexed from 0. When `undefined`, the page that was previously visible (when switching away from the
	 * profile) will be made visible.
	 * @returns `Promise` resolved when the request to switch the `profile` has been sent to Stream Deck.
	 */
	public switchToProfile(deviceId: string, profile?: string, page?: number): Promise<void> {
		return this.connection.send({
			event: "switchToProfile",
			context: this.connection.registrationParameters.pluginUUID,
			device: deviceId,
			payload: {
				page,
				profile
			}
		});
	}
}
