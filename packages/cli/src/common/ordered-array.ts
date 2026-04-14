/**
 * An ordered array; items pushed onto the array are inserted in the sort ordered as defined by the `compareOn` delegates provided in the constructor.
 */
export class OrderedArray<T> extends Array<T> {
	/**
	 * Delegates responsible for determining the sort order.
	 */
	readonly #compareOn: ((value: T) => number | string)[];

	/**
	 * Initializes a new instance of the {@link OrderedArray} class.
	 * @param compareOn Delegates responsible for determining the sort order.
	 */
	constructor(...compareOn: ((value: T) => number | string)[]) {
		super();
		this.#compareOn = compareOn;
	}

	/**
	 * "Pushes" the specified {@link value} in a sorted order.
	 * @param value Value to push.
	 * @returns New length of the array.
	 */
	public push(value: T): number {
		super.splice(this.#sortedIndex(value), 0, value);
		return this.length;
	}

	/**
	 * Compares {@link a} to {@link b} and returns a numerical representation of the comparison.
	 * @param a Item A.
	 * @param b Item B.
	 * @returns `-1` when {@link a} is less than {@link b}, `1` when {@link a} is greater than {@link b}, otherwise `0`
	 */
	#compare(a: T, b: T): number {
		for (const compareOn of this.#compareOn) {
			const x = compareOn(a);
			const y = compareOn(b);

			if (x < y) {
				return -1;
			} else if (x > y) {
				return 1;
			}
		}

		return 0;
	}

	/**
	 * Gets the sorted index of the specified {@link value} relative to this instance.
	 * Inspired by {@link https://stackoverflow.com/a/21822316}.
	 * @param value The value.
	 * @returns Index.
	 */
	#sortedIndex(value: T): number {
		let low = 0;
		let high = this.length;

		while (low < high) {
			const mid = (low + high) >>> 1;
			const comparison = this.#compare(value, this[mid]);

			if (comparison === 0) {
				return mid;
			} else if (comparison > 0) {
				low = mid + 1;
			} else {
				high = mid;
			}
		}

		return low;
	}
}
