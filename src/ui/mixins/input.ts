import { LitElement } from "lit";
import { property } from "lit/decorators.js";

import type { Constructor } from "../../common/utils";

/**
 * Input mixin that provides common functionality for input elements that persist settings.
 * @param superClass Class the mixin extends.
 * @returns Input mixin class.
 */
export const Input = <T extends Constructor<LitElement>>(superClass: T) => {
	class InputClass extends superClass implements Input {
		/**
		 * @inheritdoc
		 */
		@property({
			reflect: true,
			type: Boolean,
		})
		public accessor disabled = false;
	}

	return InputClass as Constructor<Input> & T;
};

/**
 * Input mixin that provides common functionality for input elements that persist settings.
 */
export interface Input {
	/**
	 * Determines whether the input is disabled; default `false`.
	 */
	disabled: boolean;
}
