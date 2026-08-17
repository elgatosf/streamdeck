/**
 * Gets the value at the specified {@link path}.
 * @param source Source object that is being read from.
 * @param path Path to the property to get.
 * @returns Value of the property.
 */
export function get(source: unknown, path: string): unknown {
	const props: string[] = path.split(".");
	return props.reduce((obj, prop) => obj && obj[prop as keyof object], source);
}
