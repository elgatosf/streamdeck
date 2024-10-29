import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * Non-visual element that provides information for an option.
 */
@customElement("sd-option")
export class SDOptionElement extends LitElement {
	/**
	 * Determines whether the option is disabled; default `false`.
	 */
	@property({ type: Boolean })
	public accessor disabled: boolean = false;

	/**
	 * Label of the option.
	 * @returns The label.
	 */
	public get label(): string {
		return this.innerText;
	}

	/**
	 * Value of the option.
	 */
	@property()
	public accessor value: string | undefined = undefined;
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Non-visual element that provides information for an option.
		 */
		"sd-option": SDOptionElement;
	}
}
