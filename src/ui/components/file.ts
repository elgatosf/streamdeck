import { css, html, LitElement, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";

import { Input } from "../mixins/input";
import { Persistable } from "../mixins/persistable";
import { cls, type HTMLEvent } from "../utils";

/**
 * Element that offers persisting a path (string) via a file or folder picker.
 */
@customElement("sd-file")
export class SDFileElement extends Input(Persistable<string>(LitElement)) {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			label {
				display: flex;
				gap: var(--space-2xs);
				user-select: none;

				& div {
					align-items: center;
					background: var(--color-surface);
					border-radius: var(--rounding-m);
					display: flex;
					height: var(--size-2xl);
					padding: 0 var(--size-xs);
					flex-grow: 1;
					min-width: 0;
					padding: 0 0 0 var(--space-xs);

					& span {
						flex-grow: 1;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;

						&.placeholder {
							color: var(--color-content-secondary);
						}
					}
				}

				&:has(input:disabled) .placeholder,
				&:has(input:disabled) div {
					color: var(--color-content-disabled);
				}
			}
		`,
	];

	/**
	 * Comma-separated list of content types; only applies to file selection.
	 */
	@property()
	public accessor accept: string | undefined;

	/**
	 * Selection type.
	 */
	@property()
	public accessor type: "directory" | "file" = "file";

	/**
	 * Label that represents the selected directory or file.
	 */
	@state()
	accessor #label: string | undefined;

	/**
	 * Title shown when the user mouses over the input, displaying the full path.
	 */
	@state()
	accessor #title: string | undefined;

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		const placeholder = this.type === "directory" ? "Select a folder" : "Select a file";

		return html`
			<label ${ref(this.inputRef)} title=${ifDefined(this.#title)}>
				<input
					.accept=${this.type === "file" && this.accept ? this.accept : ""}
					.disabled=${this.disabled}
					.webkitdirectory=${this.type === "directory"}
					hidden
					type="file"
					@change=${(ev: HTMLEvent<HTMLInputElement>): void => {
						// Only set the value when it was selected.
						const path = decodeURIComponent(ev.target.value.replace(/^C:\\fakepath\\/, ""));
						if (path !== "") {
							this.value = path;
						}
					}}
				/>
				<div>
					<span .className=${cls(!this.#label && "placeholder")}>${this.#label ?? placeholder}</span>
					<sd-button
						.disabled=${this.disabled}
						icon="close-circle--filled"
						@click=${(): void => {
							this.value = undefined;
						}}
					></sd-button>
				</div>
				<sd-button
					.disabled=${this.disabled}
					.icon=${this.type === "directory" ? "folder" : "file"}
					@click=${(): void => {
						this.inputRef.value!.click();
					}}
				></sd-button>
			</label>
		`;
	}

	/**
	 * @inheritdoc
	 */
	protected override willUpdate(_changedProperties: PropertyValues): void {
		super.willUpdate(_changedProperties);

		if (_changedProperties.has("value")) {
			if (this.type === "directory") {
				this.#label = fixDirectorySeparatorChar(this.value);
				this.#title = this.#label;
			} else {
				this.#label = this.value?.split("/")?.pop();
				this.#title = fixDirectorySeparatorChar(this.value);
			}
		}

		/**
		 * Fixes the character used to separate directories based on the current platform.
		 * @param path File or folder path.
		 * @returns Path with the platform-specific separators.
		 */
		function fixDirectorySeparatorChar(path: string | undefined): string | undefined {
			return window.navigator.userAgentData.platform === "Windows" ? path?.replaceAll("/", "\\") : path;
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * Element that offers persisting a path (string) via a file or folder picker.
		 */
		"sd-file": SDFileElement;
	}
}
