import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { cls } from "../utils";
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
	 * Current value.
	 */
	@state()
	public accessor value: string[] | string | undefined;

	/**
	 * Placeholder text shown when there is no value.
	 */
	@property()
	public accessor placeholder: string | undefined;

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<div class="container">
				<div>
					<span
						.className=${cls("text", !this.value && "placeholder")}
						@click=${(): void => {
							if (!this.disabled) {
								this.dispatchEvent(new Event("open"));
							}
						}}
					>
						${this.value ? html`<slot></slot>` : this.placeholder}
					</span>
					<sd-button
						icon="close-circle--filled"
						title="Clear"
						.disabled=${this.disabled}
						?hidden=${this.value === undefined}
						@click=${(): void => {
							this.dispatchEvent(new Event("clear"));
						}}
					></sd-button>
				</div>
				<sd-button
					title="Open"
					.disabled=${this.disabled}
					.icon=${this.icon}
					@click=${(): void => {
						this.dispatchEvent(new Event("open"));
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
