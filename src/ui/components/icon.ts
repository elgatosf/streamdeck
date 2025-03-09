import * as large from "@elgato/icons/l";
import * as medium from "@elgato/icons/m";
import { getSvgStringMetadata, type icons, type Size } from "@elgato/icons/metadata";
import * as small from "@elgato/icons/s";
import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { guard } from "lit/directives/guard.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

/**
 * Type of icon.
 */
export type Icon = keyof typeof icons;

/**
 * * Element for displaying an icon from the collection of {@link https://docs.elgato.com/resources/icon Elgato Icons}.
 */
@customElement("sd-icon")
export class SDIconElement extends LitElement {
	/**
	 * @inheritdoc
	 */
	public static styles = [
		super.styles ?? [],
		css`
			:host {
				display: inline-flex;
			}

			svg {
				height: 100%;
				width: 100%;
			}
		`,
	];
	/**
	 * Preferred icon size; default small (s).
	 */
	@property()
	public accessor size: Size = "s";

	/**
	 * Type of icon, for example "logo-elgato".
	 */
	@property()
	public accessor type: Icon | undefined;

	/**
	 * @inheritdoc
	 */
	public override render(): TemplateResult {
		return html`${guard([this.size, this.type], () => {
			const svg = this.#getSvg();
			return unsafeHTML(svg);
		})}`;
	}

	/**
	 * Gets the SVG string for the components configuration.
	 * @returns The SVG string for the icon; otherwise the question mark icon if it was not found.
	 */
	#getSvg(): string {
		// When the type is undefined, return a question mark.
		if (!this.type) {
			return small.iconQuestionMark;
		}

		// Get the export name, and define a function for finding the icon within different sizes.
		const { exportName } = getSvgStringMetadata(this.type);
		const iconOfSize = (...sizes: Record<string, string>[]): string => {
			for (const size of sizes) {
				if (exportName in size) {
					return size[exportName];
				}
			}

			return small.iconQuestionMark;
		};

		// Return the icon based on the preferred size.
		switch (this.size ?? "s") {
			case "s":
				return iconOfSize(small, medium, large);
			case "m":
				return iconOfSize(medium, small, large);
			default:
				return iconOfSize(large, small, large);
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		/**
		 * * Element for displaying an icon from the collection of {@link https://docs.elgato.com/resources/icon Elgato Icons}.
		 */
		"sd-icon": SDIconElement;
	}
}
