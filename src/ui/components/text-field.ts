import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";

import { Input } from "../mixins/input";
import { Persistable } from "../mixins/persistable";
import type { HTMLEvent } from "../utils";

/**
 * Element that offers persisting a `string` via a text input.
 */
@customElement("sd-textfield")
export class SDTextFieldElement extends Input(Persistable<string>(LitElement)) {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			.container {
				align-items: center;
				background-color: var(--color-surface);
				border-radius: var(--rounding-m);
				box-sizing: border-box;
				display: flex;
				gap: var(--size-xs);

				&:has(input:focus),
				&:has(input:invalid) {
					box-shadow: var(--highlight-box-shadow);
					outline-offset: var(--highlight-outline-offset);
				}

				&:has(input:focus),
				&:has(input:focus:invalid) {
					outline: var(--highlight-outline--focus);
				}

				&:has(input:invalid) {
					outline: var(--highlight-outline--invalid);
				}
			}

			input {
				background-color: transparent;
				border: none;
				color: var(--color-content-primary);
				flex: 1 1 auto;
				font-family: var(--typography-body-m-family);
				font-size: var(--typography-body-m-size);
				font-weight: var(--typography-body-m-weight);
				height: var(--size-2xl);
				min-height: var(--size-2xl);
				outline: none;
				padding: 0 0 0 var(--size-xs);
				width: 100%;

				&::placeholder {
					color: var(--color-content-secondary);
				}

				&:disabled,
				&:disabled::placeholder {
					color: var(--color-content-disabled);
				}
			}

			.counter {
				color: var(--color-content-secondary);
				flex: 1 1 auto;
				padding-right: var(--size-xs);
				user-select: none;

				& span {
					margin: 0 var(--size-3xs);
				}
			}

			input:not(:disabled) + .counter {
				cursor: text;
			}
		`,
	];

	/**
	 * Initializes a new instance of the {@link SDTextFieldElement} class.
	 */
	constructor() {
		super();

		this.debounceSave = true;
		this.role = "textbox";
	}

	/**
	 * Maximum length the value can be.
	 */
	@property({
		attribute: "maxlength",
		type: Number,
	})
	public accessor maxLength: number | undefined;

	/**
	 * Optional pattern to be applied when validating the value.
	 */
	@property()
	public accessor pattern: string | undefined;

	/**
	 * Optional placeholder text to be shown within the input.
	 */
	@property()
	public accessor placeholder: string | undefined;

	/**
	 * Determines whether a value is required.
	 */
	@property({ type: Boolean })
	public accessor required = false;

	/**
	 * Type of text field; either `password` or `text`; default `text`.
	 */
	@property()
	public accessor type: "password" | "text" = "text";

	/**
	 * Determines whether the user has interacted with the text field; primarily used to mimic
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid `:user-invalid`} in
	 * conjunction with `required`
	 */
	@state()
	accessor #userHasInteracted = false;

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<label class="container">
				<input
					${ref(this.inputRef)}
					maxlength=${ifDefined(this.maxLength)}
					pattern=${ifDefined(this.pattern)}
					placeholder=${ifDefined(this.placeholder)}
					?disabled=${this.disabled}
					?required=${this.#userHasInteracted && this.required}
					.type=${this.type ?? "text"}
					.value=${this.value ?? ""}
					@blur=${(): void => {
						this.#userHasInteracted = true;
					}}
					@input=${(ev: HTMLEvent<HTMLInputElement>): void => {
						this.value = ev.target.value;
					}}
				/>
				${this.#getCounter()}
			</label>
		`;
	}

	/**
	 * Gets the counter text, displayed in the lower right corner of the text area.
	 * @returns The counter element.
	 */
	#getCounter(): TemplateResult | undefined {
		if (this.maxLength) {
			return html`<span class="counter">${this.value?.length ?? 0}<span>/</span>${this.maxLength}</span>`;
		}

		return undefined;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting a `string` via a text input.
		 */
		"sd-textfield": SDTextFieldElement;
	}
}
