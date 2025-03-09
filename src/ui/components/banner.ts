import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * Element that displays prominent information, with optional theming and dismiss button.
 */
@customElement("sd-banner")
export class SDBannerElement extends LitElement {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			article {
				--banner-border-color: var(--color-border-subtle);
				--banner-icon-color: var(--color-content-primary);
				border: var(--border-width-thin) solid var(--banner-border-color);
				border-radius: var(--rounding-m);
				color: var(--color-content-secondary);
				display: flex;
				gap: var(--space-xs);
				margin-bottom: var(--space-xs);
				padding: var(--space-xs);
			}

			.danger {
				--banner-border-color: var(--color-border-negative);
				--banner-icon-color: var(--color-content-negative);
			}

			.info {
				--banner-border-color: var(--color-border-info);
				--banner-icon-color: var(--color-content-info);
			}

			.success {
				--banner-border-color: var(--color-border-positive);
				--banner-icon-color: var(--color-content-positive);
			}

			.warning {
				--banner-border-color: var(--color-border-warning);
				--banner-icon-color: var(--color-content-warning);
			}

			.icon {
				color: var(--banner-icon-color);
			}

			.content {
				display: grid;
				flex: 1;
				gap: var(--size-2xs);

				& .header {
					color: var(--color-content-primary);
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}

			.dismiss {
				--typography-body-m-line-height: 0px;
			}
		`,
	];

	/**
	 * Determines whether the banner is dismissible.
	 */
	@property({
		type: Boolean,
	})
	public accessor dismissible: boolean | undefined = false;

	/**
	 * Header text.
	 */
	@property()
	public accessor header: string | undefined;

	/**
	 * The theme of the banner.
	 */
	@property()
	public accessor variant: Variant = "default";

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		const { name, icon } = variants.find(({ name }) => name === this.variant) ?? defaultVariant;

		return html`
			<article class=${name}>
				<sd-icon class="icon" type=${icon} size="s"></sd-icon>
				<div class="content">
					${this.header ? html`<div class="header" title=${this.header}>${this.header}</div>` : undefined}
					<slot></slot>
					<slot name="action"></slot>
				</div>
				${this.dismissible
					? html`
							<sd-link
								class="dismiss"
								@click=${(): void => {
									this.hidden = true;
								}}
							>
								<sd-icon type="close" size="s"></sd-icon>
							</sd-link>
						`
					: undefined}
			</article>
		`;
	}
}

const defaultVariant = {
	name: "default",
	icon: "info",
} as const;

const variants = [
	{
		name: "danger",
		icon: "warning",
	},
	{
		name: "info",
		icon: "info",
	},
	{
		name: "success",
		icon: "checkmark",
	},
	{
		name: "warning",
		icon: "warning",
	},
	defaultVariant,
] as const;

/**
 * Banner variant (theme).
 */
type Variant = (typeof variants)[number]["name"];

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that displays prominent information, with optional theming and dismiss button.
		 */
		"sd-banner": SDBannerElement;
	}
}
