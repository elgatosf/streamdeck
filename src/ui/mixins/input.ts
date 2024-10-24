import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import { createRef, type Ref } from "lit/directives/ref.js";

import type { JsonValue } from "..";
import type { Constructor } from "../../common/utils";
import { useGlobalSetting, useSetting } from "../settings";
import type { SettingSignal, SettingSignalOptions } from "../settings/signals";

/**
 * Input mixin that provides common functionality for input elements that persist settings.
 * @param superClass Class the mixin extends.
 * @returns Input mixin class.
 */
export const Input = <TValue extends JsonValue, TBase extends Constructor<LitElement> = typeof LitElement>(
	superClass: TBase,
): Constructor<InputMixin<TValue>> & TBase => {
	/**
	 * Input mixin that provides common functionality for input elements that persist settings.
	 */
	class InputClass extends superClass {
		/**
		 * @inheritdoc
		 */
		public static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

		/**
		 * Enable inputs to work with labels.
		 */
		public static formAssociated = true;

		/**
		 * Initializes a new instance of the {@link InputClass} class.
		 * @param args Constructor arguments.
		 */
		constructor(...args: any[]) {
			super(args);

			this.addEventListener("click", (ev: MouseEvent) => {
				if (this.focusElement.value && ev.target !== document.elementFromPoint(ev.x, ev.y)) {
					this.focusElement.value.click();
					ev.preventDefault();
				}
			});
		}

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
		 * @inheritdoc
		 */
		protected debounceSave: boolean = false;

		/**
		 * @inheritdoc
		 */
		protected focusElement: Ref<HTMLInputElement> = createRef();

		/**
		 * Signal responsible for managing the setting within Stream Deck.
		 */
		#signal: SettingSignal<TValue> | undefined;

		/**
		 * Private backing field for input's value.
		 */
		#value: TValue | undefined;

		/**
		 * Gets the current input value.
		 * @returns The value.
		 */
		public get value(): TValue | undefined {
			return this.#value;
		}

		/**
		 * Sets the current input value.
		 */
		@property({ attribute: false })
		public set value(value: TValue | undefined) {
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
			if (_changedProperties.has("global") || _changedProperties.has("setting")) {
				this.#signal?.dispose();

				// Clear the current setting.
				this.#signal = undefined;
				if (this.setting === undefined) {
					return;
				}

				// Determine the options.
				const options: SettingSignalOptions<TValue> = {
					onChange: (value) => this.#setValue(value),
					debounceSaveTimeout: this.debounceSave ? 200 : undefined,
				};

				// Assign the new setting.
				this.#signal = this.global ? useGlobalSetting(this.setting, options) : useSetting(this.setting, options);
				this.#signal.value.get().then((value) => this.#setValue(value));
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
	public disabled: boolean;

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
	 * Value of the input.
	 */
	public value: T | undefined;

	/**
	 * Determines whether to debounce saving when the value changes.
	 */
	protected debounceSave: boolean;

	/**
	 * Element that will gain focus when an associated label is clicked.
	 */
	protected focusElement: Ref<HTMLInputElement>;
}
