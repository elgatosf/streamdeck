import { css, type CSSResult, html, LitElement, type TemplateResult, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";

import type { Option } from "../../common/data-list";
import { parseBoolean, parseNumber } from "../../common/utils";
import { OptionObserver } from "../controllers/option-observer";
import { Input } from "../mixins/input";
import { Persistable } from "../mixins/persistable";
import { useGlobalSetting, useSetting } from "../settings";
import type { SettingSignal, SettingSignalOptions } from "../settings/signals";
import type { HTMLEvent } from "../utils";
import { watch } from "../utils/watch";

/**
 * Gets a chevron with the specified fill color.
 * @param fill Fill color.
 * @returns The chevron has a URL image.
 */
const chevron = (fill: string): CSSResult =>
	unsafeCSS(
		`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M4.81295 6.81344C5.00821 6.61818 5.3248 6.61818 5.52006 6.81344L7.99984 9.29322L10.4796 6.81344C10.6749 6.61818 10.9915 6.61818 11.1867 6.81344C11.382 7.0087 11.382 7.32528 11.1867 7.52055L8.35339 10.3539C8.15813 10.5491 7.84155 10.5491 7.64628 10.3539L4.81295 7.52055C4.61769 7.32528 4.61769 7.0087 4.81295 6.81344Z' fill='${fill}'/></svg>")`,
	);

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
		css`
			:host {
				/* Allow sizing */
				display: flex;
			}

			:host([hidden]) {
				display: none;
			}

			select {
				appearance: none;
				background-image: ${chevron("rgb(216, 216, 216)")};
				background-repeat: no-repeat;
				background-position-x: calc(100% - var(--space-xs));
				background-position-y: 50%;
				background-color: var(--color-surface);
				border: none;
				border-radius: var(--rounding-m);
				color: var(--color-content-primary);
				height: var(--size-2xl);
				font-family: var(--typography-body-m-family);
				font-size: var(--typography-body-m-size);
				font-weight: var(--typography-body-m-weight);
				padding: 0 calc(var(--space-xs) + var(--space-xs) + var(--size-m)) 0 var(--space-xs);
				width: 100%;

				&:disabled {
					color: var(--color-content-disabled);
					background-image: ${chevron("rgb(100, 100, 100)")};
				}

				&:focus-visible {
					box-shadow: var(--highlight-box-shadow);
					outline: var(--highlight-outline--focus);
					outline-offset: var(--highlight-outline-offset);
				}
			}
		`,
	];

	/**
	 * Placeholder to be shown when an option has not yet been selected.
	 */
	@property()
	public accessor placeholder: string | undefined;

	/**
	 * Path to the setting where the selected option's label will be persisted.
	 *
	 * In the event a previously selected option is no longer available, the label stored at this setting
	 * will be rendered as an unselectable option within the select.
	 */
	@property({ attribute: "label-setting" })
	public accessor labelSetting: string | undefined;

	/**
	 * Label of the (previously) selected option.
	 */
	@state()
	accessor #label: string | undefined;

	/**
	 * Signal used to persist and access the label of the (previously) selected option.
	 */
	#labelSignal: SettingSignal<string> | undefined;

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
				@change=${(ev: HTMLEvent<HTMLSelectElement>): void => {
					const selected = ev.target[ev.target.selectedIndex];
					if (selected instanceof HTMLOptionElement) {
						this.value = this.#parseValue(selected);
						this.#labelSignal?.value?.set(selected.label);
					}
				}}
			>
				<option disabled hidden selected>
					${this.value === undefined ? (this.placeholder ?? "") : (this.#label ?? this.placeholder ?? "")}
				</option>
				${this.#options.dataList.map(
					(opt) =>
						html`<option
							data-type=${ifDefined(typeof opt.value)}
							value=${ifDefined(opt.value)}
							.disabled=${opt.disabled}
							.selected=${this.#isSelected(opt)}
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
	 * Manages the settings signal used to persisted the label of the selected option.
	 */
	@watch(["labelSetting", "global"])
	protected labelSettingWillUpdate(): void {
		this.#labelSignal?.dispose();

		if (this.labelSetting) {
			const options: SettingSignalOptions<string> = {
				onChange: (value: string | undefined) => (this.#label = value),
			};

			this.#labelSignal = this.global
				? useGlobalSetting(this.labelSetting, options)
				: useSetting(this.labelSetting, options);

			this.#labelSignal.value.get().then(options.onChange);
		}
	}

	/**
	 * Determines whether the specified option is selected; the option is considered selected when:
	 * - The persisted value of this element matches the option's value.
	 * - Or, this element's value is not persisted, and the option has the `selected` attribute specified.
	 * @param option Option.
	 * @returns `true` when the option is considered selected; otherwise `false`.
	 */
	#isSelected(option: Option): boolean {
		if (this.setting === undefined) {
			return option.selected || false;
		}

		return this.value !== undefined && option.value === this.value;
	}

	/**
	 * Parses the value from the option.
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
