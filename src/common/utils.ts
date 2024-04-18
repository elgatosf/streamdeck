/**
 * Gets the value at the specified {@link path}.
 * @param path Path to the property to get.
 * @param source Source object that is being read from.
 * @returns Value of the property.
 */
export function get(path: string, source: unknown): unknown {
	const props: string[] = path.split(".");
	return props.reduce((obj, prop) => obj && obj[prop as keyof object], source);
}
