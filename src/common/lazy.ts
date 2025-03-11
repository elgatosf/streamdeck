/**
 * Provides a wrapper around a value that is lazily instantiated.
 */
export class Lazy<T> {
	/**
	 * Private backing field for {@link Lazy.value}.
	 */
	#value: T | undefined = undefined;

	/**
	 * Factory responsible for instantiating the value.
	 */
	#valueFactory: () => T;

	/**
	 * Initializes a new instance of the {@link Lazy} class.
	 * @param valueFactory The factory responsible for instantiating the value.
	 */
	constructor(valueFactory: () => T) {
		this.#valueFactory = valueFactory;
	}

	/**
	 * Gets the value.
	 * @returns The value.
	 */
	public get value(): T {
		if (this.#value === undefined) {
			this.#value = this.#valueFactory();
		}

		return this.#value;
	}
}
