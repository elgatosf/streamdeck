import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { Input } from "../mixins/input";
import { List } from "../mixins/list";
import { SDRadioElement } from "./radio";

/**
 * Element that offers persisting a value via a list of radio options.
 */
@customElement("sd-radiogroup")
export class SDRadioGroupElement extends List(Input<boolean | number | string>(LitElement)) {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		...SDRadioElement.styles,
		css`
			sd-radio {
				display: flex;
			}
		`,
	];

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			${repeat(
				this.items,
				(opt) => opt,
				(opt) => {
					return html`<sd-radio
						name="__radio"
						.checked=${this.value === opt.value}
						.disabled=${opt.disabled}
						.label=${opt.label}
						.value=${opt.value}
						@change=${() => {
							this.value = opt.value;
						}}
						>${opt.innerText}</sd-radio
					>`;
				},
			)}
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting a value via a list of radio options.
		 */
		"sd-radiogroup": SDRadioGroupElement;
	}
}
