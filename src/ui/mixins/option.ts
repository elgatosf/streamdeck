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
): Constructor<SDOptionMixin> & TBase => {
	/**
	 * Mixin that provides information for a selectable option.
	 */
	class OptionMixin extends superClass {
		/**
		 * Private backing field for `htmlValue`.
		 */
		#htmlValue: boolean | number | string | null | undefined = null;

		/**
		 * Value as specified within HTML.
		 * @returns The value.
		 */
		public get htmlValue(): boolean | number | string | undefined {
			if (this.#htmlValue === null) {
				if (this.type === "boolean") {
					this.#htmlValue = parseBoolean(this.htmlValueAsString);
				} else if (this.type === "number") {
					this.#htmlValue = parseNumber(this.htmlValueAsString);
				} else {
					this.#htmlValue = this.htmlValueAsString;
				}
			}

			return this.#htmlValue;
		}

		/**
		 * Value as specified within HTML.
		 * @param value New value.
		 */
		@property({ attribute: false })
		public set htmlValue(value: boolean | number | string | undefined) {
			this.#htmlValue = value;

			this.type = typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : "string";
			this.htmlValueAsString = value?.toString();
		}

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
				switch (this.type) {
					case "boolean":
						this.htmlValue = parseBoolean(this.htmlValueAsString);
						break;

					case "number":
						this.htmlValue = parseNumber(this.htmlValueAsString);
						break;

					default:
						this.htmlValue = this.htmlValueAsString;
						break;
				}
			}
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
