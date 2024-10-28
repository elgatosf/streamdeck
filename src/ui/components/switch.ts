import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";

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
			 * Containers
			 */

			sd-label {
				outline: none;
			}

			.container {
				align-items: center;
				display: inline-flex;
			}

			input {
				display: none;
			}

			/**
             * Track
             */

			.track {
				align-items: center;
				background: var(--color-surface-strong);
				border-radius: var(--rounding-full);
				cursor: pointer;
				display: inline-flex;
				margin: var(--space-xs) var(--space-xs) var(--space-xs) 0;
				padding: 0px var(--space-3xs);
				transition: 0.2;
				height: var(--size-m);
				width: var(--size-xl);
				user-select: none;
			}

			sd-label[aria-disabled="false"]:has(input:checked) .track {
				background: var(--color-surface-accent);
			}

			sd-label[aria-disabled="true"] .track {
				background: var(--color-surface-disabled);
				cursor: default;
			}

			sd-label:focus-visible .track {
				box-shadow: var(--highlight-box-shadow);
				outline: var(--highlight-outline--focus);
				outline-offset: var(--highlight-outline-offset);
			}

			/**
             * Thumb
             */

			.thumb {
				background: var(--color-content-primary);
				border-radius: var(--rounding-full);
				height: var(--size-s);
				transform: translateX(0);
				transition: all 200ms;
				width: var(--size-s);
			}

			sd-label:has(input:checked) .thumb {
				transform: translateX(100%);
			}

			sd-label[aria-disabled="false"] .thumb {
				background: var(--color-surface-ondark);
			}

			sd-label[aria-disabled="true"] .thumb {
				background: var(--color-surface-strong);
			}
		`,
	];

	/**
	 * Initializes a new instance of the {@link SDSwitchElement} class.
	 */
	constructor() {
		super();
		this.role = "checkbox";
	}

	/**
	 * Gets the on/off state of the switch.
	 * @returns Whether the switch is on/off.
	 */
	public get isOn(): boolean {
		return !!this.value;
	}

	/**
	 * Sets the on/off state of the switch.
	 * @param value The on/off state.
	 */
	@property({
		attribute: "on",
		type: Boolean,
	})
	public set isOn(value: boolean) {
		this.value = value;
	}

	/**
	 * Label of the switch.
	 */
	@property()
	public accessor label: string | undefined;

	/**
	 * @inheritdoc
	 */
	public override click(): void {
		if (!this.disabled) {
			this.isOn = !this.isOn;
		}
	}

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<sd-label
				aria-disabled=${this.disabled}
				tabindex=${ifDefined(this.disabled ? undefined : 0)}
				@keydown=${(ev: KeyboardEvent): void => {
					// Toggle switch on space bar key.
					if (ev.code === "Space") {
						this.isOn = !this.isOn;
						ev.preventDefault();
					}
				}}
			>
				<input
					${ref(this.inputRef)}
					type="checkbox"
					value=${ifDefined(this.setting)}
					.checked=${this.isOn}
					.disabled=${this.disabled}
					@change=${(ev: HTMLInputEvent<HTMLInputElement>): void => {
						this.isOn = ev.target.checked;
					}}
				/>
				<div class="container">
					<div class="track" role="button">
						<div class="thumb"></div>
					</div>
					${this.label}
				</div>
			</sd-label>
		`;
	}

	/**
	 * @inheritdoc
	 */
	protected override willUpdate(_changedProperties: Map<PropertyKey, unknown>): void {
		super.willUpdate(_changedProperties);
		this.ariaChecked = this.isOn ? "checked" : null;
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
