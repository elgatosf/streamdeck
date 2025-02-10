import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";

import { Input } from "../mixins/input";
import { Option } from "../mixins/option";
import { preventDoubleClickSelection } from "../utils";

/**
 * Element that offers an option in the form of a radio.
 */
@customElement("sd-radio")
export class SDRadioElement extends Option(Input(LitElement)) {
	/**
	 * @inheritdoc
	 */
	public static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

	/**
	 * @inheritdoc
	 */
	public static styles = [
		css`
			label {
				align-items: center;
				display: inline-flex;
				outline: none;

				& input {
					display: none;
				}

				/**
                 * Radio button replacement.
                 */

				& span[role="radio"] {
					--size: calc(var(--size-m) - calc(var(--border-width-thin) * 2));
					align-items: center;
					border: var(--border-width-thin) solid var(--color-content-disabled);
					border-radius: var(--rounding-full);
					display: inline-flex;
					height: var(--size);
					justify-content: center;
					margin: var(--space-xs) var(--space-xs) var(--space-xs) 0;
					user-select: none;
					width: var(--size);
				}

				/**
                 * Checked.
                 */

				& input:checked {
					& + span[role="radio"] {
						background: var(--color-surface-accent);
						border-color: var(--color-content-disabled);
						border-radius: var(--rounding-full);
					}

					& + span[role="radio"]::before {
						content: "";
						background: var(--color-surface-ondark);
						border-radius: var(--rounding-full);
						display: block;
						height: var(--size-xs);
						position: absolute;
						width: var(--size-xs);
					}
				}

				/**
                 * Disabled.
                 */

				&:has(input:disabled) {
					color: var(--color-content-disabled);
				}

				& input:disabled + span[role="radio"] {
					border-color: var(--color-border-subtle-disabled);
				}

				/**
                 * Checked + disabled.
                 */

				& input:checked:disabled {
					& + span[role="radio"] {
						background-color: var(--color-surface-disabled);
					}

					& + span[role="radio"]::before {
						background-color: var(--color-content-disabled);
					}
				}

				/**
                 * Focus
                 */

				&:focus-visible span[role="radio"] {
					box-shadow: var(--highlight-box-shadow);
					outline: var(--highlight-outline--focus);
					outline-offset: var(--highlight-outline-offset);
				}
			}
		`,
	];

	/**
	 * Name of the radio button group the element is associated with.
	 */
	@property()
	public accessor name: string | undefined = undefined;

	/**
	 * Determines whether the radio button is checked; default `false`.
	 */
	@property({
		reflect: true,
		type: Boolean,
	})
	public accessor checked: boolean = false;

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<label
				${ref(this.inputRef)}
				.tabIndex=${this.tabIndex}
				@mousedown=${preventDoubleClickSelection}
				@change=${(ev: Event): void => {
					// Propagate the change on the component.
					ev.stopImmediatePropagation();
					this.dispatchEvent(new Event("change", { bubbles: true }));
				}}
			>
				<input type="radio" .checked=${this.checked} .disabled=${this.disabled} />
				<span role="radio" aria-checked=${this.checked}></span>

				<slot></slot>
			</label>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers an option in the form of a radio.
		 */
		"sd-radio": SDRadioElement;
	}
}
