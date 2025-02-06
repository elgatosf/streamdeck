import { LitElement } from "lit";

import type { Constructor } from "../../common/utils";
import { SDOptionElement } from "../components/option";
import { OptionController } from "../controllers/option-controller";

/**
 * List mixin that provides common functionality for input elements that have options.
 * @deprecated Previously used by group elements... may serve a purpose in the future?
 * @param superClass Class the mixin extends.
 * @returns List mixin class.
 */
export const List = <TBase extends Constructor<LitElement> = typeof LitElement>(
	superClass: TBase,
): Constructor<SDListElement> & TBase => {
	/**
	 * List mixin that provides common functionality for input elements that have options.
	 */
	class ListMixin extends superClass {
		/**
		 * Option observer for monitoring {@link SDOptionElement} within this instance.
		 */
		readonly #optionObserver = new OptionController(this);

		/**
		 * Gets the items within the list.
		 * @returns The list items.
		 */
		public get items(): Iterable<SDOptionElement> {
			return this.#optionObserver.options;
		}
	}

	return ListMixin as unknown as Constructor<SDListElement> & TBase;
};

/**
 * List mixin that provides common functionality for input elements that have options.
 */
export declare class SDListElement extends LitElement {
	/**
	 * Gets the items within the list.
	 * @returns The list items.
	 */
	public get items(): Iterable<SDOptionElement>;
}
