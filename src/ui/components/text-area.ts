import { css, html, type HTMLTemplateResult, LitElement, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { createRef, ref } from "lit/directives/ref.js";

import { Input } from "../mixins/input";
import { type HTMLInputEvent } from "../utils";

/**
 * Element that offers persisting a `string` via a text area.
 */
@customElement("sd-textarea")
export class SDTextAreaElement extends Input<string>(LitElement) {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			.container {
				display: grid;
				width: 224px;
			}

			.container::after,
			textarea,
			.counter {
				grid-area: 1 / 1 / 2 / 2; /* Place everything on top of one another */
			}

			/**
			 * Important: the container content placeholder and textarea *must* have the same styling
			 * so they wrap equally.
			 */
			.container::after,
			textarea {
				background-color: var(--color-surface);
				border: none;
				border-radius: var(--rounding-m);
				color: var(--color-content-primary);
				font-family: var(--typography-body-m-family);
				font-size: var(--typography-body-m-size);
				font-weight: var(--typography-body-m-weight);
				min-height: var(--size-4xl);
				outline: none;
				padding: var(--space-xs);
				overflow: hidden;
				width: 224px;
			}

			.container:has(.counter) {
				&::after,
				& > textarea {
					min-height: var(--size-2xl);
					padding-bottom: var(--space-xl);
				}
			}

			.container::after {
				content: attr(data-content) " "; /* Extra space needed to prevent jumpy behavior */
				visibility: hidden;
				word-wrap: break-word;
				white-space: pre-wrap;
			}

			textarea {
				overflow: none;
				resize: none;

				&::placeholder {
					color: var(--color-content-secondary);
				}

				&:disabled,
				&:disabled::placeholder {
					color: var(--color-content-disabled);
				}

				&:focus,
				&:invalid {
					box-shadow: var(--highlight-box-shadow);
					outline-offset: var(--highlight-outline-offset);
				}

				&:focus,
				&:focus:invalid {
					outline: var(--highlight-outline--focus);
				}

				&:invalid {
					outline: var(--highlight-outline--invalid);
				}
			}

			.counter {
				align-self: flex-end;
				color: var(--color-content-secondary);
				justify-self: flex-end;
				padding: 0 var(--size-xs) var(--size-xs) 0;
				user-select: none;

				& span {
					margin: 0 var(--size-3xs);
				}
			}

			textarea:not(:disabled) + .counter {
				cursor: text; /* Give the impression the label isn't there */
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
	 * Optional placeholder text to be shown within the element.
	 */
	@property()
	public accessor placeholder: string | undefined;

	/**
	 * Determines whether a value is required.
	 */
	@property({ type: Boolean })
	public accessor required = false;

	/**
	 * Determines whether the user has interacted with the text field; primarily used to mimic
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid `:user-invalid`} in
	 * conjunction with `required`.
	 */
	@state()
	accessor #userHasInteracted = false;

	/**
	 * References to the container around the text element; allows the text area to expand.
	 */
	#containerRef = createRef<HTMLDivElement>();

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<div ${ref(this.#containerRef)} class="container">
				<textarea
					${ref(this.inputRef)}
					id="textarea"
					maxlength=${ifDefined(this.maxLength)}
					placeholder=${ifDefined(this.placeholder)}
					.value=${this.value ?? ""}
					?disabled=${this.disabled}
					?required=${this.#userHasInteracted && this.required}
					@blur=${(): void => {
						this.#userHasInteracted = true;
					}}
					@input=${(ev: HTMLInputEvent<HTMLTextAreaElement>): void => {
						this.value = ev.target.value;
					}}
				></textarea>
				${this.#getCounter()}
			</div>
		`;
	}

	/**
	 * @inheritdoc
	 */
	protected override willUpdate(_changedProperties: Map<PropertyKey, unknown>): void {
		super.willUpdate(_changedProperties);

		if (_changedProperties.has("value") && this.#containerRef.value) {
			this.#containerRef.value.dataset.content = this.value;
		}
	}

	/**
	 * Gets the counter text, displayed in the lower right corner of the text area.
	 * @returns The counter element.
	 */
	#getCounter(): HTMLTemplateResult | undefined {
		if (this.maxLength) {
			return html`
				<label class="counter" for="textarea"> ${this.value?.length ?? 0}<span>/</span>${this.maxLength} </label>
			`;
		}

		return undefined;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting a `string` via a text area.
		 */
		"sd-textarea": SDTextAreaElement;
	}
}
