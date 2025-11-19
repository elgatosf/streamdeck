import { describe, expect, it, test, vi } from "vitest";

import type { Expect, TypesAreEqual } from "../../../tests/utils.js";
import { type EventArgs, EventEmitter, type EventsOf } from "../event-emitter.js";

describe("EventEmitter", () => {
	describe("adding listeners", () => {
		/**
		 * Asserts adding a listener with {@link EventEmitter.addListener}.
		 */
		test("addListener", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();

			// Act.
			emitter.addListener("message", listener);

			// Assert.
			emitter.emit("message", "First");
			emitter.emit("message", "Second");

			expect(listener).toHaveBeenCalledTimes(2);
			expect(listener).toHaveBeenNthCalledWith(1, "First");
			expect(listener).toHaveBeenNthCalledWith(2, "Second");
		});

		/**
		 * Asserts adding a listener with {@link EventEmitter.on}.
		 */
		test("on", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();

			// Act.
			emitter.on("message", listener);

			// Assert.
			emitter.emit("message", "First");
			emitter.emit("message", "Second");

			expect(listener).toHaveBeenCalledTimes(2);
			expect(listener).toHaveBeenNthCalledWith(1, "First");
			expect(listener).toHaveBeenNthCalledWith(2, "Second");
		});

		/**
		 * Asserts adding a listener with {@link EventEmitter.once}.
		 */
		test("once", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();

			// Act.
			emitter.once("message", listener);

			// Assert.
			emitter.emit("message", "First");
			emitter.emit("message", "Second");

			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith("First");
		});
	});

	describe("disposable listeners", () => {
		/**
		 * Asserts the {@link EventEmitter.disposableOn} adds the event listener.
		 */
		it("adds the listener", async () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();

			// Act.
			emitter.disposableOn("message", listener);
			emitter.emit("message", "Hello world");

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith("Hello world");
		});

		/**
		 * Asserts listeners added via {@link EventEmitter.disposableOn} can be removed by disposing.
		 */
		it("can remove after emitting", async () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();

			// Act.
			{
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using handler = emitter.disposableOn("message", listener);
				emitter.emit("message", "One");
			}

			emitter.emit("message", "Two");

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenNthCalledWith(1, "One");
		});

		/**
		 * Asserts the event listener is removed when disposing the result {@link EventEmitter.disposableOn} via `dispose()`.
		 */
		it("dispose", async () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();
			const handler = emitter.disposableOn("message", listener);

			// Act.
			handler.dispose();
			emitter.emit("message", "Hello world");

			// Assert.
			expect(listener).not.toHaveBeenCalled();
		});

		/**
		 * Asserts the event listener is removed when disposing the result {@link EventEmitter.disposableOn} via `[Symbol.dispose()]`
		 */
		it("[Symbol.dispose]", async () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();

			// Act.
			{
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				using handler = emitter.disposableOn("message", listener);
			}

			emitter.emit("message", "Hello world");

			// Assert.
			expect(listener).not.toHaveBeenCalled();
		});
	});

	/**
	 * Asserts emitting an event with {@link EventEmitter.emit}.
	 */
	it("emits to all listeners", () => {
		// Arrange.
		const emitter = new EventEmitter<EventMap>();
		const [listener, other] = [vi.fn(), vi.fn(), vi.fn(), vi.fn()];

		emitter.addListener("message", listener);
		emitter.addListener("message", listener);
		emitter.addListener("message", listener);
		emitter.addListener("other", other);

		emitter.emit("message", "Hello world");

		expect(listener).toHaveBeenCalledTimes(3);
		expect(listener).toHaveBeenCalledWith("Hello world");
		expect(other).toBeCalledTimes(0);
	});

	/**
	 * Asserts getting event names with listeners with {@link EventEmitter.eventNames}.
	 */
	test("eventNames", () => {
		// Arrange.
		const emitter = new EventEmitter<EventMap>();
		const listener = vi.fn();

		// Act, assert - no events.
		expect(emitter.eventNames()).toStrictEqual([]);

		// Act, assert - "message" event.
		emitter.addListener("message", listener);
		expect(emitter.eventNames()).toStrictEqual(["message"]);

		// Act, assert - "message" and "other" event.
		emitter.addListener("other", listener);
		expect(emitter.eventNames()).toStrictEqual(["message", "other"]);
	});

	describe("listenerCount", () => {
		/**
		 * Asserts the listener count with {@link EventEmitter.listenerCount} when a listener is defined.
		 */
		it("with listener", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();

			emitter.addListener("message", listener);
			emitter.addListener("message", listener);
			emitter.addListener("message", vi.fn());
			emitter.addListener("other", vi.fn());

			// Act, assert.
			expect(emitter.listenerCount("message", listener)).toBe(2);
			expect(emitter.listenerCount("message", listener)).toBe(2);
		});

		/**
		 * Asserts the listener count with {@link EventEmitter.listenerCount} when a listener is not defined.
		 */
		it("without listener", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();

			emitter.addListener("message", vi.fn());
			emitter.addListener("message", vi.fn());
			emitter.addListener("message", vi.fn());
			emitter.addListener("other", vi.fn());

			// Act, assert.
			expect(emitter.listenerCount("message")).toBe(3);
			expect(emitter.listenerCount("other")).toBe(1);
			expect(emitter.listenerCount("another")).toBe(0);
		});
	});

	/**
	 * Asserts getting event listeners with {@link EventEmitter.listeners}.
	 */
	test("listeners", () => {
		// Arrange.
		const emitter = new EventEmitter<EventMap>();
		const [one, two] = [vi.fn(), vi.fn()];

		emitter.addListener("message", one);
		emitter.addListener("message", two);
		emitter.addListener("message", two);

		// Act, assert.
		expect(emitter.listeners("message")).toStrictEqual([one, two, two]);
		expect(emitter.listeners("other")).toStrictEqual([]);
	});

	describe("prepending listeners", () => {
		/**
		 * Asserts prepending a listener with {@link EventEmitter.prependListener}.
		 */
		test("prependListener", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const [on, prepend] = [vi.fn(), vi.fn()];

			const order: unknown[] = [];
			on.mockImplementation(() => order.push(on));
			prepend.mockImplementation(() => order.push(prepend));

			// Act.
			emitter.on("message", on);
			emitter.prependListener("message", prepend);

			// Assert.
			emitter.emit("message", "Hello world");

			expect(on).toHaveBeenCalledTimes(1);
			expect(on).toBeCalledWith("Hello world");
			expect(prepend).toHaveBeenCalledTimes(1);
			expect(prepend).toBeCalledWith("Hello world");
			expect(order).toStrictEqual([prepend, on]);
		});

		/**
		 * Asserts prepending a listener with {@link EventEmitter.prependOnceListener}.
		 */
		test("prependOnceListener", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const [on, prepend] = [vi.fn(), vi.fn()];

			const order: unknown[] = [];
			on.mockImplementation(() => {
				order.push(on);
			});
			prepend.mockImplementation(() => order.push(prepend));

			// Act.
			emitter.on("message", on);
			emitter.prependOnceListener("message", prepend);

			// Assert.
			emitter.emit("message", "Hello world");
			emitter.emit("message", "Hello world");

			expect(on).toHaveBeenCalledTimes(2);
			expect(on).toBeCalledWith("Hello world");
			expect(prepend).toHaveBeenCalledTimes(1);
			expect(prepend).toBeCalledWith("Hello world");
			expect(order).toStrictEqual([prepend, on, on]);
		});
	});

	describe("removing listeners", () => {
		/**
		 * Asserts removing all listeners with {@link EventEmitter.off}.
		 */
		test("off", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const [one, two] = [vi.fn(), vi.fn()];

			emitter.off("message", one); // Assert removing before any are added.

			emitter.on("message", one);
			emitter.on("message", two);
			emitter.on("other", one);
			emitter.on("other", two);

			// Act.
			emitter.off("message", one);

			// Assert.
			emitter.emit("message", "Hello world");
			expect(one).not.toHaveBeenCalled();
			expect(two).toHaveBeenCalledTimes(1);
			expect(two).toHaveBeenCalledWith("Hello world");
		});

		/**
		 * Asserts removing all listeners with {@link EventEmitter.removeAllListeners}.
		 */
		test("removeAllListeners", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const [one, two] = [vi.fn(), vi.fn()];

			emitter.on("message", one);
			emitter.on("message", two);
			emitter.on("other", one);
			emitter.on("other", two);

			// Act.
			emitter.removeAllListeners("message");

			// Assert.
			emitter.emit("message", "Hello world");
			expect(one).not.toHaveBeenCalled();
			expect(two).not.toHaveBeenCalled();
		});

		/**
		 * Asserts removing a listener with {@link EventEmitter.removeListener}.
		 */
		test("removeListener", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const [one, two] = [vi.fn(), vi.fn()];

			emitter.on("message", one);
			emitter.on("message", two);
			emitter.on("other", one);
			emitter.on("other", two);

			// Act.
			emitter.removeListener("message", one);

			// Assert.
			emitter.emit("message", "Hello world");
			expect(one).not.toHaveBeenCalled();
			expect(two).toHaveBeenCalledTimes(1);
			expect(two).toHaveBeenCalledWith("Hello world");
		});
	});

	/* eslint-disable @typescript-eslint/no-unused-vars */
	describe("types", () => {
		/**
		 * Event map
		 */
		test("event map", () => {
			// @ts-expect-error: arguments of type `string` are not valid
			const invalidArgs = new EventEmitter<{
				invalid: string;
				valid: [name: string];
			}>();

			// @ts-expect-error: key of type `Number` is not valid.
			const invalidEventName = new EventEmitter<{
				[1]: [name: string];
				valid: [name: string];
			}>();
		});

		/**
		 * Event names.
		 */
		test("event name", () => {
			type eventName = Expect<
				TypesAreEqual<EventsOf<EventMap>, "another" | "array" | "empty" | "message" | "other" | (string & {})>
			>;

			// @ts-expect-error: arguments of type `string` are not valid
			type invalid = EventsOf<{
				invalid: string;
				valid: [name: string];
			}>;
		});

		/**
		 * Event arguments.
		 */
		it("events args", () => {
			type t = EventArgs<EventMap, "array">;

			type empty = Expect<TypesAreEqual<EventArgs<EventMap, "empty">, []>>;
			type single = Expect<TypesAreEqual<EventArgs<EventMap, "message">, [message: string]>>;
			type multiple = Expect<TypesAreEqual<EventArgs<EventMap, "array">, [id: number, name: string]>>;

			type invalid = EventArgs<
				// @ts-expect-error: arguments of type `string` are not valid
				{ invalid: string },
				"invalid"
			>;
		});
	});
	/* eslint-enable @typescript-eslint/no-unused-vars */
});

type EventMap = {
	message: [message: string];
	other: [id: number];
	another: [id: number];
	empty: [];
	array: [id: number, name: string];
};
