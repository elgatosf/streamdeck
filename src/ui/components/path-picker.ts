import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { cls } from "../utils";
import { fixDirectorySeparatorChar } from "../utils/os";
import type { Icon } from "./icon";

/**
 * Element that provides a canvas for picking a path from a delegate dialog.
 * @internal
 */
@customElement("sd-path-picker")
export class SDPickerElement extends LitElement {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			.container {
				display: flex;
				gap: var(--space-2xs);
				user-select: none;

				& div {
					align-items: center;
					background: var(--color-surface);
					border-radius: var(--rounding-m);
					display: flex;
					height: var(--size-2xl);
					padding: 0 var(--size-xs);
					flex-grow: 1;
					min-width: 0;
					padding: 0 0 0 var(--space-xs);

					& span {
						flex-grow: 1;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				}
			}

			.placeholder {
				color: var(--color-content-secondary);
			}

			:host([disabled]) .text {
				color: var(--color-content-disabled);
			}
		`,
	];

	/**
	 * Determines whether the picker is disabled; default `false`.
	 */
	@property({
		reflect: true,
		type: Boolean,
	})
	public accessor disabled = false;

	/**
	 * Icon shown next to the picker.
	 */
	@property()
	public accessor icon: Icon = "file";

	/**
	 * Format used to render the current path.
	 */
	@property()
	public accessor format: "full" | "name" = "full";

	/**
	 * Current path.
	 */
	@property()
	public accessor path: string | undefined;

	/**
	 * Placeholder text shown when there is no path.
	 */
	@property()
	public accessor placeholder: string | undefined;

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		const path = this.format === "full" ? fixDirectorySeparatorChar(this.path) : this.path?.split("/")?.pop();

		return html`
			<div class="container">
				<slot hidden></slot>
				<div>
					<span
						.className=${cls("text", !this.path && "placeholder")}
						title=${ifDefined(fixDirectorySeparatorChar(this.path))}
						@click=${(): void => {
							if (!this.disabled) {
								this.dispatchEvent(new Event("show"));
							}
						}}
					>
						${path ?? this.placeholder}
					</span>
					<sd-button
						.disabled=${this.disabled}
						icon="close-circle--filled"
						@click=${(): void => {
							this.dispatchEvent(new Event("clear"));
						}}
					></sd-button>
				</div>
				<sd-button
					.disabled=${this.disabled}
					.icon=${this.icon}
					@click=${(): void => {
						this.dispatchEvent(new Event("show"));
					}}
				></sd-button>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that provides a canvas for picking a path from a delegate dialog.
		 */
		"sd-picker": SDPickerElement;
	}
}
