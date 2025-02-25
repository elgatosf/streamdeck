import type { LitElement, ReactiveElement } from "lit";

/**
 * Invokes the decorated function when one of the properties' values changes.
 * @param propertyName Name of the properties to watch.
 * @returns The original function.
 */
export function watch<T extends () => void>(
	propertyName: string[] | string,
): (fn: T, context: ClassMethodDecoratorContext<LitElement>) => T {
	const watchedProperties = Array.isArray(propertyName) ? propertyName : [propertyName];

	return (fn: T, context: ClassMethodDecoratorContext<LitElement>): T => {
		context.addInitializer(function () {
			const elem = this as unknown as LitElement & UnprotectedReactiveElement;
			const { willUpdate } = elem;

			// Update the original `willUpdate`.
			elem.willUpdate = function (_changedProperties: Map<PropertyKey, unknown>): void {
				willUpdate.call(this, _changedProperties);

				// Check if the one of the watch properties has changed.
				for (const key of watchedProperties) {
					if (_changedProperties.has(key)) {
						fn.call(this);
						return;
					}
				}
			};
		});

		return fn;
	};
}

/**
 * Utility type for {@link ReactiveElement} that updates the visibility of methods for mutation.
 */
type UnprotectedReactiveElement = ReactiveElement & {
	/**
	 * See {@link ReactiveElement.willUpdate}.
	 */
	willUpdate(_changedProperties: Map<PropertyKey, unknown>): void;
};
