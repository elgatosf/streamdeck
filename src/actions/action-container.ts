import type { Manifest } from "..";
import type { StreamDeckConnection } from "../connectivity/connection";
import type * as api from "../connectivity/events";
import type { Logger } from "../logging";
import { SettingsClient } from "../settings";
import { UIClient } from "../ui";
import { Action } from "./action";
import { ActionClient } from "./action-client";
import type { SingletonAction } from "./singleton-action";

/**
 * Container of Stream Deck actions, responsible managing actions and routing events received from Stream Deck.
 */
export class ActionContainer implements IActionContainer {
	/**
	 * Action controller that contains clients responsible for interacting with Stream Deck actions.
	 */
	public readonly controller: ActionController;

	/**
	 * Logger scoped to this class.
	 */
	private readonly logger: Logger;

	/**
	 * Initializes a new instance of the {@link ActionContainer} class.
	 * @param connection Underlying connection with the Stream Deck.
	 * @param manifest Manifest associated with the plugin.
	 * @param logger Logger responsible for capturing log entries.
	 */
	constructor(
		connection: StreamDeckConnection,
		private readonly manifest: Manifest,
		logger: Logger
	) {
		this.logger = logger.createScope("ActionContainer");
		this.controller = {
			actions: new ActionClient(connection, this),
			settings: new SettingsClient(connection, this),
			ui: new UIClient(connection, this)
		};
	}

	/**
	 * @inheritdoc
	 */
	public registerAction<TAction extends SingletonAction<TSettings>, TSettings extends api.PayloadObject<TSettings> = object>(action: TAction): void {
		if (action.manifestId === undefined) {
			throw new Error("The action's manifestId cannot be undefined.");
		}

		if (!this.manifest.Actions.some((a) => a.UUID === action.manifestId)) {
			this.logger.warn(`Failed to route action: manifestId (UUID) ${action.manifestId} was not found in the manifest.`);
			return;
		}

		const addEventListener = <TClient, TEventArgs extends RoutingEvent<TSettings>>(
			manifestId: string,
			client: TClient,
			eventFn: (client: TClient) => (listener: (ev: TEventArgs) => void) => void,
			listener: ((ev: TEventArgs) => Promise<void> | void) | undefined
		): void => {
			const boundedListener = listener?.bind(action);
			if (boundedListener === undefined) {
				return;
			}

			eventFn(client).bind(client)(async (ev) => {
				if (ev.action.manifestId == manifestId) {
					await boundedListener(ev);
				}
			});
		};

		addEventListener(action.manifestId, this.controller.actions, (client) => client.onDialDown, action.onDialDown);
		addEventListener(action.manifestId, this.controller.actions, (client) => client.onDialUp, action.onDialUp);
		addEventListener(action.manifestId, this.controller.actions, (client) => client.onDialRotate, action.onDialRotate);
		addEventListener(action.manifestId, this.controller.actions, (client) => client.onKeyDown, action.onKeyDown);
		addEventListener(action.manifestId, this.controller.actions, (client) => client.onTitleParametersDidChange, action.onTitleParametersDidChange);
		addEventListener(action.manifestId, this.controller.actions, (client) => client.onTouchTap, action.onTouchTap);
		addEventListener(action.manifestId, this.controller.actions, (client) => client.onWillAppear, action.onWillAppear);
		addEventListener(action.manifestId, this.controller.actions, (client) => client.onWillDisappear, action.onWillDisappear);
		addEventListener(action.manifestId, this.controller.actions, (client) => client.onKeyUp, action.onKeyUp);

		addEventListener(action.manifestId, this.controller.settings, (client) => client.onDidReceiveSettings, action.onDidReceiveSettings);

		addEventListener(action.manifestId, this.controller.ui, (client) => client.onPropertyInspectorDidAppear, action.onPropertyInspectorDidAppear);
		addEventListener(action.manifestId, this.controller.ui, (client) => client.onPropertyInspectorDidDisappear, action.onPropertyInspectorDidDisappear);
		addEventListener(action.manifestId, this.controller.ui, (client) => client.onSendToPlugin, action.onSendToPlugin);
	}

	/**
	 * @inheritdoc
	 */
	public resolveAction<T extends api.PayloadObject<T> = object>(event: api.ActionIdentifier): Action<T> {
		return new Action<T>(this.controller, event.action, event.context);
	}
}

/**
 * Action register responsible for routing actions received from Streak Deck, to the specified action.
 */
export interface IActionContainer {
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
	registerAction<TAction extends SingletonAction<TSettings>, TSettings extends api.PayloadObject<TSettings> = object>(action: TAction): void;

	/**
	 * Resolves the {@link Action} associated with the {@link event}.
	 * @param event The event.
	 * @returns The {@link Action} for the {@link event}.
	 */
	resolveAction<T extends api.PayloadObject<T> = object>(event: api.ActionIdentifier): Action<T>;
}

/**
 * Action controller capable of interacting with Stream Deck actions.
 */
export type ActionController = {
	/**
	 * Client responsible for interacting with Stream Deck actions.
	 */
	readonly actions: ActionClient;

	/**
	 * Provides management of settings associated with the Stream Deck plugin.
	 */
	readonly settings: SettingsClient;

	/**
	 * Client responsible for interacting with the Stream Deck UI (aka property inspector).
	 */
	readonly ui: UIClient;
};

/**
 * Event associated with an {@link Action}.
 */
type RoutingEvent<T extends api.PayloadObject<T>> = {
	/**
	 * The {@link Action} the event is associated with.
	 */
	action: Action<T>;
};
