import { StreamDeckClient } from "../client";
import type { Logger } from "../common/logging";
import { Manifest } from "../manifest";
import { Route } from "./route";
import { SingletonAction } from "./singleton-action";

/**
 * Provides a controller capable of managing actions associated with the Stream Deck plugin.
 */
export class ActionsController {
	/**
	 * Collection of registered routes.
	 */
	private readonly routes: Route[] = [];

	/**
	 * Initializes a new instance of the {@link ActionsController} class.
	 * @param client The Stream Deck client.
	 * @param manifest Manifest associated with the plugin.
	 * @param logger Logger responsible for logging messages.
	 */
	constructor(private readonly client: StreamDeckClient, private readonly manifest: Manifest, private readonly logger: Logger) {}

	/**
	 * Registers the action with the Stream Deck, routing all events associated with the {@link manifestId} to the specified {@link action}.
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
	public registerAction<TAction extends SingletonAction<TSettings>, TSettings = unknown>(manifestId: string, action: TAction) {
		if (this.manifest.Actions.find((a) => a.UUID === manifestId)) {
			this.routes.push(new Route(this.client, manifestId, action));
		} else {
			this.logger.logWarn(`Failed to route action. The specified action UUID does not exist in the manifest: ${manifestId}`);
		}
	}
}
