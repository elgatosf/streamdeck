import { html, LitElement, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";

import { Input } from "../mixins/input";
import { Persistable } from "../mixins/persistable";
import { type HTMLEvent } from "../utils";
import { decodePath, fixDirectorySeparatorChar } from "../utils/os";
import { watch } from "../utils/watch";

/**
 * Element that offers persisting file paths selected from a file dialog.
 */
@customElement("sd-file")
export class SDFileElement extends Input(Persistable<string[] | string>(LitElement)) {
	/**
	 * Comma-separated list of one or more allowed file types.
	 * @example
	 * ```
	 * "video/*"
	 * ```
	 * @example
	 * ```
	 * "image/png, image/jpeg"
	 * ```
	 */
	@property()
	public accessor accept: string | undefined;

	/**
	 * Determines whether multiple files can be selected; when `true`, the value is persisted as an
	 * array of file paths.
	 */
	@property({ type: Boolean })
	public accessor multiple: boolean = false;

	/**
	 * @inheritdoc
	 */
	public override focus(): void {
		if (!this.disabled) {
			this.inputRef.value!.click();
		}
	}

	/**
	 * Text shown within the picker that represents the value.
	 */
	@state()
	accessor #text: string | undefined;

	/**
	 * Tooltip shown when the user mouses over the picker.
	 */
	@state()
	accessor #title: string | undefined;

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`
			<input
				${ref(this.inputRef)}
				accept=${ifDefined(this.accept)}
				hidden
				type="file"
				.disabled=${this.disabled}
				.multiple=${this.multiple}
				@change=${(ev: HTMLEvent<HTMLInputElement>): void => {
					if (!ev.target.files) {
						return;
					}

					if (this.multiple) {
						// Multiple files.
						const value = [];
						for (const file of ev.target.files) {
							value.push(decodePath(file.name));
						}

						this.value = value;
					} else {
						// Single file.
						const name = ev.target.files.item(0)?.name;
						this.value = name ? decodePath(name) : undefined;
					}
				}}
			/>

			<sd-path-picker
				icon="file"
				placeholder=${this.multiple ? "Select files" : "Select a file"}
				.disabled=${this.disabled}
				.value=${this.value}
				@clear=${(): void => {
					this.value = undefined;
				}}
				@open=${(): void => {
					this.inputRef.value!.click();
				}}
			>
				<span title=${ifDefined(this.#title)}>${this.#text}</span>
			</sd-path-picker>
		`;
	}

	/**
	 * Updates the title and text of the picker.
	 */
	@watch("value")
	protected updateState(): void {
		// Multiple files.
		if (Array.isArray(this.value) && this.value.length > 1) {
			this.#text = `${this.value.length} files selected`;
			this.#title = this.value.map(fixDirectorySeparatorChar).join("\n");
			return;
		}

		// Single file.
		const value = Array.isArray(this.value) ? this.value.at(0) : this.value;
		if (value !== undefined) {
			this.#text = value.split("/").pop();
			this.#title = fixDirectorySeparatorChar(value);
			return;
		}

		// No files.
		this.#text = undefined;
		this.#title = undefined;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting file paths selected from a file dialog.
		 */
		"sd-file": SDFileElement;
	}
}
