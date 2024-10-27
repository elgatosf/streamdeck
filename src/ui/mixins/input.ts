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
		 * Enable inputs to work with labels.
		 */
		public static formAssociated = true;

		/**
		 * @inheritdoc
		 */
		public static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

		/**
		 * @inheritdoc
		 */
		protected debounceSave: boolean = false;

		/**
		 * @inheritdoc
		 */
		protected inputRef: Ref<HTMLInputElement> = createRef();

		/**
		 * @inheritdoc
		 */
		protected internals: ElementInternals;

		/**
		 * Signal responsible for managing the setting within Stream Deck.
		 */
		#signal: SettingSignal<TValue> | undefined;

		/**
		 * Private backing field for input's value.
		 */
		#value: TValue | undefined;

		/**
		 * Initializes a new instance of the {@link InputMixin} class.
		 * @param args Constructor arguments.
		 */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		constructor(...args: any[]) {
			super(args);

			// Register a click handler for native labels.
			this.internals = this.attachInternals();
			this.addEventListener("click", (ev: MouseEvent) => {
				const source = document.elementFromPoint(ev.x, ev.y);
				if (source?.tagName === "LABEL") {
					for (const label of this.internals.labels) {
						if (source === label) {
							this.activate();
							return;
						}
					}
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
		public activate(): void {
			// Blur the active element first.
			if (document.activeElement && document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}

			// Proxy the click to the delegate.
			if (this.inputRef.value) {
				switch (this.internals.role) {
					case "checkbox":
						this.inputRef.value.click();
						break;
					default:
						this.inputRef.value.focus();
						break;
				}
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
			this.internals.ariaDisabled = this.disabled ? "disabled" : null;

			// When `global` or `setting` has changed, we must update the signal.
			if (_changedProperties.has("global") || _changedProperties.has("setting")) {
				this.#signal?.dispose();

				// Clear the current setting.
				this.#signal = undefined;
				if (this.setting !== undefined) {
					// Determine the options.
					const options: SettingSignalOptions<TValue> = {
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
	 * Element that represents the primary input element.
	 */
	protected inputRef: Ref<HTMLInputElement>;

	/**
	 * Element internals that allow for configuring how the element interacts with forms.
	 */
	protected internals: ElementInternals;

	/**
	 * Activates the element; activation behavior is dependent on the role of the element, for example when the element
	 * is a `"checkbox"`, it is clicked, whereas a text input gains focus.
	 */
	public activate(): void;
}

/**
 * Determines whether the specified element is activable.
 * @param elem Element to check.
 * @returns `true` when the element can be activated; otherwise `false`.
 */
export function isActivable(elem: Element): elem is ActivableElement & HTMLElement {
	return elem instanceof HTMLElement && "activate" in elem && typeof elem.activate === "function";
}

/**
 * Element that can be activated.
 */
export type ActivableElement = {
	/**
	 * Activates the element; activation behavior is dependent on the role of the element, for example when the element
	 * is a `"checkbox"`, it is clicked, whereas a text input gains focus.
	 */
	activate(): void;
};
