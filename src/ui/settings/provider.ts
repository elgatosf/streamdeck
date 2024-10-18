import type { JsonObject, JsonValue } from "..";
import type { DidReceiveGlobalSettings, DidReceiveSettings } from "../../api";
import { deferredDisposable } from "../../common/disposable";
import { PromiseCompletionSource } from "../../common/promises";
import { debounce, get, set } from "../../common/utils";
import { connection } from "../connection";

/**
 * Settings provider capable of creating settings that can be monitored and updated.
 */
export class SettingsProvider {
	/**
	 * Name of the event to monitor for receiving settings.
	 */
	#eventName: ReceivedSettingsEvent["event"];

	/**
	 * Promise resolver used to determine when the provider has been initialized.
	 */
	#initialization = new PromiseCompletionSource<void>();

	/**
	 * Function responsible for persisting the settings to Stream Deck.
	 */
	#save: (settings: JsonObject) => Promise<void>;

	/**
	 * Current settings associated with this instance.
	 */
	#settings: JsonObject = {};

	/**
	 * Initializes a new instance of the {@link SettingsProvider} class.
	 * @param eventName Name of the event to monitor for receiving settings.
	 * @param save Function responsible for persisting the settings to Stream Deck.
	 */
	constructor(eventName: ReceivedSettingsEvent["event"], save: (settings: JsonObject) => Promise<void>) {
		this.#eventName = eventName;
		this.#save = save;

		connection.on(this.#eventName, (ev) => (this.#settings = ev.payload.settings));
	}

	/**
	 * Initializes the provider with the specified `settings`.
	 * @param settings Initial settings.
	 */
	public initialize(settings: JsonObject): void {
		this.#settings = settings;
		this.#initialization.setResult();
	}

	/**
	 * Creates a new setting hook for the specified `path`.
	 * @param path Path to the setting, for example `name` or `person.name`.
	 * @param options Options that define how the setting should function.
	 * @returns The setting hook.
	 */
	public use<T extends JsonValue>(path: string, options?: SettingOptions<T>): Setting<T> {
		const { dispose } = options?.onChange
			? connection.disposableOn(this.#eventName, (ev) => options?.onChange?.(get(path, ev.payload.settings) as T))
			: deferredDisposable(() => {});

		const getter = async () => {
			await this.#initialization.promise;
			return get(path, this.#settings) as T;
		};

		const setter = options?.debounceSaveTimeout
			? debounce((value: JsonValue) => this.#set(path, value), options.debounceSaveTimeout)
			: (value?: JsonValue) => this.#set(path, value);

		return {
			dispose,
			get: getter,
			set: setter,
		};
	}

	/**
	 * Sets the value using the specified `path`, on the settings currently associated with this provider.
	 * @param path Path to the setting, for example `name` or `person.name`.
	 * @param value New value of the setting.
	 */
	async #set(path: string, value: JsonValue): Promise<void> {
		await this.#initialization.promise;

		const oldValue = get(path, this.#settings);
		if (oldValue === value) {
			return;
		}

		set(path, this.#settings, value);
		await this.#save(this.#settings);
	}
}

/**
 * Union type of events that indicate settings have been received from Stream Deck.
 */
type ReceivedSettingsEvent = DidReceiveSettings<JsonObject> | DidReceiveGlobalSettings<JsonObject>;

/**
 * Setting persisted within Stream Deck.
 */
export type Setting<T extends JsonValue> = {
	/**
	 * Disposes the setting.
	 */
	dispose(): void;

	/**
	 * Gets the setting value.
	 */
	get(): Promise<T | undefined>;

	/**
	 * Sets the setting value.
	 * @param value New value.
	 */
	set(value: T | undefined): Promise<void>;
};

/**
 * Options that defines how a setting should function.
 */
export type SettingOptions<T extends JsonValue> = {
	/**
	 * Occurs when the setting value changes.
	 * @param value New value.
	 */
	onChange?: (value: T | undefined) => void;

	/**
	 * Optional timeout used to debounce saving the setting to Stream Deck.
	 */
	debounceSaveTimeout?: number;
};
