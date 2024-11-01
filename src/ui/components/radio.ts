import { css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { preventDoubleClickSelection } from "../utils";
import { SDOptionElement } from "./option";

/**
 * Element that offers an option in the form of a radio button.
 */
@customElement("sd-radio")
export class SDRadioElement extends SDOptionElement {
	/**
	 * Determines whether the shared styles have already been appended to the document.
	 */
	static #isStyleAppended = false;

	/**
	 * @inheritdoc
	 */
	public static styles = [
		css`
			label.sd-radio-container {
				display: inline-flex;
				align-items: center;

				& input {
					/* Hide the input, whilst still allowing focus */
					height: 0;
					opacity: 0;
					position: absolute;
					width: 0;
				}

				/**
                 * Radio button replacement.
                 */

				& span {
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
					& + span {
						background: var(--color-surface-accent);
						border-color: var(--color-content-disabled);
						border-radius: var(--rounding-full);
					}

					& + span::before {
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

				& input:disabled + span {
					border-color: var(--color-border-subtle-disabled);
				}

				/**
                 * Checked + disabled.
                 */

				& input:checked:disabled {
					& + span {
						background-color: var(--color-surface-disabled);
					}

					& + span::before {
						background-color: var(--color-content-disabled);
					}
				}

				/**
                 * Focus
                 */

				& input:focus-visible + span {
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
	public override connectedCallback(): void {
		super.connectedCallback();
		if (SDRadioElement.#isStyleAppended) {
			return;
		}

		// As the root of the element is not a shadow DOM, we can't scope styles, so instead we add
		// the styles as a <style> element to the document.
		const style = document.createElement("style");
		style.innerHTML = SDRadioElement.styles
			.map((s) => s.toString())
			.filter((s) => s !== "")
			.join("\n");

		// Only add the <style> element once.
		SDRadioElement.#isStyleAppended = true;
		document.head.append(style);
	}

	/**
	 * @inheritdoc
	 */
	protected override createRenderRoot(): HTMLElement | DocumentFragment {
		// Shadow root has to be open to allow for joining named radio buttons.
		this.innerHTML = "";
		return this;
	}

	/**
	 * @inheritdoc
	 */
	protected override render(): TemplateResult {
		return html`
			<label class="sd-radio-container" @mousedown=${preventDoubleClickSelection}>
				<input
					name=${ifDefined(this.name)}
					type="radio"
					value=${ifDefined(this.value)}
					tabindex=${ifDefined(this.disabled ? undefined : 0)}
					.checked=${this.checked}
					.disabled=${this.disabled}
				/>
				<span role="radio" aria-checked=${this.checked}></span>
				${this.label}
			</label>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers an option in the form of a radio button.
		 */
		"sd-radio": SDRadioElement;
	}
}
