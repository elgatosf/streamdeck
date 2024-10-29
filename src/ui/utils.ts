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
 * An event triggered by an HTML input element, that allows for the target to be typed.
 */
export type HTMLInputEvent<Target> = InputEvent & {
	/**
	 * Target of the event.
	 */
	target: Target;
};
