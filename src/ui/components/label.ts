import { html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { createRef, ref } from "lit/directives/ref.js";

import { type ActivableElement, isActivable } from "../mixins/input";

/**
 * Element that provides a label for input element.
 */
@customElement("sd-label")
export class SDLabelElement extends LitElement implements ActivableElement {
	/**
	 * Reference to the slot element within the label of the shadow DOM.
	 */
	#slotRef = createRef<HTMLSlotElement>();

	/**
	 * Identifier of the element the label is for.
	 */
	@property({ attribute: "for" })
	public accessor htmlFor: string | undefined;

	/**
	 * @inheritdoc
	 */
	public activate(): void {
		const target = this.#getTarget();
		if (target) {
			this.#activate(target);
		}
	}

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`<label
			for=${ifDefined(this.htmlFor)}
			@click=${(): void => {
				// Activate the element the label is for.
				const target = this.#getTarget();
				if (target) {
					this.#activate(target);
				}
			}}
			@mousedown=${(ev: MouseEvent): void => {
				// Disable text selection on double-click.
				if (ev.detail > 1) {
					ev.preventDefault();
				}
			}}
			><slot ${ref(this.#slotRef)}></slot>
		</label>`;
	}

	/**
	 * Activates the specified element, or the first activable element if the specified one is a slot.
	 * @param element Element to activate.
	 */
	#activate(element: HTMLElement): void {
		// When the element is a regular element, attempt to activate it.
		if (!(element instanceof HTMLSlotElement)) {
			if (isActivable(element)) {
				element.activate();
			}

			return;
		}

		// Otherwise, as we have a slot, attempt to find the first element that can be activated.
		const elements = element.assignedElements({ flatten: true });
		for (const elem of elements) {
			if (elem instanceof HTMLElement && isActivable(elem)) {
				elem.activate();
				return;
			}
		}
	}

	/**
	 * Gets the target element the label is for.
	 * @returns The target element when one is specified; otherwise the slot of the label.
	 */
	#getTarget(): HTMLElement | null | undefined {
		// When an input isn't specified, return the slot within the label.
		if (!this.htmlFor) {
			return this.#slotRef.value;
		}

		// Prioritize elements within the shadow DOM.
		const root = this.parentNode?.getRootNode();
		if (root && root instanceof ShadowRoot) {
			return root.getElementById(this.htmlFor);
		}

		// Otherwise, revert to the document.
		return document.getElementById(this.htmlFor);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that provides a label for input element.
		 */
		"sd-label": SDLabelElement;
	}
}
