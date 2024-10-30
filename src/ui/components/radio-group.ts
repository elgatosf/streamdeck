import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { repeat } from "lit/directives/repeat.js";

import { Input } from "../mixins/input";
import { List } from "../mixins/list";
import { preventDoubleClickSelection } from "../utils";

/**
 * Element that offers persisting a value via a list of radio options.
 */
@customElement("sd-radiogroup")
export class SDRadioGroupElement extends List(Input<boolean | number | string>(LitElement)) {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			label {
				display: flex;
				align-items: center;
			}

			input {
				/* Hide the input, whilst still allowing focus */
				height: 0;
				opacity: 0;
				position: absolute;
				width: 0;
			}

			/**
			 * Radio button replacement.
			 */

			.indicator {
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

			input:checked {
				& + .indicator {
					background: var(--color-surface-accent);
					border-color: var(--color-content-disabled);
					border-radius: var(--rounding-full);
				}

				& + .indicator::before {
					content: "";
					background: var(--color-surface-ondark);
					border-radius: var(--rounding-full);
					display: block;
					height: var(--size-xs);
					width: var(--size-xs);
				}
			}

			/**
			 * Disabled.
			 */

			label:has(input:disabled) {
				color: var(--color-content-disabled);
			}

			input:disabled + .indicator {
				border-color: var(--color-border-subtle-disabled);
			}

			/**
			 * Checked + disabled.
			 */

			input:checked:disabled {
				& + .indicator {
					background-color: var(--color-surface-disabled);
				}

				& + .indicator::before {
					background-color: var(--color-content-disabled);
				}
			}

			/**
			 * Focus
			 */

			input:focus-visible + .indicator {
				box-shadow: var(--highlight-box-shadow);
				outline: var(--highlight-outline--focus);
				outline-offset: var(--highlight-outline-offset);
			}
		`,
	];

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			${repeat(
				this.items,
				({ key }) => key,
				({ disabled, label, value }) => {
					return html`
						<label role="radio" @mousedown=${preventDoubleClickSelection}>
							<input
								name="radio"
								type="radio"
								value=${ifDefined(value)}
								tabindex=${ifDefined(disabled ? undefined : 0)}
								.checked=${this.value === value}
								.disabled=${disabled}
								@change=${(): void => {
									this.value = value;
								}}
							/>
							<span class="indicator"></span>
							${label}
						</label>
					`;
				},
			)}
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting a value via a list of radio options.
		 */
		"sd-radiogroup": SDRadioGroupElement;
	}
}
