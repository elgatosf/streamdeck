import { html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";

import { parseBoolean, parseNumber } from "../../common/utils";
import { OptionObserver } from "../controllers/option-observer";
import { Input } from "../mixins/input";
import { Persistable } from "../mixins/persistable";
import type { HTMLEvent } from "../utils";

/**
 * Element that offers persisting a value, selected from a drop-down.
 */
@customElement("sd-select")
export class SDSelectElement extends Input(Persistable<boolean | number | string>(LitElement)) {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
	];

	/**
	 * Controller responsible for monitoring the slotted options.
	 */
	#options: OptionObserver;

	/**
	 * Initializes a new instance of the {@link @SDSelectElement} class.
	 */
	constructor() {
		super();
		this.#options = new OptionObserver(this);
	}

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<select
				${ref(this.inputRef)}
				.disabled=${this.disabled}
				@change=${(ev: HTMLEvent<HTMLSelectElement>) => {
					const selected = ev.target[ev.target.selectedIndex];
					if (selected instanceof HTMLOptionElement) {
						this.value = this.#parseValue(selected);
					}
				}}
			>
				${this.#options.dataList.map(
					(opt) =>
						html`<option
							data-type=${ifDefined(typeof opt.value)}
							value=${ifDefined(opt.value)}
							.disabled=${opt.disabled}
							.selected=${this.value !== undefined && opt.value === this.value}
						>
							${opt.label}
						</option>`,
					(grp, children) =>
						html`<optgroup label=${ifDefined(grp.label)} .disabled=${grp.disabled}>${children}</optgroup>`,
				)}
			</select>
		`;
	}

	/**
	 * Parses the value from the {@link HTMLOptionElement}.
	 * @param option Option to parse the value from.
	 * @returns The value.
	 */
	#parseValue(option: HTMLOptionElement): boolean | number | string | undefined {
		switch (option.getAttribute("data-type")) {
			case typeof true:
				return parseBoolean(option.value);
			case typeof 0:
				return parseNumber(option.value);
			default:
				return option.value;
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting a value, selected from a drop-down.
		 */
		"sd-select": SDSelectElement;
	}
}
