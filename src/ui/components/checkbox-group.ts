import { css, html, LitElement, type PropertyValueMap, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { Input } from "../mixins/input";
import { Persistable } from "../mixins/persistable";
import { SDCheckboxElement } from "./checkbox";

/**
 * Element that offers persisting an set of values, from a group of checkbox options.
 */
@customElement("sd-checkbox-group")
export class SDCheckboxGroupElement extends Input(Persistable<(boolean | number | string)[]>(LitElement)) {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			::slotted(sd-checkbox) {
				display: flex;
			}
		`,
	];

	/**
	 * Gets the checkboxes managed by this group.
	 * @returns The checkboxes.
	 */
	get #checkboxes(): SDCheckboxElement[] {
		return [...this.querySelectorAll("sd-checkbox")].filter((radio) => radio.closest("sd-checkbox-group") === this);
	}

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`<slot @slotchange=${this.#syncCheckboxes} @change=${this.#onChange}></slot>`;
	}

	/**
	 * @inheritdoc
	 */
	protected override update(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
		super.update(changedProperties);

		if (changedProperties.has("value")) {
			this.#syncCheckboxes();
		}
	}

	/**
	 * Handles the change event for children within the slot; when the target is a checkbox managed by
	 * this group, the value of this group is updated.
	 * @param ev Source event.
	 */
	#onChange(ev: Event): void {
		// Ignore events that aren't associated with a checkbox this group manages.
		if (
			!(ev.target instanceof SDCheckboxElement) ||
			ev.target.typedValue === undefined ||
			ev.target.closest("sd-checkbox-group") !== this
		) {
			return;
		}

		// Build a set of all checked values.
		const checkedValues = new Set<boolean | number | string>();
		this.#checkboxes.forEach((checkbox) => {
			if (checkbox.checked && checkbox.typedValue !== undefined) {
				checkedValues.add(checkbox.typedValue);
			}
		});

		this.value = Array.from(checkedValues);
	}

	/**
	 * Synchronizes the checkboxes checked state based on this group's value.
	 */
	#syncCheckboxes(): void {
		this.#checkboxes.forEach((checkbox) => {
			// Undefined values aren't persisted resulting in unexpected UX behavior.
			// Warn the Maker that all checkboxes within a group should have a value.
			if (checkbox.typedValue === undefined) {
				console.warn(
					"Checkbox group contains checkbox with an undefined value. Please specify a value on the checkbox",
					checkbox,
				);
			}

			if (!this.value || checkbox.typedValue === undefined) {
				checkbox.checked = false;
				return;
			}

			checkbox.checked = this.value.includes(checkbox.typedValue);
		});
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting an set of values, from a group of checkbox options.
		 */
		"sd-checkbox-group": SDCheckboxGroupElement;
	}
}
