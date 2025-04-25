import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * Element that provides a horizontal divider, with an optional label.
 */
@customElement("sd-divider")
export class SDDividerElement extends LitElement {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			.container {
				display: grid;
				align-items: center;
				height: var(--size-xl);
				margin: var(--size-s) 0;
			}

			hr,
			label {
				grid-area: 1 / 1 / 2 / 2; /* Place everything on top of one another */
			}

			hr {
				background-color: var(--color-border-subtle);
				border: none;
				height: 1px;
				width: 100%;
			}

			label {
				align-items: center;
				background: var(--color-page);
				border: 1px solid var(--color-border-subtle);
				border-radius: var(--rounding-full);
				color: var(--color-content-secondary);
				display: flex;
				height: 100%;
				justify-self: center;
				overflow: hidden;
				padding: 0 var(--space-xs);
				max-width: 75%;

				/* Child element allows truncating text within flexbox */
				& span {
					overflow: hidden;
					text-overflow: ellipsis;
					user-select: none;
					white-space: nowrap;
				}
			}
		`,
	];

	/**
	 * Label to show within the divider.
	 */
	@property()
	public accessor label: string | undefined;

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<div class="container">
				<hr />
				${this.label &&
				html`
					<label title=${this.label}>
						<span>${this.label}</span>
					</label>
				`}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that provides a horizontal divider, with an optional label.
		 */
		"sd-divider": SDDividerElement;
	}
}
