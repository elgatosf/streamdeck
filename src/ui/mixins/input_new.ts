import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import { createRef, type Ref } from "lit/directives/ref.js";

import type { Constructor } from "../../common/utils";

/**
 * Mixin that provides common functionality for input elements.
 * @param superClass Class the mixin extends.
 * @returns The mixin.
 */
export const Input = <TBase extends Constructor<LitElement> = typeof LitElement>(
	superClass: TBase,
): Constructor<SDInputElement> & TBase => {
	/**
	 * Mixin that provides common functionality for input elements.
	 */
	class InputMixin extends superClass {
		/**
		 * @inheritdoc
		 */
		protected inputRef: Ref<HTMLInputElement> = createRef();

		/**
		 * @inheritdoc
		 */
		@property({
			reflect: true,
			type: Boolean,
		})
		public accessor disabled = false;

		/**
		 * @inheritdoc
		 */
		public override focus(): void {
			if (this.inputRef.value) {
				this.inputRef.value.focus();
			} else {
				super.focus();
			}
		}
	}

	return InputMixin as unknown as Constructor<SDInputElement> & TBase;
};

/**
 * Mixin that provides common functionality for input elements.
 */
export declare class SDInputElement extends LitElement {
	/**
	 * Determines whether the input is disabled; default `false`.
	 */
	public disabled: boolean;

	/**
	 * Element that represents the primary input element.
	 */
	protected inputRef: Ref<HTMLInputElement>;
}
