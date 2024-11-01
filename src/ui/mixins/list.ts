import { LitElement } from "lit";

import type { Constructor } from "../../common/utils";
import type { SDOptionElement } from "../components/option";
import type { SDRadioElement } from "../components/radio";
import { OptionObserver } from "../controllers/option-observer";

/**
 * List mixin that provides common functionality for input elements that have options.
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
		 * Mutation observer for monitoring {@link SDOptionElement} within the shadow DOM of this instance.
		 */
		readonly #domObserver = new OptionObserver(this);

		/**
		 * Gets the items within the list.
		 * @returns The list items.
		 */
		public get items(): Iterable<ListItem> {
			return this.#domObserver.options.map((opt: SDOptionElement | SDRadioElement): ListItem => {
				return {
					disabled: opt.disabled,
					key: opt,
					label: opt.label,
					value: opt.value,
				};
			});
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
	public get items(): Iterable<ListItem>;
}

/**
 * Information about an item within a list.
 */
export type ListItem = {
	/**
	 * Determines whether the list item is disabled.
	 */
	disabled: boolean;

	/**
	 * Unique key that identifies the list item.
	 */
	key: unknown;

	/**
	 * Label of the list item.
	 */
	label: string | undefined;

	/**
	 * Value of the list item.
	 */
	value: boolean | number | string | undefined;
};
