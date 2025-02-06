import { LitElement } from "lit";
import { property } from "lit/decorators.js";

import { type Constructor, parseBoolean, parseNumber } from "../../common/utils";

/**
 * Mixin that provides information for a selectable option.
 * @param superClass Class the mixin extends.
 * @returns The mixin.
 */
export const Option = <TBase extends Constructor<LitElement> = typeof LitElement>(
	superClass: TBase,
): Constructor<SDOptionElement> & TBase => {
	/**
	 * Mixin that provides information for a selectable option.
	 */
	class OptionMixin extends superClass {
		/**
		 * Private backing field for {@link SDOptionElement.typedValue}.
		 */
		#value: boolean | number | string | null | undefined = null;

		/**
		 * @inheritdoc
		 */
		@property()
		public accessor type: "boolean" | "number" | "string" = "string";

		/**
		 * @inheritdoc
		 */
		@property({ attribute: "value" })
		public accessor htmlValue: string | undefined = undefined;

		/**
		 * Value of the option.
		 * @returns The value.
		 */
		public get typedValue(): boolean | number | string | undefined {
			if (this.#value === null) {
				if (this.type === "boolean") {
					this.#value = parseBoolean(this.htmlValue);
				} else if (this.type === "number") {
					this.#value = parseNumber(this.htmlValue);
				} else {
					this.#value = this.htmlValue;
				}
			}

			return this.#value;
		}

		/**
		 * Sets the value of the option, and associated type.
		 * @param value New value.
		 */
		public set typedValue(value: boolean | number | string | undefined) {
			this.type = typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : "string";
			this.htmlValue = value?.toString();
		}

		/**
		 * @inheritdoc
		 */
		protected override update(changedProperties: Map<PropertyKey, unknown>): void {
			super.update(changedProperties);
			this.dispatchEvent(new Event("update"));
		}

		/**
		 * @inheritdoc
		 */
		protected override willUpdate(_changedProperties: Map<PropertyKey, unknown>): void {
			super.willUpdate(_changedProperties);

			if (_changedProperties.has("type") || _changedProperties.has("typedValue")) {
				this.#value = null;
			}
		}
	}

	return OptionMixin as Constructor<SDOptionElement> & TBase;
};

/**
 * Mixin that provides information for a selectable option.
 */
export declare class SDOptionElement extends LitElement {
	/**
	 * Untyped value, as defined by the `value` attribute; use {@link SDOptionElement.typedValue} property
	 * to access the typed-value.
	 */
	public htmlValue: string | undefined;

	/**
	 * Type of the value; allows for the value to be converted to a boolean or number.
	 */
	public type: "boolean" | "number" | "string";

	/**
	 * Typed value, parsed from the {@link SDOptionElement.type} and {@link SDOptionElement.htmlValue}.
	 */
	public typedValue: boolean | number | string | undefined;
}
