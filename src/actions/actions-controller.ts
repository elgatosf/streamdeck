import { StreamDeckClient } from "../client";
import { Logger } from "../logging";
import { Manifest } from "../manifest";
import { Route } from "./route";
import { SingletonAction } from "./singleton-action";

/**
 * Provides a controller capable of managing actions associated with the Stream Deck plugin.
 */
export class ActionsController {
	/**
	 * Logger scoped to this class.
	 */
	private readonly logger: Logger;

	/**
	 * Collection of registered routes.
	 */
	private readonly routes: Route[] = [];

	/**
	 * Initializes a new instance of the {@link ActionsController} class.
	 * @param client The Stream Deck client.
	 * @param manifest Manifest associated with the plugin.
	 * @param logger Logger responsible for capturing log entries.
	 */
	constructor(private readonly client: StreamDeckClient, private readonly manifest: Manifest, logger: Logger) {
		this.logger = logger.createScope("ActionsController");
	}

	/**
	 * Registers the action with the Stream Deck, routing all events associated with the {@link uuid} to the specified {@link action}.
	 * @param registration The action to register.
	 * @example
	 * ```
	 * class MyCustomAction extends SingletonAction<MySettings> {
	 *     public onKeyDown(ev: streamDeck.KeyDownEvent<MySettings>) {
	 *         // Some awesome thing.
	 *     }
	 * }
	 *
	 * streamDeck.actions.registerAction({
	 *     uuid: "com.elgato.example.my-custom-action"
	 *     action: new MyCustomAction()
	 * });
	 * ```
	 */
	public registerAction<TAction extends SingletonAction<TSettings>, TSettings = unknown>(registration: ActionRegistration<TAction>) {
		if (this.manifest.Actions.find((a) => a.UUID === registration.uuid)) {
			this.routes.push(new Route(this.client, registration.uuid, registration.action));
		} else {
			this.logger.warn(`Failed to route action. The specified action UUID does not exist in the manifest: ${registration.uuid}`);
		}
	}
}

/**
 * Provides information for an action registered with the actions controller whereby events will be routed.
 */
export type ActionRegistration<TAction extends SingletonAction<TSettings>, TSettings = unknown> = {
	/**
	 * The action that will receive the events.
	 */
	action: TAction;

	/**
	 * Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`), e.g. "com.elgato.wave-link.mute".
	 */
	uuid: string;
};
