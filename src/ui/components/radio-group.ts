import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, queryAssignedElements } from "lit/decorators.js";

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
	 * Radio buttons associated with this group.
	 */
	@queryAssignedElements({ selector: "sd-radio" })
	accessor #radioButtons!: Array<SDRadioElement>;

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<slot
				@change=${(ev: Event): void => {
					if (ev.target instanceof SDRadioElement) {
						this.value = ev.target.value;
					}
				}}
				@slotchange=${(): void => this.#setRadioButtonProperties()}
			></slot>
		`;
	}

	/**
	 * @inheritdoc
	 */
	protected override willUpdate(_changedProperties: Map<PropertyKey, unknown>): void {
		super.willUpdate(_changedProperties);

		// Reflect the necessary properties of the radio group, to its radio buttons.
		if (_changedProperties.has("disabled") || _changedProperties.has("value")) {
			const disabled = _changedProperties.get("disabled") !== undefined ? this.disabled : undefined;
			this.#setRadioButtonProperties(disabled);
		}
	}

	/**
	 * Sets the properties of the child radio buttons, based on this parent group.
	 * @param disabled Determines the disabled state of all radio buttons; ignored when `undefined`.
	 */
	#setRadioButtonProperties(disabled?: boolean): void {
		for (const radioButton of this.#radioButtons) {
			radioButton.name = "__radio"; // Radio buttons are scoped to this shadow root.
			radioButton.checked = this.value === radioButton.value;

			if (disabled !== undefined) {
				radioButton.disabled = disabled;
			}
		}
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
