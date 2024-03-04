import { deferredDisposable, type IDisposable } from "../disposable";

describe("deferredDisposable", () => {
	describe("dispose", () => {
		/**
		 * Asserts {@link deferredDisposable} invokes the delegate function when calling {@link IDisposable.dispose}.
		 */
		it("invokes delegate", () => {
			// Arrange.
			const listener = jest.fn();
			const disposable = deferredDisposable(listener);

			// Act.
			disposable.dispose();

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link deferredDisposable} invokes the delegate function only once when calling {@link IDisposable.dispose}.
		 */
		it("invokes delegate once only", () => {
			// Arrange.
			const listener = jest.fn();
			const disposable = deferredDisposable(listener);

			// Act.
			disposable.dispose();
			disposable.dispose();
			disposable.dispose();

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
		});
	});

	describe("[Symbol.dispose]", () => {
		/**
		 * Asserts {@link deferredDisposable} invokes the delegate function when calling {@link IDisposable.[Symbol.dispose]}.
		 */
		it("invokes delegate", () => {
			// Arrange.
			const listener = jest.fn();

			{
				// Act.
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using disposable = deferredDisposable(listener);
			}

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link deferredDisposable} invokes the delegate function only once when calling {@link IDisposable.[Symbol.dispose]}.
		 */
		it("invokes delegate once only", () => {
			// Arrange.
			const listener = jest.fn();

			{
				// Act.
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using disposable = deferredDisposable(listener);
				disposable[Symbol.dispose]();
				disposable[Symbol.dispose]();
			}

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
		});
	});

	/**
	 * Asserts {@link deferredDisposable} invokes the delegate function only once when calling {@link IDisposable.dispose} and {@link IDisposable[Symbol.dispose]}.
	 */
	describe("dispose and [Symbol.dispose]", () => {
		it("invokes delegate once only", () => {
			// Arrange.
			const listener = jest.fn();

			{
				// Act.
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using disposable = deferredDisposable(listener);
				disposable.dispose();
				disposable[Symbol.dispose]();
			}

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
		});
	});
});
