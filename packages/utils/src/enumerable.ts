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
	 * Captured iterator from the underlying iterable; used to fulfil {@link IterableIterator} methods.
	 */
	#iterator: Iterator<T> | undefined;

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
			// IterableIterator delegate
			this.#items = source;
			this.#length = (): number => {
				let i = 0;
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				for (const _ of this) {
					i++;
				}

				return i;
			};
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
	 * Transforms each item within this iterator to an indexed pair, with each pair represented as an array.
	 * @returns An iterator of indexed pairs.
	 */
	public asIndexedPairs(): Enumerable<[number, T]> {
		return new Enumerable(
			function* (this: Enumerable<T>): IterableIterator<[number, T]> {
				let i = 0;
				for (const item of this) {
					yield [i++, item] as [number, T];
				}
			}.bind(this),
		);
	}

	/**
	 * Returns an iterator with the first items dropped, up to the specified limit.
	 * @param limit The number of elements to drop from the start of the iteration.
	 * @returns An iterator of items after the limit.
	 */
	public drop(limit: number): Enumerable<T> {
		if (isNaN(limit) || limit < 0) {
			throw new RangeError("limit must be 0, or a positive number");
		}

		return new Enumerable(
			function* (this: Enumerable<T>): IterableIterator<T> {
				let i = 0;
				for (const item of this) {
					if (i++ >= limit) {
						yield item;
					}
				}
			}.bind(this),
		);
	}

	/**
	 * Determines whether all items satisfy the specified predicate.
	 * @param predicate Function that determines whether each item fulfils the predicate.
	 * @returns `true` when all items satisfy the predicate; otherwise `false`.
	 */
	public every(predicate: (value: T) => boolean): boolean {
		for (const item of this) {
			if (!predicate(item)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Returns an iterator of items that meet the specified predicate..
	 * @param predicate Function that determines which items to filter.
	 * @returns An iterator of filtered items.
	 */
	public filter(predicate: (value: T) => boolean): Enumerable<T> {
		return new Enumerable(
			function* (this: Enumerable<T>): IterableIterator<T> {
				for (const item of this) {
					if (predicate(item)) {
						yield item;
					}
				}
			}.bind(this),
		);
	}

	/**
	 * Finds the first item that satisfies the specified predicate.
	 * @param predicate Predicate to match items against.
	 * @returns The first item that satisfied the predicate; otherwise `undefined`.
	 */
	public find(predicate: (value: T) => boolean): T | undefined {
		for (const item of this) {
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
		for (const item of this) {
			if (predicate(item)) {
				result = item;
			}
		}

		return result;
	}

	/**
	 * Returns an iterator containing items transformed using the specified mapper function.
	 * @param mapper Function responsible for transforming each item.
	 * @returns An iterator of transformed items.
	 */
	public flatMap<U>(mapper: (item: T) => IterableIterator<U>): Enumerable<U> {
		return new Enumerable(
			function* (this: Enumerable<T>): IterableIterator<U> {
				for (const item of this) {
					for (const mapped of mapper(item)) {
						yield mapped;
					}
				}
			}.bind(this),
		);
	}

	/**
	 * Iterates over each item, and invokes the specified function.
	 * @param fn Function to invoke against each item.
	 */
	public forEach(fn: (item: T) => void): void {
		for (const item of this) {
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
	 * Returns an iterator of mapped items using the mapper function.
	 * @param mapper Function responsible for mapping the items.
	 * @returns An iterator of mapped items.
	 */
	public map<U>(mapper: (value: T) => U): Enumerable<U> {
		return new Enumerable<U>(
			function* (this: Enumerable<T>): IterableIterator<U> {
				for (const item of this) {
					yield mapper(item);
				}
			}.bind(this),
		);
	}

	/**
	 * Captures the underlying iterable, if it is not already captured, and gets the next item in the iterator.
	 * @param args Optional values to send to the generator.
	 * @returns An iterator result of the current iteration; when `done` is `false`, the current `value` is provided.
	 */
	public next(...args: [] | [undefined]): IteratorResult<T, T> {
		this.#iterator ??= this.#items();
		const result = this.#iterator.next(...args);

		if (result.done) {
			this.#iterator = undefined;
		}

		return result;
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
		for (const item of this) {
			if (result === undefined) {
				result = item;
			} else {
				result = accumulator(result, item);
			}
		}

		return result!;
	}

	/**
	 * Acts as if a `return` statement is inserted in the generator's body at the current suspended position.
	 *
	 * Please note, in the context of an {@link Enumerable}, calling {@link Enumerable.return} will clear the captured iterator,
	 * if there is one. Subsequent calls to {@link Enumerable.next} will result in re-capturing the underlying iterable, and
	 * yielding items from the beginning.
	 * @param value Value to return.
	 * @returns The value as an iterator result.
	 */
	public return?<TReturn>(value?: TReturn): IteratorResult<T, TReturn | undefined> {
		this.#iterator = undefined;
		return { done: true, value };
	}

	/**
	 * Determines whether an item in the collection exists that satisfies the specified predicate.
	 * @param predicate Function used to search for an item.
	 * @returns `true` when the item was found; otherwise `false`.
	 */
	public some(predicate: (value: T) => boolean): boolean {
		for (const item of this) {
			if (predicate(item)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns an iterator with the items, from 0, up to the specified limit.
	 * @param limit Limit of items to take.
	 * @returns An iterator of items from 0 to the limit.
	 */
	public take(limit: number): Enumerable<T> {
		if (isNaN(limit) || limit < 0) {
			throw new RangeError("limit must be 0, or a positive number");
		}

		return new Enumerable(
			function* (this: Enumerable<T>): IterableIterator<T> {
				let i = 0;
				for (const item of this) {
					if (i++ < limit) {
						yield item;
					}
				}
			}.bind(this),
		);
	}

	/**
	 * Acts as if a `throw` statement is inserted in the generator's body at the current suspended position.
	 * @param e Error to throw.
	 */
	public throw?<TReturn>(e?: TReturn): IteratorResult<T, TReturn | undefined> {
		throw e;
	}

	/**
	 * Converts this iterator to an array.
	 * @returns The array of items from this iterator.
	 */
	public toArray(): T[] {
		return Array.from(this);
	}

	/**
	 * Converts this iterator to serializable collection.
	 * @returns The serializable collection of items.
	 */
	public toJSON(): T[] {
		return this.toArray();
	}

	/**
	 * Converts this iterator to a string.
	 * @returns The string.
	 */
	public toString(): string {
		return `${this.toArray()}`;
	}
}
