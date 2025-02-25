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
			.field {
				column-gap: var(--space-xs);
				display: grid;
				grid-template-columns: 95px 240px;
				margin-bottom: var(--space-s);
			}

			.label {
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
			<div class="field">
				<div class="label">
					<sd-label for="input">${this.label ? `${this.label}:` : undefined}</sd-label>
				</div>
				<div>
					<slot id="input"></slot>
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
