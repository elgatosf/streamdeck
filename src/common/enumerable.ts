/**
 * Provides a read-only iterable collection of items that also acts as a partial polyfill for iterator helpers.
 */
export class Enumerable<T> implements IterableIterator<T> {
	/**
	 * Backing function responsible for providing the iterator of items.
	 */
	readonly #items: () => IterableIterator<T>;

	/**
	 * Backing function for {@link Enumerable.length}.
	 */
	readonly #length: () => number;

	/**
	 * Initializes a new instance of the {@link Enumerable} class.
	 * @param source Source that contains the items.
	 * @returns The enumerable.
	 */
	constructor(source: Enumerable<T> | Map<unknown, T> | Set<T> | T[] | (() => IterableIterator<T>)) {
		if (source instanceof Enumerable) {
			// Enumerable
			this.#items = source.#items;
			this.#length = source.#length;
		} else if (Array.isArray(source)) {
			// Array
			this.#items = (): IterableIterator<T> => source.values();
			this.#length = (): number => source.length;
		} else if (source instanceof Map || source instanceof Set) {
			// Map or Set
			this.#items = (): IterableIterator<T> => source.values();
			this.#length = (): number => source.size;
		} else {
			// IterableIterator
			this.#items = source;
			this.#length = () => this.reduce((count) => count++, 0);
		}
	}

	/**
	 * Gets the number of items in the enumerable.
	 * @returns The number of items.
	 */
	public get length(): number {
		return this.#length();
	}

	/**
	 * Gets the iterator for the enumerable.
	 * @yields The items.
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
	public filter(predicate: (value: T) => boolean): Enumerable<T> {
		return new Enumerable(
			function* (this: Enumerable<T>) {
				for (const item of this.#items()) {
					if (predicate(item)) {
						yield item;
					}
				}
			}.bind(this)
		);
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
	public map<U>(mapper: (value: T) => U): Enumerable<U> {
		return new Enumerable<U>(
			function* (this: Enumerable<T>) {
				for (const item of this.#items()) {
					yield mapper(item);
				}
			}.bind(this)
		);
	}

	/**
	 * @inheritdoc
	 */
	public next(...args: [] | [undefined]): IteratorResult<T, any> {
		return this.#items().next(...args);
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
	 * @inheritdoc
	 */
	public return?<TReturn>(value?: TReturn): IteratorResult<T, TReturn | undefined> {
		return { value, done: true };
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

	/**
	 * @inheritdoc
	 */
	public throw?<TReturn>(e?: TReturn): never {
		throw e;
	}

	/**
	 * Converts this iterator to an array.
	 * @returns The array of items from this iterator.
	 */
	public toArray(): T[] {
		throw new Error("Not implemented");
	}
}
