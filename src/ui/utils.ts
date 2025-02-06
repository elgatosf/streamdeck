/**
 * Utility function for building CSS class names from an array of truthy values.
 * @param values CSS class names; when truthy, the class name will be included in the result.
 * @returns The flattened CSS class name; otherwise `undefined` when no values were truthy.
 */
export function cls(...values: unknown[]): string {
	let str = "";
	for (const value of values) {
		if (value) {
			str += str ? ` ${value}` : value;
		}
	}

	return str;
}

/**
 * Prevents the default behavior occurring when a double click occurs, preventing text-selection.
 * @param ev Source event.
 */
export function preventDoubleClickSelection(ev: MouseEvent): void {
	if (ev.detail > 1) {
		ev.preventDefault();
	}
}

/**
 * Information for an HTML event.
 */
export type HTMLEvent<TTarget, TSource = Event> = Omit<TSource, "target"> & {
	/**
	 * Element the event was dispatched from.
	 */
	readonly target: TTarget;
};
