/**
 * Provides a read-only iterable collection of items.
 */
export class Enumerable<T> {
	/**
	 * Backing function responsible for providing the iterator of items.
	 */
	readonly #items: () => Iterable<T>;

	/**
	 * Backing function for {@link Enumerable.length}.
	 */
	readonly #length: () => number;

	/**
	 * Initializes a new instance of the {@link Enumerable} class.
	 * @param items Underlying iterator responsible for providing the items.
	 * @param length Function to get the number of items.
	 */
	private constructor(items: () => Iterable<T>, length: () => number) {
		this.#items = items;
		this.#length = length;
	}

	/**
	 * Gets the number of items in the enumerable.
	 * @returns The number of items.
	 */
	public get length(): number {
		return this.#length();
	}

	/**
	 * Creates a new enumerable from the specified array.
	 * @param source Source array.
	 * @returns The enumerable.
	 */
	public static from<T>(source: T[]): Enumerable<T>;
	/**
	 * Creates a new enumerable from the specified map.
	 * @param source Source map.
	 * @returns The enumerable.
	 */
	public static from<T, K>(source: Map<K, T>): Enumerable<T>;
	/**
	 * Creates a new enumerable from the specified set.
	 * @param source Source set.
	 * @returns The enumerable.
	 */
	public static from<T>(source: Set<T>): Enumerable<T>;
	/**
	 * Creates a new enumerable from the specified items.
	 * @param source Source that contains the items.
	 * @returns The enumerable.
	 */
	public static from<T, K>(source: Map<K, T> | Set<T> | T[]): Enumerable<T> {
		if (Array.isArray(source)) {
			return new Enumerable(
				() => source,
				() => source.length
			);
		}

		return new Enumerable(
			() => source.values(),
			() => source.size
		);
	}

	/**
	 * Gets the iterator for the enumerable.
	 * @returns The iterator.
	 */
	public *[Symbol.iterator](): IterableIterator<T> {
		for (const item of this.#items()) {
			yield item;
		}
	}

	/**
	 * Determines whether all items satisfy the specified predicate.
	 * @param predicate Function that determines whether each item fulfils the predicate.
	 * @returns `true` when all items satisfy the predicate; otherwise `false`.
	 */
	public every(predicate: (value: T) => boolean): boolean {
		for (const item of this.#items()) {
			if (!predicate(item)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Returns an iterable of items that meet the specified condition.
	 * @param predicate Function that determines which items to filter.
	 * @yields The filtered items; items that returned `true` when invoked against the predicate.
	 */
	public *filter(predicate: (value: T) => boolean): IterableIterator<T> {
		for (const item of this.#items()) {
			if (predicate(item)) {
				yield item;
			}
		}
	}

	/**
	 * Finds the first item that satisfies the specified predicate.
	 * @param predicate Predicate to match items against.
	 * @returns The first item that satisfied the predicate; otherwise `undefined`.
	 */
	public find(predicate: (value: T) => boolean): T | undefined {
		for (const item of this.#items()) {
			if (predicate(item)) {
				return item;
			}
		}
	}

	/**
	 * Finds the last item that satisfies the specified predicate.
	 * @param predicate Predicate to match items against.
	 * @returns The first item that satisfied the predicate; otherwise `undefined`.
	 */
	public findLast(predicate: (value: T) => boolean): T | undefined {
		let result = undefined;
		for (const item of this.#items()) {
			if (predicate(item)) {
				result = item;
			}
		}

		return result;
	}

	/**
	 * Iterates over each item, and invokes the specified function.
	 * @param fn Function to invoke against each item.
	 */
	public forEach(fn: (item: T) => void): void {
		for (const item of this.#items()) {
			fn(item);
		}
	}

	/**
	 * Determines whether the search item exists in the collection exists.
	 * @param search Item to search for.
	 * @returns `true` when the item was found; otherwise `false`.
	 */
	public includes(search: T): boolean {
		return this.some((item) => item === search);
	}

	/**
	 * Maps each item within the collection to a new structure using the specified mapping function.
	 * @param mapper Function responsible for mapping the items.
	 * @yields The mapped items.
	 */
	public *map<U>(mapper: (value: T) => U): Iterable<U> {
		for (const item of this.#items()) {
			yield mapper(item);
		}
	}

	/**
	 * Applies the accumulator function to each item, and returns the result.
	 * @param accumulator Function responsible for accumulating all items within the collection.
	 * @returns Result of accumulating each value.
	 */
	public reduce(accumulator: (previous: T, current: T) => T): T;
	/**
	 * Applies the accumulator function to each item, and returns the result.
	 * @param accumulator Function responsible for accumulating all items within the collection.
	 * @param initial Initial value supplied to the accumulator.
	 * @returns Result of accumulating each value.
	 */
	public reduce<R>(accumulator: (previous: R, current: T) => R, initial: R): R;
	/**
	 * Applies the accumulator function to each item, and returns the result.
	 * @param accumulator Function responsible for accumulating all items within the collection.
	 * @param initial Initial value supplied to the accumulator.
	 * @returns Result of accumulating each value.
	 */
	public reduce<R>(accumulator: (previous: R | T, current: T) => R | T, initial?: R | T): R | T {
		if (this.length === 0) {
			if (initial === undefined) {
				throw new TypeError("Reduce of empty enumerable with no initial value.");
			}

			return initial;
		}

		let result = initial;
		for (const item of this.#items()) {
			if (result === undefined) {
				result = item;
			} else {
				result = accumulator(result, item);
			}
		}

		return result!;
	}

	/**
	 * Determines whether an item in the collection exists that satisfies the specified predicate.
	 * @param predicate Function used to search for an item.
	 * @returns `true` when the item was found; otherwise `false`.
	 */
	public some(predicate: (value: T) => boolean): boolean {
		for (const item of this.#items()) {
			if (predicate(item)) {
				return true;
			}
		}

		return false;
	}
}
