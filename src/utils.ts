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
