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
			::slotted(sd-radio) {
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
	);

	/**
	 * Handles a child radio button changing.
	 * @param ev Source event.
	 */
	readonly #handleChildChanged = (ev: Event): void => {
		if (ev.target instanceof SDRadioElement) {
			this.value = ev.target.value;
		} else {
			console.warn("Unrecognized change event in SDRadioGroupElement", ev);
		}
	};

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			${repeat(
				this.#childObserver.nodes,
				(opt) => opt,
				(opt, i) => {
					opt.addEventListener("change", this.#handleChildChanged);
					opt.checked = this.value === opt.value;
					opt.name = "radio";
					opt.slot = i.toString();

					return html`<slot name=${i}></slot>`;
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
