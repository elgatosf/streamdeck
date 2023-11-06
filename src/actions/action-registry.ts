import type { Manifest } from "..";
import type { StreamDeckClient } from "../client";
import type { PayloadObject } from "../connectivity/events";
import type { Logger } from "../logging";
import { Action } from "./action";
import type { SingletonAction } from "./singleton-action";

/**
 * A registry for Stream Deck actions responsible for managing the routing of events received from Stream Deck.
 */
export class ActionRegistry {
	/**
	 * Logger scoped to this class.
	 */
	private readonly logger: Logger;

	/**
	 * Initializes a new instance of the {@link ActionRegistry} class.
	 * @param client The Stream Deck client.
	 * @param manifest Manifest associated with the plugin.
	 * @param logger Logger responsible for capturing log entries.
	 */
	constructor(
		private readonly client: StreamDeckClient,
		private readonly manifest: Manifest,
		logger: Logger
	) {
		this.logger = logger.createScope("ActionRegistry");
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
	public registerAction<TAction extends SingletonAction<TSettings>, TSettings extends PayloadObject<TSettings> = object>(action: TAction): void {
		if (action.manifestId === undefined) {
			throw new Error("The action's manifestId cannot be undefined.");
		}

		if (!this.manifest.Actions.some((a) => a.UUID === action.manifestId)) {
			this.logger.warn(`Failed to route action: manifestId (UUID) ${action.manifestId} was not found in the manifest.`);
			return;
		}

		const addEventListener = <TEventArgs extends RoutingEvent<TSettings>>(
			manifestId: string,
			event: (listener: (ev: TEventArgs) => void) => void,
			listener: ((ev: TEventArgs) => Promise<void> | void) | undefined
		): void => {
			const boundedListener = listener?.bind(action);
			if (boundedListener === undefined) {
				return;
			}

			event.bind(this.client)(async (ev) => {
				if (ev.action.manifestId == manifestId) {
					await boundedListener(ev);
				}
			});
		};

		addEventListener(action.manifestId, this.client.onDialDown, action.onDialDown);
		addEventListener(action.manifestId, this.client.onDialUp, action.onDialUp);
		addEventListener(action.manifestId, this.client.onDialRotate, action.onDialRotate);
		addEventListener(action.manifestId, this.client.onDidReceiveSettings, action.onDidReceiveSettings);
		addEventListener(action.manifestId, this.client.onKeyDown, action.onKeyDown);
		addEventListener(action.manifestId, this.client.onKeyUp, action.onKeyUp);
		addEventListener(action.manifestId, this.client.onPropertyInspectorDidAppear, action.onPropertyInspectorDidAppear);
		addEventListener(action.manifestId, this.client.onPropertyInspectorDidDisappear, action.onPropertyInspectorDidDisappear);
		addEventListener(action.manifestId, this.client.onSendToPlugin, action.onSendToPlugin);
		addEventListener(action.manifestId, this.client.onTitleParametersDidChange, action.onTitleParametersDidChange);
		addEventListener(action.manifestId, this.client.onTouchTap, action.onTouchTap);
		addEventListener(action.manifestId, this.client.onWillAppear, action.onWillAppear);
		addEventListener(action.manifestId, this.client.onWillDisappear, action.onWillDisappear);
	}
}

/**
 * Event associated with an {@link Action}.
 */
type RoutingEvent<T extends PayloadObject<T>> = {
	/**
	 * The {@link Action} the event is associated with.
	 */
	action: Action<T>;
};
