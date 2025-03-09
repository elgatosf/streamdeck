import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { openUrl } from "../system";
import { cls } from "../utils";

/**
 * Element that offers a link button, capable of opening a URL in the user's default browser.
 */
@customElement("sd-link")
export class SDLinkElement extends LitElement {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			button {
				background: none;
				border: none;
				border-radius: var(--rounding-m);
				color: var(--color-content-primary);
				cursor: pointer;
				font-family: var(--typography-body-m-family);
				font-size: var(--typography-body-m-size);
				font-weight: var(--typography-body-m-weight);
				line-height: var(--typography-body-m-line-height);
				margin: var(--size-none);
				padding: var(--size-none);
				text-decoration: underline;

				&.accent {
					color: var(--color-content-accent);
				}

				&.quiet {
					text-decoration: none;

					&:hover {
						text-decoration: underline;
					}
				}

				&:disabled {
					color: var(--color-content-disabled);
					cursor: default;
				}

				&:focus-visible {
					box-shadow: var(--highlight-box-shadow);
					outline: var(--highlight-outline--focus);
					outline-offset: var(--highlight-outline-offset);
				}
			}
		`,
	];

	/**
	 * Initializes a new instance of the {@link SDLinkElement} class.
	 */
	constructor() {
		super();
		this.role = "button";
	}

	/**
	 * Determines whether the link is disabled.
	 */
	@property({
		reflect: true,
		type: Boolean,
	})
	public accessor disabled: boolean = false;

	/**
	 * URL to be opened in the user's default browser when the link is activated.
	 */
	@property()
	public accessor href: string | undefined;

	/**
	 * Determines how prominent the link is.
	 */
	@property({ type: Boolean })
	public accessor quiet: boolean = false;

	/**
	 * The link's theme variant.
	 */
	@property()
	public accessor variant: "accent" | "standard" = "standard";

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<button
				class=${cls(this.variant === "accent" && this.variant, this.quiet && "quiet")}
				.disabled=${this.disabled}
				@click=${(): void => {
					if (this.href) {
						openUrl(this.href);
					}
				}}
			>
				<slot></slot>
			</button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers a link button, capable of opening a URL in the user's default browser.
		 */
		"sd-link": SDLinkElement;
	}
}
