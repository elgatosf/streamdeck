import { css, html, type HTMLTemplateResult, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * Element that provides a label for placeholder containing an input.
 */
@customElement("sd-field")
export class SDFieldElement extends LitElement {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		css`
			.sd-field {
				column-gap: var(--space-xs);
				display: grid;
				grid-template-columns: 95px 262px;
				margin-bottom: var(--space-s);
				min-height: 32px;
			}
			.sd-field-label {
				padding-top: var(--space-xs);
			}
			.sd-field-input {
				align-items: center;
				display: flex;
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
					<sd-label @click=${this.#focusFirstElement}>${this.label ? `${this.label}:` : undefined}</sd-label>
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
		 * Element that provides a label for placeholder containing an input.
		 */
		"sd-field": SDFieldElement;
	}
}
