import { html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { createRef, ref } from "lit/directives/ref.js";

import { isSDInputElement } from "../mixins/input";

/**
 * Element that provides a label for input element.
 */
@customElement("sd-label")
export class SDLabelElement extends LitElement {
	/**
	 * Reference to the slot element within the label of the shadow DOM.
	 */
	#slotRef = createRef<HTMLSlotElement>();

	/**
	 * Initializes a new instance of the {@link SDLabelElement} class.
	 */
	constructor() {
		super();
		this.role = "label";

		this.addEventListener("click", (ev: MouseEvent) => {
			// Stop propagation to prevent multiple triggers of nested labels.
			ev.stopImmediatePropagation();
			this.activate();
		});
	}

	/**
	 * Identifier of the element the label is for.
	 */
	@property({ attribute: "for" })
	public accessor htmlFor: string | undefined;

	/**
	 * Activates the input associated with this label element.
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
			this.#tryActivate(element);
			return;
		}

		// Otherwise, as we have a slot, attempt to find the first element that can be activated.
		for (const slotElement of element.assignedElements({ flatten: true })) {
			if (slotElement instanceof HTMLElement && this.#tryActivate(slotElement)) {
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

	/**
	 * Attempts to activate the specified element, either clicking or focusing it.
	 * @param element Element to attempt to activate.
	 * @returns `true` when the element was activated; otherwise `false`.
	 */
	#tryActivate(element: HTMLElement): boolean {
		// Labels can be activated.
		if (element instanceof SDLabelElement) {
			element.activate();
			return true;
		}

		// Elements that should be clicked.
		if (
			element.role === "checkbox" ||
			element.role === "radio" ||
			(element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio"))
		) {
			element.click();
			return true;
		}

		// Elements that should be focused.
		if (
			element.role === "button" ||
			element.role === "textbox" ||
			element instanceof HTMLButtonElement ||
			element instanceof HTMLInputElement ||
			element instanceof HTMLSelectElement ||
			element instanceof HTMLTextAreaElement ||
			isSDInputElement(element)
		) {
			element.focus();
			return true;
		}

		return false;
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
