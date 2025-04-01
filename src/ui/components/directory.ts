import { html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";

import { Input } from "../mixins/input";
import { Persistable } from "../mixins/persistable";
import { type HTMLEvent } from "../utils";
import { decodePath, fixDirectorySeparatorChar } from "../utils/os";

/**
 * Element that offers persisting directory path selected from a folder dialog.
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
		const path = fixDirectorySeparatorChar(this.value);

		return html`
			<input
				${ref(this.inputRef)}
				hidden
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

			<sd-path-picker
				icon="folder"
				placeholder="Select a folder"
				.disabled=${this.disabled}
				.value=${this.value}
				@clear=${(): void => {
					this.value = undefined;
				}}
				@open=${(): void => {
					this.inputRef.value!.click();
				}}
			>
				<span title=${ifDefined(path)}>${path}</span>
			</sd-path-picker>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting directory path selected from a folder dialog.
		 */
		"sd-directory": SDDirectoryElement;
	}
}
