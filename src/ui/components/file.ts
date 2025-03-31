import { html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";

import { Input } from "../mixins/input";
import { Persistable } from "../mixins/persistable";
import { type HTMLEvent } from "../utils";
import { decodePath, fixDirectorySeparatorChar } from "../utils/os";

/**
 * Element that offers persisting the path (string) to a file, chosen from file dialog.
 */
@customElement("sd-file")
export class SDFileElement extends Input(Persistable<string>(LitElement)) {
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
	 * @inheritdoc
	 */
	public override focus(): void {
		if (!this.disabled) {
			this.inputRef.value!.click();
		}
	}

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		// TODO: Add support for `multiple`.

		return html`
			<input
				${ref(this.inputRef)}
				accept=${ifDefined(this.accept)}
				hidden
				type="file"
				.disabled=${this.disabled}
				@change=${(ev: HTMLEvent<HTMLInputElement>): void => {
					// Only set the value when a file was selected.
					const path = decodePath(ev.target.value);
					if (path !== "") {
						this.value = path;
					}
				}}
			/>

			<sd-path-picker
				icon="file"
				placeholder="Select a file"
				.disabled=${this.disabled}
				.value=${this.value}
				@clear=${(): void => {
					this.value = undefined;
				}}
				@open=${(): void => {
					this.inputRef.value!.click();
				}}
			>
				<span title=${ifDefined(fixDirectorySeparatorChar(this.value))}>${this.value?.split("/")?.pop()}</span>
			</sd-path-picker>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting the path (string) to a file, chosen from file dialog.
		 */
		"sd-file": SDFileElement;
	}
}
