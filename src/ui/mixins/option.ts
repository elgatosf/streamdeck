import { LitElement } from "lit";
import { property, state } from "lit/decorators.js";

import { type Constructor, parseBoolean, parseNumber } from "../../common/utils";

/**
 * Mixin that provides information for a selectable option.
 * @param superClass Class the mixin extends.
 * @returns The mixin.
 */
export const Option = <TBase extends Constructor<LitElement> = typeof LitElement>(
	superClass: TBase,
): Constructor<SDOptionMixin> & TBase => {
	/**
	 * Mixin that provides information for a selectable option.
	 */
	class OptionMixin extends superClass {
		/**
		 * @inheritdoc
		 */
		@state()
		public accessor htmlValue: boolean | number | string | undefined = undefined;

		/**
		 * @inheritdoc
		 */
		@property({ attribute: "value" })
		public accessor htmlValueAsString: string | undefined = undefined;

		/**
		 * @inheritdoc
		 */
		@property()
		public accessor type: "boolean" | "number" | "string" = "string";

		/**
		 * @inheritdoc
		 */
		protected override willUpdate(_changedProperties: Map<PropertyKey, unknown>): void {
			super.willUpdate(_changedProperties);

			if (_changedProperties.has("type") || _changedProperties.has("htmlValueAsString")) {
				const htmlValue =
					this.type === "boolean"
						? parseBoolean(this.htmlValueAsString)
						: this.type === "number"
							? parseNumber(this.htmlValueAsString)
							: this.htmlValueAsString;

				this.#setHtmlValue(htmlValue);
			} else if (_changedProperties.has("htmlValue")) {
				this.#setHtmlValue(this.htmlValue);
			}
		}

		/**
		 * Sets the `htmlValue`, and its associated properties.
		 * @param value New value.
		 */
		#setHtmlValue(value: boolean | number | string | undefined): void {
			this.type = typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : "string";
			this.htmlValue = value;
			this.htmlValueAsString = value?.toString();
		}
	}

	return OptionMixin as Constructor<SDOptionMixin> & TBase;
};

/**
 * Mixin that provides information for a selectable option.
 */
export declare class SDOptionMixin extends LitElement {
	/**
	 * Value as specified within HTML.
	 */
	public htmlValue: boolean | number | string | undefined;

	/**
	 * Raw string value as specified within HTML.
	 */
	public htmlValueAsString: string | undefined;

	/**
	 * Type of the value; allows for the value to be converted to a boolean or number.
	 */
	public type: "boolean" | "number" | "string";
}
