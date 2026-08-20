/**
 * Aggregates the {@link items} to a string of items separated by a comma (,), with the {@link conjunction} applied to the last item.
 * @param items Items to aggregate.
 * @param conjunction Final conjunction used to add the last item.
 * @param transform Optional function used to transform the value.
 * @returns Items aggregated to a string.
 */
export function aggregate(items: string[], conjunction: "and" | "or", transform?: (value: string) => string): string {
	const fn = transform || ((value: string): string => value);

	return items.reduce((prev, current, index) => {
		const value = fn(current);

		if (index === 0) {
			return value;
		} else if (index === items.length - 1 && index > 0) {
			return `${prev}, ${conjunction} ${value}`;
		} else {
			return `${prev}, ${value}`;
		}
	}, "");
}
