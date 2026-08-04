/**
 * An extension of the upcoming explicit resource management disposable that defines a `dispose()` member.
 */
export interface IDisposable {
	/**
	 * Disposes this instance.
	 */
	[Symbol.dispose](): void;

	/**
	 * Disposes this instance.
	 */
	dispose(): void;
}
