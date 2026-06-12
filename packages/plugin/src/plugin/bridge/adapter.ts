import type { IDisposable, JsonObject, JsonValue } from "@elgato/utils";
import { createRpcServerClient, type RpcSender } from "@elgato/utils/rpc";

import type {
	Coordinates,
	DeviceDidChange,
	DeviceDidConnect,
	DidReceiveSettings,
	Manifest,
	Resources,
	WillAppear,
	WillDisappear,
} from "../../api/index.js";
import { isDebugMode } from "../common/utils.js";
import { connection } from "../connection.js";
import { logger } from "../logging/index.js";
import { getManifest } from "../manifest.js";
import { socket } from "./socket.js";

/**
 * Internal JSON-RPC adapter that projects connection events into serialized plugin state.
 */
class BridgeAdapter {
	/**
	 * Tracked device names indexed by device identifier.
	 */
	readonly #devices = new Map<string, string>();

	/**
	 * Tracked visible action instances indexed by action context.
	 */
	readonly #instances = new Map<string, InternalInstanceState>();

	/**
	 * Registered disposables associated with adapter listeners and methods.
	 */
	readonly #disposables: IDisposable[] = [];

	/**
	 * Parsed plugin manifest, when available.
	 */
	#manifest: Manifest | null | undefined;

	/**
	 * Internal RPC client/server used by the adapter.
	 */
	#rpc: ReturnType<typeof createRpcServerClient> | undefined;

	/**
	 * Last serialized plugin state emitted by the adapter.
	 */
	#lastPluginState = "";

	/**
	 * Tail of the serialized publication promise chain.
	 */
	#publishQueue: Promise<void> = Promise.resolve();

	/**
	 * Determines whether registration devices have been seeded into the internal device map.
	 */
	#seededDevices = false;

	/**
	 * Initializes a new bridge adapter instance.
	 */
	constructor() {
		this.#disposables.push(
			connection.disposableOn("deviceDidChange", (ev: DeviceDidChange) => {
				this.#devices.set(ev.device, ev.deviceInfo.name);
				this.#publishChanges();
			}),
		);
		this.#disposables.push(
			connection.disposableOn("deviceDidConnect", (ev: DeviceDidConnect) => {
				this.#devices.set(ev.device, ev.deviceInfo.name);
				this.#publishChanges();
			}),
		);
		this.#disposables.push(
			connection.disposableOn("didReceiveSettings", (ev: DidReceiveSettings<JsonObject>) => {
				const instance = this.#instances.get(ev.context);
				if (!instance) {
					return;
				}
				const payload = ev.payload as PayloadWithCoordinates;

				instance.controller = ev.payload.controller;
				instance.deviceId = ev.device;
				instance.isInMultiAction = payload.isInMultiAction ?? false;
				instance.coordinates = payload.coordinates;
				instance.resources = payload.resources ?? {};
				instance.settings = ev.payload.settings;
				this.#publishChanges();
			}),
		);
		this.#disposables.push(
			connection.disposableOn("willAppear", (ev: WillAppear<JsonObject>) => {
				const payload = ev.payload as PayloadWithCoordinates;

				this.#instances.set(ev.context, {
					context: ev.context,
					controller: ev.payload.controller,
					deviceId: ev.device,
					isInMultiAction: payload.isInMultiAction ?? false,
					manifestId: ev.action,
					coordinates: payload.coordinates,
					resources: payload.resources ?? {},
					settings: ev.payload.settings,
				});

				this.#publishChanges();
			}),
		);
		this.#disposables.push(
			connection.disposableOn("willDisappear", (ev: WillDisappear<JsonObject>) => {
				if (this.#instances.delete(ev.context)) {
					this.#publishChanges();
				}
			}),
		);
	}

	/**
	 * Attaches an RPC transport to the adapter.
	 * @param send Function responsible for sending JSON-RPC requests and responses.
	 */
	public attachRpc(send: RpcSender): void {
		this.#rpc = createRpcServerClient(send);
		this.#rpc.addMethod("streamDeck.bridge.getPluginState", () => this.getPluginState());
		this.#rpc.addMethod<SetSettingsParams>("streamDeck.bridge.setSettings", (params) => this.#setSettings(params));
	}

	/**
	 * Disposes the adapter and unregisters all connection listeners.
	 */
	public dispose(): void {
		this.#disposables.forEach((disposable) => disposable.dispose());
	}

	/**
	 * Builds the current plugin state.
	 * @returns Current plugin state.
	 */
	public getPluginState(): PluginState {
		this.#seedDevices();

		const manifestActions = this.#getManifest()?.Actions ?? [];
		const groups = new Map<string, ActionState>();

		manifestActions.forEach((action) => {
			groups.set(action.UUID, {
				instances: [],
				name: action.Name,
				uuid: action.UUID,
			});
		});

		this.#instances.forEach((instance) => {
			const action = groups.get(instance.manifestId) ?? {
				instances: [],
				name: instance.manifestId,
				uuid: instance.manifestId,
			};

			action.instances.push({
				context: instance.context,
				controller: instance.controller,
				coordinates: instance.coordinates,
				device: this.#getDeviceName(instance.deviceId),
				isInMultiAction: instance.isInMultiAction,
				resources: instance.resources,
				settings: instance.settings,
			});

			groups.set(instance.manifestId, action);
		});

		return {
			actions: [...groups.values()],
			plugin: {
				name: this.#getManifest()?.Name ?? connection.registrationParameters.info.plugin.uuid,
				uuid: this.#getManifest()?.UUID ?? connection.registrationParameters.info.plugin.uuid,
				version: this.#getManifest()?.Version ?? connection.registrationParameters.info.plugin.version,
			},
		};
	}

	/**
	 * Attempts to process the specified JSON-RPC message.
	 * @param value Value to process.
	 * @returns `true` when the value was handled by the adapter.
	 */
	public receive(value: JsonValue): Promise<boolean> {
		return this.#rpc ? this.#rpc.receive(value) : Promise.resolve(false);
	}

	/**
	 * Starts the bridge transport when the plugin is running in debug mode.
	 * @returns A promise resolved when startup is complete.
	 */
	public async start(): Promise<void> {
		if (!isDebugMode()) {
			return;
		}

		const uuid = this.#getManifest()?.UUID ?? connection.registrationParameters.info.plugin.uuid;
		try {
			await socket.start(this, uuid);
		} catch (err) {
			logger.warn("Failed to start bridge socket", err);
		}
	}

	/**
	 * Persists settings for a tracked action instance and re-publishes plugin state.
	 * @param params Context and settings to persist.
	 * @returns `true` when the instance was known and the update was sent.
	 */
	async #setSettings(params: SetSettingsParams | undefined): Promise<boolean> {
		const { context, settings } = params ?? {};
		if (typeof context !== "string" || !this.#isJsonObject(settings)) {
			return false;
		}

		const instance = this.#instances.get(context);
		if (!instance) {
			return false;
		}

		await connection.send({
			event: "setSettings",
			context,
			payload: settings,
		});

		// Stream Deck does not echo a didReceiveSettings for setSettings, so update the
		// tracked instance optimistically to keep the published plugin state in sync.
		instance.settings = settings;
		this.#publishChanges();
		return true;
	}

	/**
	 * Determines whether a value is a JSON object.
	 * @param value Value to inspect.
	 * @returns `true` when the value is a non-array object.
	 */
	#isJsonObject(value: unknown): value is JsonObject {
		return typeof value === "object" && value !== null && !Array.isArray(value);
	}

	/**
	 * Gets the name associated with a device identifier.
	 * @param id Device identifier.
	 * @returns Device name when known; otherwise the identifier.
	 */
	#getDeviceName(id: string): string {
		return this.#devices.get(id) ?? id;
	}

	/**
	 * Enqueues a plugin state publication, ensuring notifications are emitted in call order.
	 */
	#publishChanges(): void {
		this.#publishQueue = this.#publishQueue.then(() => this.#doPublish());
	}

	/**
	 * Publishes the current plugin state when it differs from the last emitted state.
	 */
	async #doPublish(): Promise<void> {
		try {
			const pluginState = this.getPluginState();
			const serialized = JSON.stringify(pluginState);

			if (serialized === this.#lastPluginState) {
				return;
			}

			this.#lastPluginState = serialized;
			if (this.#rpc) {
				await this.#rpc.notify("streamDeck.bridge.pluginStateChanged", pluginState);
			}
		} catch {
			// Swallow transport errors to avoid disrupting the plugin;
		}
	}

	/**
	 * Seeds the internal device map from Stream Deck registration parameters.
	 */
	#seedDevices(): void {
		if (this.#seededDevices) {
			return;
		}

		connection.registrationParameters.info.devices.forEach((device) => {
			this.#devices.set(device.id, device.name);
		});

		this.#seededDevices = true;
	}

	/**
	 * Gets the parsed manifest, loading it on first access.
	 * @returns Parsed manifest, or `null` when unavailable.
	 */
	#getManifest(): Manifest | null {
		return (this.#manifest ??= getManifest());
	}
}

/**
 * Singleton bridge adapter.
 */
export const bridge = new BridgeAdapter();

/**
 * Parameters for the `streamDeck.bridge.setSettings` RPC method.
 */
type SetSettingsParams = {
	/**
	 * Context identifier of the action instance to update.
	 */
	context: string;

	/**
	 * Settings to persist for the action instance.
	 */
	settings: JsonObject;
};

/**
 * Serializable state of the plugin's visible actions.
 */
type PluginState = {
	/**
	 * Actions known to the plugin, including currently visible instances.
	 */
	actions: ActionState[];

	/**
	 * Plugin metadata associated with the state.
	 */
	plugin: PluginMetadata;
};

/**
 * State of a manifest action and its currently visible instances.
 */
type ActionState = {
	/**
	 * Visible instances associated with the action.
	 */
	instances: ActionInstanceState[];

	/**
	 * Human-readable action name.
	 */
	name: string;

	/**
	 * Manifest action UUID.
	 */
	uuid: string;
};

/**
 * State of a visible action instance.
 */
type ActionInstanceState = {
	/**
	 * Unique context identifier for the action instance.
	 */
	context: string;

	/**
	 * Controller type associated with the instance.
	 */
	controller: "Encoder" | "Keypad";

	/**
	 * Coordinates associated with the instance.
	 */
	coordinates: Coordinates;

	/**
	 * Name of the device the instance is currently shown on.
	 */
	device: string;

	/**
	 * Determines whether the instance is part of a multi-action.
	 */
	isInMultiAction: boolean;

	/**
	 * Resources associated with the instance.
	 */
	resources: Resources;

	/**
	 * Persisted action settings.
	 */
	settings: JsonObject;
};

/**
 * Serializable plugin metadata exposed by the state.
 */
type PluginMetadata = {
	/**
	 * Human-readable plugin name.
	 */
	name: string;

	/**
	 * Plugin UUID.
	 */
	uuid: string;

	/**
	 * Plugin version.
	 */
	version: string;
};

/**
 * Runtime payload shape used by the bridge for visible action positions.
 */
type PayloadWithCoordinates = {
	/**
	 * Coordinates reported by Stream Deck.
	 */
	coordinates: Coordinates;

	/**
	 * Determines whether the instance is part of a multi-action.
	 */
	isInMultiAction?: boolean;

	/**
	 * Resources associated with the instance.
	 */
	resources?: Resources;
};

/**
 * Internal state of a visible action instance.
 */
type InternalInstanceState = {
	/**
	 * Unique action context identifier.
	 */
	context: string;

	/**
	 * Controller associated with the instance.
	 */
	controller: "Encoder" | "Keypad";

	/**
	 * Coordinates associated with the instance.
	 */
	coordinates: Coordinates;

	/**
	 * Device identifier associated with the instance.
	 */
	deviceId: string;

	/**
	 * Determines whether the instance is part of a multi-action.
	 */
	isInMultiAction: boolean;

	/**
	 * Manifest action UUID associated with the instance.
	 */
	manifestId: string;

	/**
	 * Last known resources associated with the instance.
	 */
	resources: Resources;

	/**
	 * Last known settings associated with the instance.
	 */
	settings: JsonObject;
};
