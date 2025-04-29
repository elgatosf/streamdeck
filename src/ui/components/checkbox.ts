import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";

import { Input } from "../mixins/input";
import { Option } from "../mixins/option";
import { Persistable } from "../mixins/persistable";
import { type HTMLEvent, preventDoubleClickSelection } from "../utils";

/**
 * Element that offers persisting a value via a checkbox.
 */
@customElement("sd-checkbox")
export class SDCheckboxElement extends Option(Input(Persistable<boolean | number | string>(LitElement))) {
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

			:host([hidden]) {
				display: none;
			}

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
             * Checkbox and slot
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
	 * Visual element that represents the checkbox.
	 */
	static readonly #visualElement = html`
		<div class="checkbox" role="checkbox">
			<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 24 24">
				<path
					d="M19.78 7.22a.75.75 0 0 1 0 1.06l-9.5 9.5a.75.75 0 0 1-1.06 0l-5-5a.75.75 0 1 1 1.06-1.06l4.47 4.47 8.97-8.97a.75.75 0 0 1 1.06 0Z"
				/>
			</svg>
		</div>
	`;

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
		if (this.setting === undefined) {
			return this.htmlChecked;
		}

		if (this.value === undefined) {
			return false;
		}

		if (this.htmlValue !== undefined || typeof this.value !== "boolean") {
			return this.value === this.htmlValue;
		}

		return !!this.value;
	}

	/**
	 * Sets the checked state.
	 * @param value Value indicating whether the checkbox is checked.
	 */
	public set checked(value: boolean) {
		this.htmlChecked = value;
		if (this.htmlValue) {
			this.value = value ? this.htmlValue : undefined;
		} else {
			this.value = value;
		}
	}

	/**
	 * Checked state as specified within HTML; this state is ignored when the element is attached to a `setting`.
	 */
	@property({
		attribute: "checked",
		reflect: true,
		type: Boolean,
	})
	public accessor htmlChecked: boolean = false;

	/**
	 * Gets the visual element that represents the checkbox.
	 * @returns The element.
	 */
	protected get visualElement(): unknown {
		return SDCheckboxElement.#visualElement;
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
				${ref(this.inputRef)}
				tabindex=${ifDefined(this.disabled ? undefined : 0)}
				@mousedown=${preventDoubleClickSelection}
				@keydown=${(ev: KeyboardEvent): void => {
					// Toggle switch on space bar key.
					if (ev.code === "Space") {
						this.checked = !this.checked;
						this.dispatchEvent(new Event("change", { bubbles: true })); // TODO: relocate this to Input for closed shadow roots
						ev.preventDefault();
					}
				}}
			>
				<input
					type="checkbox"
					.checked=${this.checked}
					.disabled=${this.disabled}
					@change=${(ev: HTMLEvent<HTMLInputElement>): void => {
						this.checked = ev.target.checked;
						this.dispatchEvent(new Event("change", { bubbles: true })); // TODO: relocate this to Input for closed shadow roots
					}}
				/>

				${this.visualElement}
				<slot></slot>
			</label>
		`;
	}

	/**
	 * @inheritdoc
	 */
	protected override willUpdate(_changedProperties: Map<PropertyKey, unknown>): void {
		super.willUpdate(_changedProperties);
		this.ariaChecked = this.checked ? "checked" : null;

		if (this.setting === undefined) {
			if (_changedProperties.has("htmlChecked") || _changedProperties.has("htmlValue")) {
				this.value = this.checked ? this.htmlValue : undefined;
			} else if (_changedProperties.has("value")) {
				this.htmlValue = this.value;
				this.checked = true;
			}
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting a value via a checkbox.
		 */
		"sd-checkbox": SDCheckboxElement;
	}
}
