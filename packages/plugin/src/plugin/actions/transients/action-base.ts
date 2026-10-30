import { randomUUID } from "node:crypto";

import { type EventArgs, type JsonObject, type JsonValue, withResolvers } from "@elgato/utils";

import type {
	DidReceiveResources,
	DidReceiveSettings,
	GetResources,
	GetSettings,
	PluginEventMap,
	Resources,
	TitleParametersDidChange,
	WillAppear,
} from "../../../api/index.js";
import { connection } from "../../connection.js";
import { logger } from "../../logging/index.js";
import { requiresVersion } from "../../validation.js";
import { actionConfig } from "../config.js";
import { ActionContext } from "../context.js";
import { actionStore } from "../store.js";
import type { DialAction } from "./dial.js";
import type { KeyAction } from "./key.js";
import type { NeoInfobarAction } from "./neo-infobar.js";

const REQUEST_TIMEOUT = 15 * 1000; // 15s

/**
 * Provides a contextualized instance of an action, allowing for direct communication with the Stream Deck.
 * @template TSettings The type of settings associated with the action.
 */
export class ActionBase<TSettings extends JsonObject> extends ActionContext {
	/**
	 * Controller used to remove the action's event listeners when the action disappears.
	 */
	readonly #eventController = new AbortController();

	/**
	 * Cache of the settings.
	 */
	#settings: Readonly<JsonObject> | undefined;

	/**
	 * Initializes a new instance of an {@link ActionBase} class.
	 * @param source Source of the action.
	 */
	constructor(source: WillAppear<TSettings>) {
		super(source);

		this.#settings = source.payload.settings;

		// Maintain a cache of the settings.
		connection.prependListener(
			`didReceiveSettings:${source.action}:${source.context}`,
			(ev) => {
				this.#settings = ev.payload.settings;
			},
			{ signal: this.disposeSignal },
		);

		// Remove the action from the store.
		connection.prependListener(
			`willDisappear:${source.action}:${source.context}`,
			(ev) => {
				this.#eventController.abort();
				actionStore.delete(ev.context);
				this.onWillDisappear?.();
			},
			{ once: true },
		);

		if (this.onDidReceiveResources) {
			connection.on(
				`didReceiveResources:${source.action}:${source.context}`,
				(ev) => {
					// Do nothing when the action's resources were requested.
					if (ev.id === undefined) {
						this.onDidReceiveResources?.({ resources: ev.payload.resources });
					}
				},
				{ signal: this.disposeSignal },
			);
		}

		if (this.onDidReceiveSettings) {
			connection.on(
				`didReceiveSettings:${source.action}:${source.context}`,
				(ev) => {
					// Do nothing when the action's settings were requested, unless using the legacy behavior.
					if (actionConfig.useLegacySettingsBehavior || !ev.id) {
						this.onDidReceiveSettings?.({ settings: ev.payload.settings as TSettings });
					}
				},
				{ signal: this.disposeSignal },
			);
		}

		if (this.onPropertyInspectorDidAppear) {
			connection.on(
				`propertyInspectorDidAppear:${source.action}:${source.context}`,
				() => this.onPropertyInspectorDidAppear?.(),
				{ signal: this.disposeSignal },
			);
		}

		if (this.onPropertyInspectorDidDisappear) {
			connection.on(
				`propertyInspectorDidDisappear:${source.action}:${source.context}`,
				() => this.onPropertyInspectorDidDisappear?.(),
				{ signal: this.disposeSignal },
			);
		}

		if (this.onSendToPlugin) {
			connection.on(
				`sendToPlugin:${source.action}:${source.context}`,
				(ev) => this.onSendToPlugin?.({ payload: ev.payload }),
				{ signal: this.disposeSignal },
			);
		}

		if (this.onTitleParametersDidChange) {
			connection.on(
				`titleParametersDidChange:${source.action}:${source.context}`,
				(ev) =>
					this.onTitleParametersDidChange?.({
						title: ev.payload.title,
						titleParameters: ev.payload.titleParameters,
					}),
				{ signal: this.disposeSignal },
			);
		}
	}

	/**
	 * Occurs when the resources were updated within the property inspector.
	 *
	 * Available from Stream Deck 7.1.
	 * @param args Arguments that contain the resources.
	 */
	public onDidReceiveResources?(args: DidReceiveResourcesArgs): Promise<void> | void;

	/**
	 * Occurs when the settings were updated within the property inspector.
	 *
	 * When `streamDeck.settings.useLegacySettingsBehavior` is set to `true`, this also occurs after calling
	 * {@link ActionBase.getSettings}.
	 * @param args Arguments that contain the settings.
	 */
	public onDidReceiveSettings?(args: DidReceiveSettingsArgs<TSettings>): Promise<void> | void;

	/**
	 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected the action
	 * in the Stream Deck application.
	 */
	public onPropertyInspectorDidAppear?(): Promise<void> | void;

	/**
	 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the
	 * action in the Stream Deck application.
	 */
	public onPropertyInspectorDidDisappear?(): Promise<void> | void;

	/**
	 * Occurs when a message was sent to the plugin from the property inspector.
	 * @param args Arguments that contain the message's payload.
	 */
	public onSendToPlugin?(args: SendToPluginArgs): Promise<void> | void;

	/**
	 * Occurs when the user updates the action's title settings in the Stream Deck application.
	 * @param args Arguments that contain the title, and its parameters.
	 */
	public onTitleParametersDidChange?(args: TitleParametersDidChangeArgs): Promise<void> | void;

	/**
	 * Occurs when the action disappears from the Stream Deck, for example when the user navigates to another page,
	 * profile, folder, etc. The action's event listeners are removed after this occurs.
	 */
	public onWillDisappear?(): Promise<void> | void;

	/**
	 * Signal that is aborted when the action is disposed; used to remove the action's event listeners.
	 * @returns The signal.
	 */
	protected get disposeSignal(): AbortSignal {
		return this.#eventController.signal;
	}

	/**
	 * Gets the resources (files) associated with this action; these resources are embedded into the action when it is
	 * exported, either individually, or as part of a profile.
	 *
	 * Available from Stream Deck 7.1.
	 * @returns The resources.
	 */
	public async getResources(): Promise<Resources> {
		requiresVersion(7.1, connection.version, "getResources");

		const res = await this.#fetch("getResources", "didReceiveResources");
		return res.payload.resources;
	}

	/**
	 * Gets the settings associated this action instance.
	 * @returns Promise containing the action instance's settings.
	 */
	public async getSettings(): Promise<TSettings> {
		if (!actionConfig.useLegacySettingsBehavior) {
			if (this.#settings !== undefined) {
				logger.trace(
					JSON.stringify({
						event: "getSettings",
						context: this.id,
						source: "cache",
						settings: this.#settings,
					}),
				);

				return structuredClone(this.#settings as TSettings);
			}
		}

		const res = await this.#fetch("getSettings", "didReceiveSettings");
		return res.payload.settings as TSettings;
	}

	/**
	 * Determines whether this instance is a dial.
	 * @returns `true` when this instance is a dial; otherwise `false`.
	 */
	public isDial(): this is DialAction<TSettings> {
		return this.controllerType === "Encoder";
	}

	/**
	 * Determines whether this instance is a key.
	 * @returns `true` when this instance is a key; otherwise `false`.
	 */
	public isKey(): this is KeyAction<TSettings> {
		return this.controllerType === "Keypad";
	}

	/**
	 * Determines whether this instance is an Infobar.
	 * @returns `true` when this instance is an Infobar; otherwise `false`.
	 */
	public isNeoInfobar(): this is NeoInfobarAction<TSettings> {
		return this.controllerType === "Neo";
	}

	/**
	 * Sets the resources (files) associated with this action; these resources are embedded into the action when it is
	 * exported, either individually, or as part of a profile.
	 *
	 * Available from Stream Deck 7.1.
	 * @example
	 * action.setResources({
	 *   fileOne: "c:\\hello-world.txt",
	 *   anotherFile: "c:\\icon.png"
	 * });
	 * @param resources The resources as a map of file paths.
	 * @returns `Promise` resolved when the resources are saved to Stream Deck.
	 */
	public setResources(resources: Resources): Promise<void> {
		requiresVersion(7.1, connection.version, "setResources");

		return connection.send({
			event: "setResources",
			context: this.id,
			payload: resources,
		});
	}

	/**
	 * Sets the settings associated with this action instance.
	 * @param value Settings to persist.
	 * @returns `Promise` resolved when the settings are sent to Stream Deck.
	 */
	public setSettings(value: TSettings): Promise<void> {
		this.#settings = undefined;
		return connection.send({
			event: "setSettings",
			context: this.id,
			payload: value,
		});
	}

	/**
	 * Fetches information from Stream Deck by sending the command, and awaiting the event.
	 * @param command Name of the event (command) to send.
	 * @param event Name of the event to await.
	 * @returns The payload from the received event.
	 */
	async #fetch<TEvent extends DidReceiveEvent>(
		command: GetterEvent,
		event: TEvent,
	): Promise<EventArgs<PluginEventMap, TEvent>[0]> {
		const { resolve, reject, promise } = withResolvers<EventArgs<PluginEventMap, TEvent>[0]>();

		// Set a timeout to prevent endless awaiting.
		const timeoutId = setTimeout(() => {
			listener.dispose();
			reject("The request timed out");
		}, REQUEST_TIMEOUT);

		// Listen for an event that can resolve the request.
		const listener = connection.disposableOn(event, (ev): void => {
			// Make sure the received event is for this action.
			if (ev.context == this.id) {
				clearTimeout(timeoutId);
				listener.dispose();
				resolve(ev);
			}
		});

		// Send the request; specifying an id signifies its a request.
		await connection.send({
			event: command,
			context: this.id,
			id: randomUUID(),
		});

		return promise;
	}
}

/**
 * Events that represents a request for information from Stream Deck.
 */
type GetterEvent = (GetResources | GetSettings)["event"];

/**
 * Events that represents a response of information from Stream Deck.
 */
type DidReceiveEvent = (DidReceiveResources<JsonObject> | DidReceiveSettings<JsonObject>)["event"];

/**
 * Arguments provided when the resources associated with an action are received.
 */
export interface DidReceiveResourcesArgs {
	/**
	 * Resources (files) associated with the action.
	 */
	readonly resources: Resources;
}

/**
 * Arguments provided when the settings associated with an action are received.
 * @template TSettings The type of settings associated with the action.
 */
export interface DidReceiveSettingsArgs<TSettings extends JsonObject> {
	/**
	 * Settings associated with the action.
	 */
	readonly settings: TSettings;
}

/**
 * Arguments provided when a message is sent to the plugin from the property inspector.
 */
export interface SendToPluginArgs {
	/**
	 * Payload sent from the property inspector.
	 */
	readonly payload: JsonValue;
}

/**
 * Arguments provided when the title, or title parameters, of an action change.
 */
export interface TitleParametersDidChangeArgs {
	/**
	 * Title of the action, as specified by the user or dynamically by the plugin.
	 */
	readonly title: string;

	/**
	 * Aesthetic properties that determine how the title should be rendered.
	 */
	readonly titleParameters: TitleParametersDidChange<JsonObject>["payload"]["titleParameters"];
}
