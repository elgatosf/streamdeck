import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import { Input } from "../mixins/input";
import { Option } from "../mixins/option";

/**
 * Non-visual element that provides information for an option.
 */
@customElement("sd-option")
export class SDOptionElement extends Option(Input(LitElement)) {
	// Empty element, used by sd-select to render options.
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Non-visual element that provides information for an option.
		 */
		"sd-option": SDOptionElement;
	}
}
