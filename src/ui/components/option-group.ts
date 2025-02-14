import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * Non-visual element that provides a grouping of options.
 */
@customElement("sd-option-group")
export class SDOptionGroupElement extends LitElement {
	/**
	 * Determines whether the group of options is disabled; default `false`.
	 */
	@property({
		reflect: true,
		type: Boolean,
	})
	public accessor disabled: boolean = false;

	/**
	 * Name of the group of options.
	 */
	@property()
	public accessor label: string | undefined;
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Non-visual element that provides a grouping of options.
		 */
		"sd-option-group": SDOptionGroupElement;
	}
}
