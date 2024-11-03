import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { parseBoolean, parseNumber } from "../../common/utils";

/**
 * Non-visual element that provides information for an option.
 */
@customElement("sd-option")
export class SDOptionElement extends LitElement {
	/**
	 * Private backing field for {@link SDOptionElement.value}.
	 */
	#value: boolean | number | string | null | undefined = null;

	/**
	 * Determines whether the option is disabled; default `false`.
	 */
	@property({
		reflect: true,
		type: Boolean,
	})
	public accessor disabled: boolean = false;

	/**
	 * Label that represents the option.
	 */
	@property()
	public accessor label: string | undefined;

	/**
	 * Type of the value; allows for the value to be converted to a boolean or number.
	 */
	@property()
	public accessor type: "boolean" | "number" | "string" = "string";

	/**
	 * Untyped value, as defined by the `value` attribute; use `value` property for the typed-value.
	 */
	@property({ attribute: "value" })
	public accessor htmlValue: string | undefined = undefined;

	/**
	 * Value of the option.
	 * @returns The value.
	 */
	public get value(): boolean | number | string | undefined {
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
	public set value(value: boolean | number | string | undefined) {
		this.type = typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : "string";
		this.htmlValue = value?.toString();
	}

	/**
	 * @inheritdoc
	 */
	protected override willUpdate(_changedProperties: Map<PropertyKey, unknown>): void {
		super.willUpdate(_changedProperties);

		if (_changedProperties.has("type") || _changedProperties.has("value")) {
			this.#value = null;
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Non-visual element that provides information for an option.
		 */
		"sd-option": SDOptionElement;
	}
}
