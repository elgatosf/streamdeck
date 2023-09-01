import { StreamDeckClient } from "../client";
import { Logger } from "../logging";
import { Manifest } from "../manifest";
import { addRoute } from "./route";
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
	 * Initializes a new instance of the {@link ActionsController} class.
	 * @param client The Stream Deck client.
	 * @param manifest Manifest associated with the plugin.
	 * @param logger Logger responsible for capturing log entries.
	 */
	constructor(private readonly client: StreamDeckClient, private readonly manifest: Manifest, logger: Logger) {
		this.logger = logger.createScope("ActionsController");
	}

	/**
	 * Registers the action with the Stream Deck, routing all events associated with the {@link SingletonAction.manifestId} to the specified {@link action}.
	 * @param action The action to register.
	 * @example
	 * ＠action({ UUID: "com.elgato.test.action" })
	 * class MyCustomAction extends SingletonAction {
	 *     public onKeyDown(ev: KeyDownEvent) {
	 *         // Do some awesome thing.
	 *     }
	 * }
	 *
	 * streamDeck.actions.registerAction(new MyCustomAction());
	 */
	public registerAction<TAction extends SingletonAction<TSettings>, TSettings = unknown>(action: TAction) {
		if (action.manifestId !== undefined && this.manifest.Actions.find((a) => a.UUID === action.manifestId)) {
			addRoute(this.client, action);
		} else {
			this.logger.warn(`Failed to route action: manifestId (UUID) ${action.manifestId} was not found in the manifest.`);
		}
	}
}
