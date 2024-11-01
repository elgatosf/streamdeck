import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { cls } from "../utils";

/**
 * Element that offers a button, allowing a user to activate functionality.
 */
@customElement("sd-button")
export class SDButtonElement extends LitElement {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			:host {
				display: inline-flex;
			}

			button {
				align-items: center;
				background: var(--color-surface);
				border: none;
				border-radius: var(--rounding-m);
				color: var(--color-content-primary);
				display: flex;
				font-family: var(--typography-body-m-family);
				font-size: var(--typography-body-m-size);
				font-weight: var(--typography-body-m-weight);
				height: var(--size-2xl);
				justify-content: center;
				line-height: var(--typography-body-m-line-height);
				outline: none;
				padding: 0 var(--space-s);
				width: 100%;

				&:not(:disabled) {
					&:hover {
						cursor: pointer;
						background: var(--color-surface-hover);
					}

					&.accent,
					&.accent:hover,
					&.accent:active {
						background: var(--color-surface-accent);
						color: var(--color-content-ondark);
					}

					&.danger,
					&.danger:hover,
					&.danger:active {
						background: var(--color-surface-negative);
						color: var(--color-content-onlight);
					}
				}

				&:active {
					background: var(--color-surface-pressed);
				}

				&:focus-visible {
					box-shadow: var(--highlight-box-shadow);
					outline: var(--highlight-outline--focus);
					outline-offset: var(--highlight-outline-offset);
				}

				&:disabled {
					background: var(--color-surface-disabled);
					color: var(--color-content-disabled);
				}
			}
		`,
	];

	/**
	 * Initializes a new instance of the {@link SDButtonElement} class.
	 */
	constructor() {
		super();
		this.role = "button";
	}

	/**
	 * Determines whether the button is disabled; default `false`.
	 */
	@property({
		reflect: true,
		type: Boolean,
	})
	public accessor disabled = false;

	/**
	 * Indicates the type of interaction the user will experience when clicking the button.
	 */
	@property()
	public accessor variant: "accent" | "danger" | undefined = undefined;

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<button
				class=${ifDefined(cls(this.variant === "accent" && "accent", this.variant === "danger" && "danger"))}
				.disabled=${this.disabled}
			>
				<slot></slot>
			</button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers a button, allowing a user to activate functionality.
		 */
		"sd-button": SDButtonElement;
	}
}
