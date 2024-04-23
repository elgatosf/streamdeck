import path from "node:path";

let __isDebugMode: boolean | undefined = undefined;

/**
 * Determines whether the current plugin is running in a debug environment; this is determined by the command-line arguments supplied to the plugin by Stream. Specifically, the result
 * is `true` when  either `--inspect`, `--inspect-brk` or `--inspect-port` are present as part of the processes' arguments.
 * @returns `true` when the plugin is running in debug mode; otherwise `false`.
 */
export function isDebugMode(): boolean {
	if (__isDebugMode === undefined) {
		__isDebugMode = process.execArgv.some((arg) => {
			const name = arg.split("=")[0];
			return name === "--inspect" || name === "--inspect-brk" || name === "--inspect-port";
		});
	}

	return __isDebugMode;
}

/**
 * Gets the plugin's unique-identifier from the current working directory.
 * @returns The plugin's unique-identifier.
 */
export function getPluginUUID(): string {
	const name = path.basename(process.cwd());
	const suffixIndex = name.lastIndexOf(".sdPlugin");

	return suffixIndex < 0 ? name : name.substring(0, suffixIndex);
}

/**
 * Helper type used by `StrictUnion` to extract keys of type `T`. Credit {@link https://stackoverflow.com/a/65805753/259656}.
 * @template T Type whose keys are being extracted.
 */
type UnionKeys<T> = T extends T ? keyof T : never;

/**
 * Defines a type that implements a constructor that accepts an array of `any` parameters; utilized for mixins.
 */
export type Constructor<T> = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	new (...args: any[]): T;
};

/**
 * Constructs a union type of `number` for the given `TLength`. The union type is indexed from zero. Credit {@link https://stackoverflow.com/a/39495173}
 * @template TLength Length of the union.
 * @template TAcc Accumulated types.
 */
export type Enumerate<TLength extends number, TAcc extends number[] = []> = TAcc["length"] extends TLength ? TAcc[number] : Enumerate<TLength, [...TAcc, TAcc["length"]]>;

/**
 * Unpacks the type; when the type is an array, the underlying the type is inferred.
 */
export type Unpack<T> = T extends (infer U)[] ? U : T;

/**
 * Reduces excess properties amongst the union type `TUnion`. Credit {@link https://stackoverflow.com/a/65805753/259656}.
 * @template TUnion Union type being converted to a strict type.
 * @template TStrict Reference type used to remove excess properties from the inferred type.
 */
export type StrictUnion<TUnion, TStrict = TUnion> = TStrict extends unknown ? Partial<Record<Exclude<UnionKeys<TUnion>, keyof TStrict>, never>> & TStrict : never;
