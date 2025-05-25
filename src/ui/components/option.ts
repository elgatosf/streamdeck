import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { Input } from "../mixins/input";
import { Option } from "../mixins/option";

/**
 * Non-visual element that provides information for an option.
 */
@customElement("sd-option")
export class SDOptionElement extends Option(Input(LitElement)) {
	/**
	 * Selected state as specified within HTML; this state is ignored when the element is attached to a `setting`.
	 */
	@property({
		attribute: "selected",
		type: Boolean,
	})
	public accessor htmlSelected: boolean = false;
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Non-visual element that provides information for an option.
		 */
		"sd-option": SDOptionElement;
	}
}
