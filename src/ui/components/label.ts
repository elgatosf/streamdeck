import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

/**
 * Element that provides a label for input element.
 */
@customElement("sd-label")
export class SDLabelElement extends LitElement {
	/**
	 * Identifier of the element the label is for.
	 */
	@property({ attribute: "for" })
	public accessor htmlFor: string | undefined;

	/**
	 * @inheritdoc
	 */
	public override render() {
		return html`<label
			for=${ifDefined(this.htmlFor)}
			@mousedown=${(ev: MouseEvent) => {
				// Focus the element, if we can.
				if (this.htmlFor) {
					const element = document.getElementById(this.htmlFor);
					element?.focus();
				}

				// Disable text selection on double-click.
				if (ev.detail > 1) {
					ev.preventDefault();
				}
			}}
			><slot></slot
		></label>`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that provides a label for input element.
		 */
		"sd-label": SDLabelElement;
	}
}
