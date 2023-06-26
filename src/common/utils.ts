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

/**
 * Determines whether the current plugin is running in a debug environment; this is determined by the command-line arguments supplied to the plugin by Stream.
 * Specifically, either `--inspect`, `--inspect-brk` or `--inspect-port` must be present.
 */
export const isDebugMode = (function () {
	for (const arg of process.execArgv) {
		const name = arg.split("=")[0];
		if (name === "--inspect" || name === "--inspect-brk" || name === "--inspect-port") {
			return true;
		}
	}

	return false;
})();

/**
 * Helper type used by `StrictUnion` to extract keys of type `T`. Credit {@link https://stackoverflow.com/a/65805753/259656}.
 * @template T Type whose keys are being extracted.
 */
type UnionKeys<T> = T extends T ? keyof T : never;

/**
 * Constructs a union type of `number` for the given `TLength`. The union type is indexed from zero. Credit {@link https://stackoverflow.com/a/39495173}
 * @template TLength Length of the union.
 * @template TAcc Accumulated types.
 */
export type Enumerate<TLength extends number, TAcc extends number[] = []> = TAcc["length"] extends TLength ? TAcc[number] : Enumerate<TLength, [...TAcc, TAcc["length"]]>;

/**
 * Reduces excess properties amongst the union type `TUnion`. Credit {@link https://stackoverflow.com/a/65805753/259656}.
 * @template TUnion Union type being converted to a strict type.
 * @template TStrict Reference type used to remove excess properties from the inferred type.
 */
export type StrictUnion<TUnion, TStrict = TUnion> = TStrict extends unknown ? Partial<Record<Exclude<UnionKeys<TUnion>, keyof TStrict>, never>> & TStrict : never;
