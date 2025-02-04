import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { Input } from "../mixins/input";
import { List } from "../mixins/list";
import { Persistable } from "../mixins/persistable";
import { SDCheckboxElement } from "./checkbox";

/**
 * Element that offers persisting an set of values, from a group of checkbox options.
 */
@customElement("sd-checkboxgroup")
export class SDCheckboxGroupElement extends List(Input(Persistable<(boolean | number | string)[]>(LitElement))) {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			sd-checkbox {
				display: flex;
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
				(opt) => opt,
				(opt) => {
					return html`<sd-checkbox
						.checked=${(this.value ?? []).findIndex((value) => value === opt.value) > -1}
						.disabled=${opt.disabled}
						.label=${opt.label}
						@change=${(ev: Event): void => {
							if (ev.target instanceof SDCheckboxElement) {
								this.#handleChange(ev.target.checked, opt.value);
							}
						}}
					/>`;
				},
			)}
		`;
	}

	/**
	 * Handles a checkbox state changing.
	 * @param checked Whether the checkbox is checked.
	 * @param value Value the checkbox represents.
	 */
	#handleChange(checked: boolean, value: boolean | number | string): void {
		if (value === undefined) {
			return;
		}

		const values = new Set(this.value);
		if (checked) {
			values.add(value);
		} else {
			values.delete(value);
		}

		this.value = Array.from(values);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting an set of values, from a group of checkbox options.
		 */
		"sd-checkboxgroup": SDCheckboxGroupElement;
	}
}
