import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";

import { Input } from "../mixins/input";
import { Labeled } from "../mixins/labeled";
import { type HTMLInputEvent, preventDoubleClickSelection } from "../utils";

/**
 * Element that offers persisting a `boolean` via a toggle switch.
 */
@customElement("sd-switch")
export class SDSwitchElement extends Labeled(Input<boolean>(LitElement)) {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			/**
			 * Container
			 */

			:host {
				display: inline-flex;
			}

			label {
				align-items: center;
				display: inline-flex;
				margin: var(--space-xs) 0;
				outline: none;

				&:focus-visible .track {
					box-shadow: var(--highlight-box-shadow);
					outline: var(--highlight-outline--focus);
					outline-offset: var(--highlight-outline-offset);
				}
			}

			/**
             * Track, thumb, and text
             */

			.track {
				align-items: center;
				background: var(--color-surface-strong);
				border-radius: var(--rounding-full);
				display: inline-flex;
				padding: 0px var(--space-3xs);
				transition: 0.2;
				height: var(--size-m);
				width: var(--size-xl);
				user-select: none;
			}

			.thumb {
				background: var(--color-content-primary);
				border-radius: var(--rounding-full);
				height: var(--size-s);
				transform: translateX(0);
				transition: all 200ms;
				width: var(--size-s);
			}

			.text {
				margin-left: var(--space-xs);
			}

			/**
			 * States
			 */

			input {
				display: none;

				/* Checked */
				&:checked {
					& + .track .thumb {
						transform: translateX(100%);
					}

					&:not(:disabled) {
						& + .track {
							background: var(--color-surface-accent);
						}

						& + .track .thumb {
							background: var(--color-surface-ondark);
						}
					}
				}

				/* Disabled */
				&:disabled {
					& + .track {
						background: var(--color-surface-disabled);
					}

					& + .track .thumb {
						background: var(--color-surface-strong);
					}
				}
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
			<label
				tabindex=${ifDefined(this.disabled ? undefined : 0)}
				@mousedown=${preventDoubleClickSelection}
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

				<div class="track" role="button">
					<div class="thumb"></div>
				</div>

				${this.label && html`<span class="text">${this.label}</span>`}
			</label>
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
