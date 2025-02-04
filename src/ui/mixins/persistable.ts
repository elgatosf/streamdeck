import { LitElement } from "lit";
import { property } from "lit/decorators.js";

import type { JsonValue } from "../../common/json";
import type { Constructor } from "../../common/utils";
import { useGlobalSetting, useSetting } from "../settings";
import type { SettingSignal, SettingSignalOptions } from "../settings/signals";

/**
 * Mixin that provides persisting a value to Stream Deck settings (action / global).
 * @param superClass Class the mixin extends.
 * @returns The mixin.
 */
export const Persistable = <T extends JsonValue, TBase extends Constructor<LitElement> = typeof LitElement>(
	superClass: TBase,
): Constructor<SDPersistableElement<T>> & TBase => {
	/**
	 * Mixin that provides persisting a value to Stream Deck settings (action / global).
	 */
	class PersistableMixin extends superClass {
		/**
		 * @inheritdoc
		 */
		protected debounceSave: boolean = false;

		/**
		 * Signal responsible for managing the setting within Stream Deck.
		 */
		#signal: SettingSignal<T> | undefined;

		/**
		 * Private backing field for the {@link SDPersistableElement.value}.
		 */
		#value: T | undefined;

		/**
		 * @inheritdoc
		 */
		@property({
			reflect: true,
			type: Boolean,
		})
		public accessor disabled = false;

		/**
		 * @inheritdoc
		 */
		@property({ type: Boolean })
		public accessor global = false;

		/**
		 * Gets the current input value.
		 * @returns The value.
		 */
		public get value(): T | undefined {
			return this.#value;
		}

		/**
		 * @inheritdoc
		 */
		@property()
		public accessor setting: string | undefined;

		/**
		 * Sets the current input value.
		 */
		@property({ attribute: false })
		public set value(value: T | undefined) {
			if (this.#setValue(value)) {
				this.#signal?.value?.set(value);
			}
		}

		/**
		 * @inheritdoc
		 */
		public override disconnectedCallback(): void {
			this.#signal?.dispose();
			this.#signal = undefined;

			super.disconnectedCallback();
		}

		/**
		 * @inheritdoc
		 */
		protected override willUpdate(_changedProperties: Map<PropertyKey, unknown>): void {
			super.willUpdate(_changedProperties);

			// When `global` or `setting` has changed, we must update the signal.
			if (_changedProperties.has("global") || _changedProperties.has("setting")) {
				this.#signal?.dispose();

				// Clear the current setting.
				this.#signal = undefined;
				if (this.setting !== undefined) {
					// Determine the options.
					const options: SettingSignalOptions<T> = {
						onChange: (value) => this.#setValue(value),
						debounceSaveTimeout: this.debounceSave ? 200 : undefined,
					};

					// Assign the new setting.
					this.#signal = this.global ? useGlobalSetting(this.setting, options) : useSetting(this.setting, options);
					this.#signal.value.get().then((value) => this.#setValue(value));
				}
			}
		}

		/**
		 * Updates the persisted value, and requests an update if changed.
		 * @param newValue New value.
		 * @returns `true` when the value changed; otherwise `false`.
		 */
		#setValue(newValue: T | undefined): boolean {
			if (this.#value === newValue) {
				return false;
			}

			const oldValue = this.#value;
			this.#value = newValue;

			this.requestUpdate("value", oldValue);
			return true;
		}
	}

	return PersistableMixin as unknown as Constructor<SDPersistableElement<T>> & TBase;
};

/**
 * Mixin that provides persisting a value to Stream Deck settings (action / global).
 */
export declare class SDPersistableElement<T extends JsonValue> extends LitElement {
	/**
	 * When `true`, the setting will be persisted in the global settings, otherwise it will be persisted
	 * in the action's settings; default `false`.
	 */
	public global: boolean;

	/**
	 * Path to the setting where the value should be persisted, for example `name`.
	 */
	public setting: string | undefined;

	/**
	 * The value of the element; this is persisted when a {@link SDPersistableElement.setting} is specified.
	 */
	public value: T | undefined;

	/**
	 * Determines whether to debounce saving when the value changes.
	 */
	protected debounceSave: boolean;
}
