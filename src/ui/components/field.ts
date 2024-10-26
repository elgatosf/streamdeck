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
			}
			.sd-field-label {
				align-items: center;
				display: flex;
				height: var(--size-2xl);
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
					<sd-label for="__input">${this.label ? `${this.label}:` : undefined}</sd-label>
				</div>
				<div class="sd-field-input">
					<slot id="__input"></slot>
				</div>
			</div>
		`;
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
