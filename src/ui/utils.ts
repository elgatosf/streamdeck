/**
 * An event triggered by an HTML input element, that allows for the target to be typed.
 */
export type HTMLInputEvent<Target> = InputEvent & {
	/**
	 * Target of the event.
	 */
	target: Target;
};
