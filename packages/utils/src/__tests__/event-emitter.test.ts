import { describe, expect, expectTypeOf, it, test, vi } from "vitest";

import { type EventArgs, EventEmitter, type EventsOf } from "../index.js";

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

	describe("listener events", () => {
		/**
		 * Asserts the built-in `newListener` event is emitted.
		 */
		describe("newListener", () => {
			test("adding listeners", () => {
				// Arrange.
				const newListenerFn = vi.fn();
				const listeners = [vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn()];

				const emitter = new EventEmitter<EventMap>();
				emitter.addListener("newListener", newListenerFn);

				// Act.
				emitter.addListener("another", listeners[0]);
				emitter.disposableOn("array", listeners[1]);
				emitter.on("empty", listeners[2]);
				emitter.once("message", listeners[3]);
				emitter.prependListener("other", listeners[4]);
				emitter.prependOnceListener("another", listeners[5]);

				// Assert.
				expect(newListenerFn).toHaveBeenCalledTimes(6);
				expect(newListenerFn).toHaveBeenNthCalledWith(1, "another", listeners[0]);
				expect(newListenerFn).toHaveBeenNthCalledWith(2, "array", listeners[1]);
				expect(newListenerFn).toHaveBeenNthCalledWith(3, "empty", listeners[2]);
				expect(newListenerFn).toHaveBeenNthCalledWith(4, "message", listeners[3]);
				expect(newListenerFn).toHaveBeenNthCalledWith(5, "other", listeners[4]);
				expect(newListenerFn).toHaveBeenNthCalledWith(6, "another", listeners[5]);
			});

			/**
			 * Asserts the `newListener` is not emitted when for new `newListener` listeners.
			 */
			test("does not emit for self", () => {
				// Arrange, act, assert.
				const emitter = new EventEmitter<EventMap>();
				expect(() => {
					emitter.addListener("newListener", vi.fn()); // Monitor stack overflow errors.
				}).not.toThrow();
			});

			/**
			 * Asserts the `newListener` is emitted for new `removeListener` listeners.
			 */
			test("emits for removeListener", () => {
				// Arrange.
				const newListenerFn = vi.fn();
				const removeListenerFn = vi.fn();

				const emitter = new EventEmitter<EventMap>();
				emitter.addListener("newListener", newListenerFn);

				// Act.
				emitter.addListener("removeListener", removeListenerFn);

				// Assert.
				expect(newListenerFn).toHaveBeenCalledExactlyOnceWith("removeListener", removeListenerFn);
			});
		});

		/**
		 * Asserts the built-in `removeListener` event is emitted.
		 */
		describe("removeListener", () => {
			/**
			 * Asserts `removeListener` is emitted when a listener is explicitly removed.
			 */
			test("removing listeners", () => {
				// Arrange.
				const removeListenerFn = vi.fn();
				const listeners = [vi.fn(), vi.fn(), vi.fn(), vi.fn()];

				const emitter = new EventEmitter<EventMap>();
				emitter.addListener("removeListener", removeListenerFn);

				emitter.addListener("another", listeners[0]);
				emitter.addListener("another", listeners[1]);
				emitter.prependListener("another", listeners[2]);

				emitter.addListener("array", listeners[3]);

				// Act.
				emitter.removeAllListeners("another");
				emitter.removeListener("array", listeners[3]);

				// Assert.
				expect(removeListenerFn).toHaveBeenCalledTimes(4);
				expect(removeListenerFn).toHaveBeenNthCalledWith(1, "another", listeners[2]); // prepend
				expect(removeListenerFn).toHaveBeenNthCalledWith(2, "another", listeners[0]);
				expect(removeListenerFn).toHaveBeenNthCalledWith(3, "another", listeners[1]);
				expect(removeListenerFn).toHaveBeenNthCalledWith(4, "array", listeners[3]);
			});

			/**
			 * Asserts `removeListener` is emitted when after a "once" listener is emitted.
			 */
			test("once listeners", () => {
				// Arrange.
				const removeListenerFn = vi.fn();
				const listeners = [vi.fn(), vi.fn(), vi.fn(), vi.fn()];

				const emitter = new EventEmitter<EventMap>();
				emitter.addListener("removeListener", removeListenerFn);

				emitter.once("another", listeners[0]);
				emitter.once("another", listeners[1]);
				emitter.prependOnceListener("another", listeners[2]);

				// Act.

				emitter.emit("another", 1);

				// Assert.
				expect(removeListenerFn).toHaveBeenCalledTimes(3);
				expect(removeListenerFn).toHaveBeenNthCalledWith(1, "another", listeners[2]); // prepend
				expect(removeListenerFn).toHaveBeenNthCalledWith(2, "another", listeners[0]);
				expect(removeListenerFn).toHaveBeenNthCalledWith(3, "another", listeners[1]);
			});

			/**
			 * Asserts `removeListener` is emitted when after a listener is disposed.
			 */
			test("disposable listeners", () => {
				// Arrange.
				const removeListenerFn = vi.fn();
				const listener = vi.fn();

				const emitter = new EventEmitter<EventMap>();
				emitter.addListener("removeListener", removeListenerFn);

				// Act.
				emitter.disposableOn("another", listener).dispose();

				// Assert.
				expect(removeListenerFn).toHaveBeenCalledTimes(1);
				expect(removeListenerFn).toHaveBeenNthCalledWith(1, "another", listener);
			});

			/**
			 * Asserts the `removeListener` is not emitted when listener for `removeListener` is removed.
			 */
			test("does not emit for self", () => {
				// Arrange.
				const removeListenerFn = vi.fn();
				const emitter = new EventEmitter<EventMap>();
				emitter.addListener("removeListener", removeListenerFn);

				// Act.
				emitter.removeAllListeners("removeListener");

				// Act.
				expect(removeListenerFn).not.toHaveBeenCalled();
			});
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
			// Arrange, act.
			const emitter = new EventEmitter<EventMap>();

			// Assert.
			expectTypeOf(emitter.eventNames()).toEqualTypeOf<
				("another" | "array" | "empty" | "message" | "newListener" | "other" | "removeListener" | (string & {}))[]
			>();

			// @ts-expect-error: arguments of type `string` are not valid
			type invalid = EventsOf<{
				invalid: string;
				valid: [name: string];
			}>;
		});

		/**
		 * Event arguments.
		 */
		it("event args", () => {
			// Arrange, act, assert.
			const emitter = new EventEmitter<EventMap>();
			emitter.once("empty", (...args) => expectTypeOf(args).toEqualTypeOf<[]>());
			emitter.once("message", (...args) => expectTypeOf(args).toEqualTypeOf<[message: string]>());
			emitter.once("array", (...args) => expectTypeOf(args).toEqualTypeOf<[id: number, name: string]>());

			type invalid = EventArgs<
				// @ts-expect-error: arguments of type `string` are not valid
				{ invalid: string },
				"invalid"
			>;
		});

		/**
		 * Event arguments for built-in events
		 */
		it("event args (built in)", () => {
			// Arrange.
			type UserServiceEventMap = {
				"user.create": [name: string];
				"user.get": [id: number];
			};

			// Act.
			const emitter = new EventEmitter<UserServiceEventMap>();

			// Assert
			emitter.once("newListener", (...args) =>
				expectTypeOf(args).toEqualTypeOf<
					["user.create", (name: string) => void] | ["user.get", (id: number) => void]
				>(),
			);
			emitter.once("removeListener", (...args) =>
				expectTypeOf(args).toEqualTypeOf<
					["user.create", (name: string) => void] | ["user.get", (id: number) => void]
				>(),
			);
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
