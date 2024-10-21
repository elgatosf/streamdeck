import { html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";

import { Input } from "../mixins/input";
import type { HTMLInputEvent } from "../utils";

/**
 * Text field capable of persisting `string` values to Stream Deck settings.
 */
@customElement("sd-textfield")
export class SDTextFieldElement extends Input<string>(LitElement) {
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
	 * Type of text field; either `text` or `password`.
	 */
	@property()
	public accessor type: "text" | "password" = "text";

	/**
	 * @inheritdoc
	 */
	override render(): TemplateResult {
		return html`<input
			${ref(this.focusElement)}
			maxlength=${ifDefined(this.maxLength)}
			pattern=${ifDefined(this.pattern)}
			placeholder=${ifDefined(this.placeholder)}
			?disabled=${this.disabled}
			?required=${this.required}
			.type=${this.type || "text"}
			.value=${this.value || ""}
			@input=${(ev: HTMLInputEvent<HTMLInputElement>) => (this.value = ev.target.value)}
		/>`;
	}
}

declare global {
	/**
	 * Text field capable of persisting `string` values to Stream Deck settings.
	 */
	interface HTMLElementTagNameMap {
		"sd-textfield": SDTextFieldElement;
	}
}
