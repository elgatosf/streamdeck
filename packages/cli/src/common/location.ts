/**
 * An object that references a location.
 */
export type LocationRef<T extends JsonLocation | Location = Location> = {
	/**
	 * The location this instance references.
	 */
	location?: T;
};

/**
 * Location of an item within a file.
 */
export type Location = {
	/**
	 * Column number.
	 */
	column?: number;

	/**
	 * Identifies the location within the file, for example the property reference for a JSON error.
	 */
	key: string | undefined;

	/**
	 * Line number.
	 */
	line?: number;
};

/**
 * Location of a JSON value within a file.
 */
export type JsonLocation = Location & {
	/**
	 * JSON pointer to the value.
	 */
	instancePath: string;
};
