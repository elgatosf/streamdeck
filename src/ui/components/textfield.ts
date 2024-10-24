import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";

import { Input } from "../mixins/input";
import type { HTMLInputEvent } from "../utils";

/**
 * Element that offers persisting a `string` via a text input.
 */
@customElement("sd-textfield")
export class SDTextFieldElement extends Input<string>(LitElement) {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			input {
				background-color: var(--color-surface);
				border: solid var(--border-width-thick) var(--color-page);
				border-radius: var(--rounding-m);
				color: var(--color-content-primary);
				font-family: var(--typography-body-m-family);
				font-size: var(--typography-body-m-size);
				font-weight: var(--typography-body-m-weight);
				margin: calc(var(--border-width-thick) * -1);
				padding: 0 var(--space-xs);
				min-height: 32px;
				width: 224px;
			}
			input::placeholder {
				color: var(--color-content-secondary);
			}
			input:disabled {
				color: var(--color-content-disabled);
			}
			input:focus,
			input:focus:invalid {
				outline: solid var(--border-width-thick) var(--color-surface-accent);
			}
			input:invalid {
				outline: solid var(--border-width-thick) var(--color-surface-negative);
			}
		`,
	];

	/**
	 * Initializes a new instance of the {@link SDTextFieldElement} class.
	 */
	constructor() {
		super();
		this.debounceSave = true;
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
		return html`<input
			${ref(this.focusDelegate)}
			maxlength=${ifDefined(this.maxLength)}
			pattern=${ifDefined(this.pattern)}
			placeholder=${ifDefined(this.placeholder)}
			?disabled=${this.disabled}
			?required=${this.#userHasInteracted && this.required}
			.type=${this.type || "text"}
			.value=${this.value || ""}
			@blur=${(): void => {
				this.#userHasInteracted = true;
			}}
			@input=${(ev: HTMLInputEvent<HTMLInputElement>): void => {
				this.value = ev.target.value;
			}}
		/>`;
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
