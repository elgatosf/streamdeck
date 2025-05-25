import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

import { Input } from "../mixins/input";
import { Persistable } from "../mixins/persistable";
import { cls } from "../utils";
import { SDRadioElement } from "./radio";
import { SDRadioButtonElement } from "./radio-button";

/**
 * Element that offers persisting a `boolean`, `number`, or `string` from a list of radio options.
 */
@customElement("sd-radio-group")
export class SDRadioGroupElement extends Input(Persistable<boolean | number | string>(LitElement)) {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			.buttons {
				background-color: var(--color-surface);
				border-radius: var(--rounding-m);
				display: flex;
			}

			::slotted(sd-radio) {
				display: flex;
			}

			::slotted(sd-radio-button) {
				flex: 1 1 0px;
				max-width: var(--radio-button-max-width);
			}

			::slotted(sd-radio-button:focus) {
				/* Allows the outline to overlap adjacent items */
				position: relative;
				z-index: 1;
			}
		`,
	];

	/**
	 * Type of radio options the group is responsible for.
	 */
	@state()
	accessor #type: "buttons" | "mixed" | "radios" = "mixed";

	/**
	 * Gets the radios managed by this group.
	 * @returns The radios.
	 */
	get #radios(): (SDRadioButtonElement | SDRadioElement)[] {
		// Is there a way to query only radios that aren't in a nested radio group without filtering?
		return [...this.querySelectorAll<SDRadioButtonElement | SDRadioElement>("sd-radio, sd-radio-button")].filter(
			(radio) => radio.closest("sd-radio-group") === this,
		);
	}

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<div .className=${cls(this.#type === "buttons" && "buttons")}>
				<slot @slotchange=${this.#onSlotChange} @click=${this.#onClick} @keydown=${this.#onKeyDown}></slot>
			</div>
		`;
	}

	/**
	 * @inheritdoc
	 */
	protected override update(changedProperties: Map<PropertyKey, unknown>): void {
		super.update(changedProperties);

		if (changedProperties.has("value")) {
			this.#syncRadios();
		}
	}

	/**
	 * Gets the radio or radio button button for the specified event target, when the radio is associated with this group.
	 * @param ev Source event.
	 * @returns The radio or radio button; otherwise `undefined`.
	 */
	#getRadioForEvent(ev: Event | KeyboardEvent): SDRadioButtonElement | SDRadioElement | undefined {
		if (!(ev.target instanceof Element)) {
			return;
		}

		const radio = ev.target.closest<SDRadioButtonElement | SDRadioElement>("sd-radio, sd-radio-button");
		if (radio && radio.closest("sd-radio-group") === this) {
			return radio;
		}
	}

	/**
	 * Updates the current value of the radio group, based on the radio that was checked.
	 * @param ev Source event of the click.
	 */
	#onClick(ev: Event): void {
		const radio = this.#getRadioForEvent(ev);
		if (radio && !radio.disabled) {
			this.value = radio.htmlValue;
		}
	}

	/**
	 * Handles a key down emitted from the slot containing the radios, allowing the user to changed the
	 * checked state of the radios using either the space bar, or arrow keys.
	 * @param ev Source event.
	 */
	#onKeyDown(ev: KeyboardEvent): void {
		const radio = this.#getRadioForEvent(ev);
		if (!radio || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(ev.key)) {
			return;
		}

		// Prevent page shift.
		ev.preventDefault();

		// Select radio from event source when space bar was pressed.
		if (ev.key === " ") {
			this.value = radio.htmlValue;
			return;
		}

		const radios = [...this.#radios];

		// Determine starting point; either checked radio, or radio with focus (when none are checked).
		let startIndex = radios.findIndex((radio) => radio.checked);
		if (startIndex < 0) {
			startIndex = radios.indexOf(radio);
		}

		const incrementor = ev.key === "ArrowUp" || ev.key === "ArrowLeft" ? -1 : 1;
		let index = startIndex + incrementor;

		while (index !== startIndex) {
			// Loop round the radio indexes if we have reached the start / end.
			if (index < 0) {
				index = radios.length - 1;
			} else if (index > radios.length - 1) {
				index = 0;
			}

			// Found available radio, update group value to trigger re-sync.
			if (!radios[index].disabled) {
				this.value = radios[index].htmlValue;
				radios[index].focus();

				return;
			}

			index += incrementor;
		}
	}

	/**
	 * Handles the main slot within the radio group changing.
	 */
	#onSlotChange(): void {
		const radios = this.#radios;
		if (radios.every((r) => r.tagName === "SD-RADIO")) {
			this.#type = "radios";
		} else if (radios.every((r) => r.tagName === "SD-RADIO-BUTTON")) {
			this.#type = "buttons";
			this.style.setProperty("--radio-button-max-width", `${100 / radios.length}%`);
		} else {
			this.#type = "mixed";
		}

		if (this.#type === "mixed") {
			console.warn(
				"\x1B[1msd-radio-group\x1B[m should not contain both \x1B[1msd-radio\x1B[m and \x1B[1msd-radio-button\x1B[m elements.",
				this,
			);
		}

		this.#syncRadios();
	}

	/**
	 * Synchronizes radios within this group, setting their checked and focusable (tabindex) states.
	 */
	#syncRadios(): void {
		let foundCheckedRadio = false;

		// Set the checked state of the radios.
		this.#radios.forEach((radio) => {
			radio.checked = this.value === radio.htmlValue;
			radio.tabIndex = radio.checked ? 0 : -1;

			foundCheckedRadio = foundCheckedRadio || radio.checked;
		});

		// When no radios are checked, make the first focusable
		if (!foundCheckedRadio) {
			const [first] = this.#radios;
			if (first) {
				first.tabIndex = 0;
			}
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting a `boolean`, `number`, or `string` from a list of radio options.
		 */
		"sd-radio-group": SDRadioGroupElement;
	}
}
