import { getConnection } from "../../../tests/__mocks__/connection";
import { StreamDeckConnection } from "../../connectivity/connection";
import { ApplicationDidLaunch, EventMap } from "../../connectivity/events";
import { deferredDisposable, disposableListenerFactory, type IDisposable } from "../disposable";

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

describe("disposableListenerFactory", () => {
	/**
	 * Asserts the function result of {@link disposableListenerFactory} adds the event listener.
	 */
	it("adds the listener", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const listener = jest.fn();

		// Act.
		disposableListenerFactory<StreamDeckConnection, EventMap>()(connection, "applicationDidLaunch", listener);
		emitMessage({
			event: "applicationDidLaunch",
			payload: { application: "one" }
		} satisfies ApplicationDidLaunch);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[ApplicationDidLaunch]>({
			event: "applicationDidLaunch",
			payload: { application: "one" }
		});
	});

	/**
	 * Asserts the listener added via {@link disposableListenerFactory} can be removed by disposing.
	 */
	it("can remove after emitting", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const listener = jest.fn();

		// Act.
		const disposableListener = disposableListenerFactory<StreamDeckConnection, EventMap>()(connection, "applicationDidLaunch", listener);
		emitMessage({
			event: "applicationDidLaunch",
			payload: { application: "one" }
		} satisfies ApplicationDidLaunch);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[ApplicationDidLaunch]>({
			event: "applicationDidLaunch",
			payload: { application: "one" }
		});

		// Re-act
		disposableListener.dispose();
		emitMessage({
			event: "applicationDidLaunch",
			payload: { application: "__two__" }
		} satisfies ApplicationDidLaunch);

		// Re-assert
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenLastCalledWith<[ApplicationDidLaunch]>({
			event: "applicationDidLaunch",
			payload: { application: "one" }
		});
	});

	describe("removing the listener", () => {
		/**
		 * Asserts `dispose()` on the result of the {@link disposableListenerFactory} result, removes the listener.
		 */
		it("dispose", () => {
			// Arrange.
			const { connection, emitMessage } = getConnection();
			const listener = jest.fn();

			// Act.
			disposableListenerFactory<StreamDeckConnection, EventMap>()(connection, "applicationDidLaunch", listener).dispose();
			emitMessage({
				event: "applicationDidLaunch",
				payload: { application: "one" }
			} satisfies ApplicationDidLaunch);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(0);
		});

		/**
		 * Asserts `[Symbol.dispose]()` on the result of the {@link disposableListenerFactory} result, removes the listener.
		 */
		it("[Symbol.dispose]", () => {
			// Arrange.
			const { connection, emitMessage } = getConnection();
			const listener = jest.fn();

			// Act.
			{
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using disposableListener = disposableListenerFactory<StreamDeckConnection, EventMap>()(connection, "applicationDidLaunch", listener);
			}

			emitMessage({
				event: "applicationDidLaunch",
				payload: { application: "one" }
			} satisfies ApplicationDidLaunch);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(0);
		});
	});
});
