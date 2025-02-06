import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { Input } from "../mixins/input";
import { Persistable } from "../mixins/persistable";
import { SDRadioElement } from "./radio";

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
			::slotted(sd-radio) {
				display: flex;
			}
		`,
	];

	/**
	 * Gets the radios managed by this group.
	 * @returns The radios.
	 */
	get #radios(): SDRadioElement[] {
		// Is there a way to query only radios that aren't in a nested radio group without filtering?
		return [...this.querySelectorAll("sd-radio")].filter((radio) => radio.closest("sd-radio-group") === this);
	}

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`<slot @slotchange=${this.#syncRadios} @click=${this.#onClick} @keydown=${this.#onKeyDown}></slot>`;
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
	 * Determines whether the specified event was dispatched for a radio that is managed by this group.
	 * @param ev Source event.
	 * @returns `true` when the event was dispatched from a radio this group manages.
	 */
	#isRadioEvent(ev: Event | KeyboardEvent): ev is RadioEvent<typeof ev> {
		return ev.target instanceof SDRadioElement && ev.target.closest("sd-radio-group") === this;
	}

	/**
	 * Handles a key down emitted from the slot containing the radios, allowing the user to changed the
	 * checked state of the radios using either the space bar, or arrow keys.
	 * @param ev Source event.
	 */
	#onKeyDown(ev: KeyboardEvent): void {
		if (!this.#isRadioEvent(ev) || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(ev.key)) {
			return;
		}

		// Prevent page shift.
		ev.preventDefault();

		// Select radio from event source when space bar was pressed.
		if (ev.key === " ") {
			this.value = ev.target.typedValue;
			return;
		}

		const radios = [...this.#radios];

		// Determine starting point; either checked radio, or radio with focus (when none are checked).
		let startIndex = radios.findIndex((radio) => radio.checked);
		if (startIndex < 0) {
			startIndex = radios.indexOf(ev.target);
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
				this.value = radios[index].typedValue;
				radios[index].focus();

				return;
			}

			index += incrementor;
		}
	}

	/**
	 * Updates the current value of the radio group, based on the radio that was checked.
	 * @param ev Source event of the click.
	 */
	#onClick(ev: Event): void {
		if (this.#isRadioEvent(ev) && !ev.target.disabled) {
			this.value = ev.target.typedValue;
		}
	}

	/**
	 * Synchronizes radios within this group, setting their checked and focusable (tabindex) states.
	 */
	#syncRadios(): void {
		let foundCheckedRadio = false;

		// Set the checked state of the radios.
		this.#radios.forEach((radio) => {
			radio.checked = this.value === radio.typedValue;
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

/**
 * Event that was dispatched from a radio element.
 */
type RadioEvent<TSource> = Omit<TSource, "target"> & {
	/**
	 * Radio element that dispatched the event.
	 */
	readonly target: SDRadioElement;
};

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting a `boolean`, `number`, or `string` from a list of radio options.
		 */
		"sd-radio-group": SDRadioGroupElement;
	}
}
