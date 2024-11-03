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

				& input:focus-visible + span[role="radio"] {
					box-shadow: var(--highlight-box-shadow);
					outline: var(--highlight-outline--focus);
					outline-offset: var(--highlight-outline-offset);
				}
			}
		`,
	];

	/**
	 * Determines whether the shared styles have already been appended to the document.
	 */
	static #isStyleAppended = false;

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
	 * Fallback label, derived from the original inner text of this element when creating the render root.
	 */
	#fallbackLabel: string | undefined;

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
	public override render(): TemplateResult {
		return html`
			<label
				class="sd-radio-container"
				@mousedown=${preventDoubleClickSelection}
				@change=${(ev: Event): void => {
					// Propagate the change on the component.
					ev.stopImmediatePropagation();
					this.dispatchEvent(new Event("change"));
				}}
			>
				<input
					name=${ifDefined(this.name)}
					type="radio"
					tabindex=${ifDefined(this.disabled ? undefined : 0)}
					.checked=${this.checked}
					.disabled=${this.disabled}
				/>
				<span role="radio" aria-checked=${this.checked}></span>
				${this.label ?? this.#fallbackLabel}
			</label>
		`;
	}

	/**
	 * @inheritdoc
	 */
	protected override createRenderRoot(): DocumentFragment | HTMLElement {
		// Shadow root has to be open to allow for joining named radio buttons.
		this.#fallbackLabel = this.innerText;
		this.innerHTML = "";

		return this;
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
