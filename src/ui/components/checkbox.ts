import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";

import { Input } from "../mixins/input";
import { type HTMLInputEvent, preventDoubleClickSelection } from "../utils";

/**
 * Element that offers a boolean option in the form of a checkbox.
 */
@customElement("sd-checkbox")
export class SDCheckboxElement extends Input(LitElement) {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			/**
			 * Container
			 */

			label {
				align-items: center;
				display: inline-flex;
				margin: var(--space-xs) 0;
				outline: none;

				&:focus-visible .checkbox {
					box-shadow: var(--highlight-box-shadow);
					outline: var(--highlight-outline--focus);
					outline-offset: var(--highlight-outline-offset);
				}

				&:has(input:disabled) {
					color: var(--color-content-disabled);
				}
			}

			/**
             * Checkbox and text
             */

			.checkbox {
				border: solid 1px var(--color-border-strong);
				border-radius: var(--rounding-m);
				box-sizing: border-box;
				height: var(--size-m);
				margin-right: var(--space-xs);
				width: var(--size-m);
				user-select: none;
			}

			.checkbox > svg {
				visibility: hidden;
			}

			.text {
				margin-right: var(--space-xs);
			}

			/**
             * States
             */

			input {
				display: none;

				/* Checked */
				&:checked + .checkbox {
					border-width: 0;
					background-color: var(--color-surface-accent);
					color: var(--color-content-ondark);

					& > svg {
						visibility: visible;
					}
				}

				/* Disabled */
				&:disabled {
					& + .checkbox {
						border-color: var(--color-border-subtle-disabled);
					}

					&:checked + .checkbox {
						background-color: var(--color-surface-disabled);
						color: var(--color-content-disabled);
					}
				}
			}
		`,
	];

	/**
	 * Initializes a new instance of the {@link SDCheckboxElement} class.
	 */
	constructor() {
		super();
		this.role = "checkbox";
	}

	/**
	 * Gets the checked state.
	 * @returns `true` when the checkbox is checked; otherwise `false`.
	 */
	public get checked(): boolean {
		return !!this.value;
	}

	/**
	 * Sets the checked state.
	 * @param value Value indicating whether the checkbox is checked.
	 */
	public set checked(value: boolean) {
		this.value = value;
	}

	/**
	 * @inheritdoc
	 */
	public override click(): void {
		if (!this.disabled) {
			this.checked = !this.checked;
		}
	}

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<label
				tabindex=${ifDefined(this.disabled ? undefined : 0)}
				@keydown=${(ev: KeyboardEvent): void => {
					// Toggle switch on space bar key.
					if (ev.code === "Space") {
						this.checked = !this.checked;
						ev.preventDefault();
					}
				}}
			>
				<input
					${ref(this.inputRef)}
					type="checkbox"
					.checked=${this.checked}
					.disabled=${this.disabled}
					@change=${(ev: HTMLInputEvent<HTMLInputElement>): void => {
						this.checked = ev.target.checked;
					}}
				/>

				<div class="checkbox" role="checkbox">
					<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M19.78 7.22a.75.75 0 0 1 0 1.06l-9.5 9.5a.75.75 0 0 1-1.06 0l-5-5a.75.75 0 1 1 1.06-1.06l4.47 4.47 8.97-8.97a.75.75 0 0 1 1.06 0Z"
						/>
					</svg>
				</div>

				${this.textContent &&
				html`<span class="text" @mousedown=${preventDoubleClickSelection}>${this.textContent}</span>`}
				<slot hidden @slotchange=${(): void => this.requestUpdate()}></slot>
			</label>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers a boolean option in the form of a checkbox.
		 */
		"sd-checkbox": SDCheckboxElement;
	}
}
