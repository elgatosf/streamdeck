import type { IDisposable, JsonObject, JsonValue } from "@elgato/utils";
import { createRpcServerClient, type RpcSender } from "@elgato/utils/rpc";

import type {
	DeviceDidChange,
	DeviceDidConnect,
	DidReceiveSettings,
	Manifest,
	WillAppear,
	WillDisappear,
} from "../../api/index.js";
import { isDebugMode } from "../common/utils.js";
import { connection } from "../connection.js";
import { logger } from "../logging/index.js";
import { getManifest } from "../manifest.js";
import { debugSocket } from "./socket.js";

/**
 * Internal JSON-RPC adapter that projects connection events into a serialized debug state snapshot.
 */
class DebugAdapter {
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
	 * Last serialized snapshot emitted by the adapter.
	 */
	#lastSnapshot: string;

	/**
	 * Determines whether registration devices have been seeded into the internal device map.
	 */
	#seededDevices = false;

	/**
	 * Initializes a new debug adapter instance.
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

				instance.controller = ev.payload.controller;
				instance.deviceId = ev.device;
				instance.position = this.#toPosition(ev.payload);
				instance.settings = ev.payload.settings;
				this.#publishChanges();
			}),
		);
		this.#disposables.push(
			connection.disposableOn("willAppear", (ev: WillAppear<JsonObject>) => {
				this.#instances.set(ev.context, {
					context: ev.context,
					controller: ev.payload.controller,
					deviceId: ev.device,
					manifestId: ev.action,
					position: this.#toPosition(ev.payload),
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

		this.#lastSnapshot = JSON.stringify(this.getSnapshot());
	}

	/**
	 * Attaches an RPC transport to the adapter.
	 * @param send Function responsible for sending JSON-RPC requests and responses.
	 */
	public attachRpc(send: RpcSender): void {
		this.#rpc = createRpcServerClient(send);
		this.#rpc.addMethod("streamDeck.debug.getSnapshot", () => this.getSnapshot());
		this.#rpc.addMethod<SetSettingsParams>("streamDeck.debug.setSettings", (params) => this.#setSettings(params));
	}

	/**
	 * Disposes the adapter and unregisters all connection listeners.
	 */
	public dispose(): void {
		this.#disposables.forEach((disposable) => disposable.dispose());
	}

	/**
	 * Builds the current debug state snapshot.
	 * @returns Current debug state snapshot.
	 */
	public getSnapshot(): DebugSnapshot {
		this.#seedDevices();

		const manifestActions = this.#getManifest()?.Actions ?? [];
		const groups = new Map<string, DebugActionState>();

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
				device: this.#getDeviceName(instance.deviceId),
				position: instance.position,
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
	 * Starts the adapter's debug transport when the plugin is running in debug mode.
	 * @returns A promise resolved when startup is complete.
	 */
	public async start(): Promise<void> {
		if (!isDebugMode()) {
			return;
		}

		const uuid = this.#getManifest()?.UUID ?? connection.registrationParameters.info.plugin.uuid;
		try {
			await debugSocket.start(this, uuid);
		} catch (err) {
			logger.warn("Failed to start debug socket", err);
		}
	}

	/**
	 * Persists settings for a tracked action instance and re-publishes the snapshot.
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
		// tracked instance optimistically to keep the published snapshot in sync.
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
	 * Schedules publication of the latest snapshot when it changed.
	 */
	#publishChanges(): void {
		this.#notifyIfChanged();
	}

	/**
	 * Publishes the current snapshot when it differs from the last emitted state.
	 */
	async #notifyIfChanged(): Promise<void> {
		const snapshot = this.getSnapshot();
		const serialized = JSON.stringify(snapshot);

		if (serialized === this.#lastSnapshot) {
			return;
		}

		this.#lastSnapshot = serialized;
		if (this.#rpc) {
			await this.#rpc.notify("streamDeck.debug.snapshotChanged", snapshot);
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

	/**
	 * Converts raw Stream Deck payload coordinates into a normalized position object.
	 * @param payload Action payload associated with a visible instance.
	 * @returns Normalized position snapshot.
	 */
	#toPosition(payload: DidReceiveSettings<JsonObject>["payload"] | WillAppear<JsonObject>["payload"]): DebugPosition {
		if (payload.controller === "Encoder") {
			return {
				column: payload.coordinates.column,
				index: payload.coordinates.column,
				kind: "dial",
				row: payload.coordinates.row,
			};
		}

		if (payload.isInMultiAction) {
			return {
				kind: "multi-action",
			};
		}

		return {
			column: payload.coordinates.column,
			kind: "key",
			row: payload.coordinates.row,
		};
	}
}

/**
 * Singleton internal debug adapter.
 */
export const debug = new DebugAdapter();

/**
 * Parameters for the `streamDeck.debug.setSettings` RPC method.
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
 * Serializable snapshot of the plugin's debug state.
 */
type DebugSnapshot = {
	/**
	 * Actions known to the plugin, including currently visible instances.
	 */
	actions: DebugActionState[];

	/**
	 * Plugin metadata associated with the snapshot.
	 */
	plugin: DebugPluginState;
};

/**
 * Snapshot of a manifest action and its currently visible instances.
 */
type DebugActionState = {
	/**
	 * Visible instances associated with the action.
	 */
	instances: DebugActionInstanceState[];

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
 * Snapshot of a visible action instance.
 */
type DebugActionInstanceState = {
	/**
	 * Unique context identifier for the action instance.
	 */
	context: string;

	/**
	 * Controller type associated with the instance.
	 */
	controller: "Encoder" | "Keypad";

	/**
	 * Name of the device the instance is currently shown on.
	 */
	device: string;

	/**
	 * Normalized position information for the instance.
	 */
	position: DebugPosition;

	/**
	 * Persisted action settings.
	 */
	settings: JsonObject;
};

/**
 * Serializable plugin information exposed by the debug state snapshot.
 */
type DebugPluginState = {
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
 * Normalized position associated with an action instance.
 */
type DebugPosition =
	| {
		/**
		 * Dial column reported by Stream Deck.
		 */
		column: number;

		/**
		 * Position kind for encoder instances.
		 */
		kind: "dial";

		/**
		 * Dial index used for extension-side display.
		 */
		index: number;

		/**
		 * Dial row reported by Stream Deck.
		 */
		row: number;
	}
	| {
		/**
		 * Key column reported by Stream Deck.
		 */
		column: number;

		/**
		 * Position kind for keypad instances.
		 */
		kind: "key";

		/**
		 * Key row reported by Stream Deck.
		 */
		row: number;
	}
	| {
		/**
		 * Position kind for keypad multi-action instances.
		 */
		kind: "multi-action";
	};

/**
 * Internal snapshot of a visible action instance.
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
	 * Device identifier associated with the instance.
	 */
	deviceId: string;

	/**
	 * Manifest action UUID associated with the instance.
	 */
	manifestId: string;

	/**
	 * Normalized position for the instance.
	 */
	position: DebugPosition;

	/**
	 * Last known settings associated with the instance.
	 */
	settings: JsonObject;
};

