import { css, html, type HTMLTemplateResult, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * Field that identifies an input, or group of inputs.
 */
@customElement("sd-field")
export class SDFieldElement extends LitElement {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		css`
			.sd-field {
				align-items: baseline;
				column-gap: var(--space-xs);
				display: grid;
				grid-template-columns: 95px 262px;
				margin-bottom: var(--space-s);
			}
		`,
	];

	/**
	 * Label to show for the field.
	 */
	@property()
	accessor label: string | undefined = undefined;

	/**
	 * @inheritdoc
	 */
	public render(): HTMLTemplateResult {
		return html`
			<div class="sd-field">
				<div class="sd-field-label">
					<label @click=${this.#focusFirstElement}>${this.label ? this.label + ":" : undefined}</label>
				</div>
				<div class="sd-field-input">
					<slot></slot>
				</div>
			</div>
		`;
	}

	/**
	 * Focuses the first element, that can have focus, within the field.
	 */
	#focusFirstElement(): void {
		for (const el of this.querySelectorAll("*")) {
			if ("focus" in el && typeof el.focus === "function") {
				el.focus();
				return;
			}
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Field that identifies an input, or group of inputs.
		 */
		"sd-field": SDFieldElement;
	}
}
