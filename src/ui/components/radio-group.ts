import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { MutationController } from "../controllers/mutation-controller";
import { Input } from "../mixins/input";
import { SDRadioElement } from "./radio";

/**
 * Element that offers persisting a value via a list of radio options.
 */
@customElement("sd-radiogroup")
export class SDRadioGroupElement extends Input<boolean | number | string>(LitElement) {
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
	 * Mutation controller that tracks the child radio buttons.
	 */
	readonly #childObserver = new MutationController<SDRadioElement>(
		this,
		(node: Node): node is SDRadioElement => node instanceof SDRadioElement,
		{
			attributes: true,
			attributeFilter: ["disabled"],
			subtree: true,
		},
	);

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html` ${repeat(
			this.#childObserver.nodes,
			(radio) => radio,
			(radio) => html`
				<sd-radio
					name="radio"
					.checked=${this.value === radio.value}
					.label=${radio.label}
					.disabled=${radio.disabled}
					.value=${radio.value}
					@change=${(): void => {
						this.value = radio.value;
					}}
					>${radio.innerText}</sd-radio
				>
			`,
		)}`;
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
