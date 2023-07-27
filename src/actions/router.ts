import { StreamDeckClient } from "../client";
import { logger } from "../common/logging";
import { Manifest } from "../manifest";
import { Route } from "./route";
import { SingletonAction } from "./singleton-action";

/**
 * Provides routing of {@link StreamDeckClient} events to action classes.
 */
export class Router {
	/**
	 * Collection of registered routes.
	 */
	private readonly routes: Route[] = [];

	/**
	 * Initializes a new instance of the {@link Router} class.
	 * @param client The Stream Deck client.
	 * @param manifest Manifest associated with the plugin.
	 */
	constructor(private readonly client: StreamDeckClient, private readonly manifest: Manifest) {}

	/**
	 * Routes all action-based events associated with the {@link manifestId} to the specified {@link action}.
	 * @param manifestId Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`), e.g. "com.elgato.wave-link.mute".
	 * @param action The action that will receive the events.
	 * @example
	 * ```
	 * class MyCustomAction extends SingletonAction<MySettings> {
	 *     public onKeyDown(ev: streamDeck.KeyDownEvent<MySettings>) {
	 *         // Some awesome thing.
	 *     }
	 * }
	 *
	 * streamDeck.router.route("com.elgato.example.my-custom-action", new MyCustomAction());
	 * ```
	 */
	public route<TAction extends SingletonAction<TSettings>, TSettings = unknown>(manifestId: string, action: TAction) {
		if (this.manifest.Actions.find((a) => a.UUID === manifestId)) {
			this.routes.push(new Route(this.client, manifestId, action));
		} else {
			logger.logWarn(`Failed to route action. The specified action UUID does not exist in the manifest: ${manifestId}`);
		}
	}
}
