import { LitElement } from "lit";
import { property } from "lit/decorators.js";

import type { Constructor } from "../../common/utils";

/**
 * Labeled mixin that provides a reactive `label` property, attached to the `textContent`.
 * @param superClass Class the mixin extends.
 * @returns Labeled mixin class.
 */
export const Labeled = <TBase extends Constructor<LitElement> = typeof LitElement>(
	superClass: TBase,
): Constructor<SDLabeledElement> & TBase => {
	/**
	 * Labeled mixin that provides a reactive `label` property, attached to the `textContent`.
	 */
	class LabeledMixin extends superClass {
		/**
		 * Observer for monitoring the `textContent` changing.
		 */
		#textContentObserver = new MutationObserver((): void => {
			this.label = this.textContent?.trim();
		});

		/**
		 * @inheritdoc
		 */
		@property({ attribute: false })
		public accessor label: string | undefined = this.textContent?.trim();

		/**
		 * @inheritdoc
		 */
		public override connectedCallback(): void {
			super.connectedCallback();

			this.#textContentObserver.observe(this, {
				childList: true,
				subtree: true,
			});
		}

		/**
		 * @inheritdoc
		 */
		public override disconnectedCallback(): void {
			super.disconnectedCallback();
			this.#textContentObserver.disconnect();
		}
	}

	return LabeledMixin as unknown as Constructor<SDLabeledElement> & TBase;
};

/**
 * Labeled mixin that provides a reactive `label` property, attached to the `textContent`.
 */
export declare class SDLabeledElement extends LitElement {
	/**
	 * Label of the element.
	 */
	public label: string | undefined;
}
