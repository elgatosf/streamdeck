import { css, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { SDRadioElement } from "./radio";

/**
 * Element that offers an option in the form of a radio button.
 */
@customElement("sd-radio-button")
export class SDRadioButtonElement extends SDRadioElement {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		css`
			sd-button {
				display: flex;
			}
		`,
	];

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<sd-button .disabled=${this.disabled} .variant=${this.checked ? "accent" : undefined}>
				<slot></slot>
			</sd-button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers an option in the form of a radio button.
		 */
		"sd-radio-button": SDRadioButtonElement;
	}
}
