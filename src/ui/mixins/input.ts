import { LitElement, type PropertyValueMap } from "lit";
import { property } from "lit/decorators.js";

import type { JsonValue } from "..";
import type { Constructor } from "../../common/utils";
import { useGlobalSetting, useSetting } from "../settings";
import type { Setting, SettingOptions } from "../settings/provider";

/**
 * Input mixin that provides common functionality for input elements that persist settings.
 * @param superClass Class the mixin extends.
 * @returns Input mixin class.
 */
export const Input = <TValue extends JsonValue, TBase extends Constructor<LitElement> = typeof LitElement>(
	superClass: TBase,
) => {
	class InputClass extends superClass {
		/**
		 * Setting responsible for managing the value within Stream Deck.
		 */
		#setting: Setting<TValue> | undefined;

		/**
		 * Private backing field for {@link InputClass.value}
		 */
		#value: TValue | undefined;

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
		 * @inheritdoc
		 */
		@property()
		public accessor setting: string | undefined;

		/**
		 * Sets the current input value.
		 */
		@property({ attribute: false })
		set value(value: TValue | undefined) {
			if (this.#setValue(value)) {
				this.#setting?.set(value);
			}
		}

		/**
		 * Gets the current input value.
		 */
		get value(): TValue | undefined {
			return this.#value;
		}

		/**
		 * @inheritdoc
		 */
		protected debounceSave: boolean = false;

		/**
		 * @inheritdoc
		 */
		public override disconnectedCallback(): void {
			this.#setting?.dispose();
			this.#setting = undefined;

			super.disconnectedCallback();
		}

		/**
		 * @inheritdoc
		 */
		protected override willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
			if (_changedProperties.has("global") || _changedProperties.has("setting")) {
				this.#setting?.dispose();

				// Clear the current setting.
				this.#setting = undefined;
				if (this.setting === undefined) {
					return;
				}

				// Determine the options.
				const options: SettingOptions<TValue> = {
					onChange: (value) => this.#setValue(value),
					debounceSaveTimeout: this.debounceSave ? 200 : undefined,
				};

				// Assign the new setting.
				this.#setting = this.global ? useGlobalSetting(this.setting, options) : useSetting(this.setting, options);
				this.#setting.get().then((value) => this.#setValue(value));
			}

			super.willUpdate(_changedProperties);
		}

		/**
		 * Updates the current value, and requests an update if changed.
		 * @param newValue New value.
		 * @returns `true` when the value changed; otherwise `false`.
		 */
		#setValue(newValue: TValue | undefined): boolean {
			if (this.#value == newValue) {
				return false;
			}

			const oldValue = this.#value;
			this.#value = newValue;

			this.requestUpdate("value", oldValue);
			return true;
		}
	}

	return InputClass as unknown as Constructor<InputMixin<TValue>> & TBase;
};

/**
 * Input mixin that provides common functionality for input elements that persist settings.
 */
export declare class InputMixin<T extends JsonValue> {
	/**
	 * Determines whether the input is disabled; default `false`.
	 */
	disabled: boolean;

	/**
	 * When `true`, the setting will be persisted in the global settings, otherwise it will be persisted
	 * in the action's settings; default `false`.
	 */
	global: boolean;

	/**
	 * Path to the setting where the value should be persisted, for example `name`, or `person.name`.
	 */
	setting: string | undefined;

	/**
	 * Current input value.
	 */
	value: T | undefined;

	/**
	 * Determines whether to debounce saving when the value changes.
	 */
	protected debounceSave: boolean;
}
