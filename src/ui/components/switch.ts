import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { Input } from "../mixins/input";
import type { HTMLInputEvent } from "../utils";

/**
 * Element that offers persisting a `boolean` via a toggle switch.
 */
@customElement("sd-switch")
export class SDSwitchElement extends Input<boolean>(LitElement) {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			/**
             * Track
             */

			label {
				align-items: center;
				background: var(--color-surface-strong);
				border: solid var(--border-width-thick) var(--color-page);
				border-radius: var(--rounding-full);
				cursor: pointer;
				display: inline-flex;
				margin: var(--space-xs) var(--space-2xs) var(--space-xs) calc(var(--border-width-thick) * -1);
				padding: 0px var(--space-3xs);
				transition: 0.2;
				height: var(--size-m);
				width: var(--size-xl);
				user-select: none;
			}

			label[aria-disabled="false"]:has(input:checked) {
				background: var(--color-surface-accent);
			}

			label[aria-disabled="true"] {
				cursor: default;
				background: var(--color-surface-disabled);
			}

			label:focus {
				outline: solid var(--border-width-thick) var(--color-surface-accent);
			}

			input {
				display: none;
			}

			/**
             * Thumb
             */

			.thumb {
				background: var(--color-content-primary);
				border: none;
				outline: none;
				border-radius: var(--rounding-full);
				height: var(--size-s);
				transform: translateX(0);
				transition: all 200ms;
				width: var(--size-s);
			}

			input:checked + .thumb {
				transform: translateX(100%);
			}

			label[aria-disabled="false"] .thumb {
				background: var(--color-surface-ondark);
			}

			label[aria-disabled="true"] .thumb {
				background: var(--color-surface-strong);
			}
		`,
	];

	/**
	 * Gets the on/off state of the switch.
	 * @returns Whether the switch is on/off.
	 */
	public get on(): boolean {
		return !!this.value;
	}

	/**
	 * Sets the on/off state of the switch.
	 * @param value The on/off state.
	 */
	public set on(value: boolean) {
		this.value = value;
	}

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<label
				aria-checked=${this.on}
				aria-disabled=${this.disabled}
				tabindex=${ifDefined(this.disabled ? undefined : 0)}
				@keydown=${(ev: KeyboardEvent) => {
					if (ev.code === "Space") {
						this.on = !this.on;
					}
				}}
			>
				<input
					type="checkbox"
					value=${ifDefined(this.setting)}
					.checked=${this.value || false}
					.disabled=${this.disabled}
					@change=${(ev: HTMLInputEvent<HTMLInputElement>) => {
						this.on = ev.target.checked;
					}}
				/>
				<div class="thumb" role="button" aria-pressed=${this.on}></div>
			</label>
		`;
	}

	/**
	 * @inheritdoc
	 */
	public override focus(): void {
		this.on = !this.on;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting a `boolean` via a toggle switch.
		 */
		"sd-switch": SDSwitchElement;
	}
}
