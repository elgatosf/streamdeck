import { html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";

import { Input } from "../mixins/input";
import { Persistable } from "../mixins/persistable";
import { type HTMLEvent } from "../utils";
import { decodePath } from "../utils/os";

/**
 * Element that offers persisting the path (string) to a directory, chosen from folder dialog.
 */
@customElement("sd-directory")
export class SDDirectoryElement extends Input(Persistable<string>(LitElement)) {
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
		return html`
			<sd-path-picker
				format="full"
				icon="folder-open"
				placeholder="Select a folder"
				.disabled=${this.disabled}
				.path=${this.value}
				@clear=${(): void => {
					this.value = undefined;
				}}
				@show=${(): void => {
					this.inputRef.value!.click();
				}}
			>
				<input
					${ref(this.inputRef)}
					type="file"
					webkitdirectory
					.disabled=${this.disabled}
					@change=${(ev: HTMLEvent<HTMLInputElement>): void => {
						// Only set the value when a file was selected.
						const path = decodePath(ev.target.value);
						if (path !== "") {
							this.value = path;
						}
					}}
				/>
			</sd-path-picker>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting the path (string) to a directory, chosen from folder dialog.
		 */
		"sd-directory": SDDirectoryElement;
	}
}
