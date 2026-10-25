import { describe, expect, expectTypeOf, it, test, vi } from "vitest";

import {
	type EventArgs,
	EventEmitter,
	type EventsOf,
	type NewListenerArgs,
	type RemoveListenerArgs,
} from "../index.js";

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

	describe("options.once", () => {
		/**
		 * Asserts `EventListenerOptions.once` removes listeners.
		 */
		test("removes listeners", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();

			const listener = vi.fn();
			emitter.addListener("message", listener, { once: true });
			emitter.disposableOn("message", listener, { once: true });
			emitter.on("message", listener, { once: true });
			emitter.prependListener("message", listener, { once: true });

			// Act.
			emitter.emit("message", "Hello world");

			// Assert.
			expect(listener).toHaveBeenCalledTimes(4);
			expect(emitter.listenerCount("message")).toBe(0);
		});

		/**
		 * Asserts `EventListenerOptions.once` fires `removeListener` after emitting.
		 */
		test("fires removeListener after emitting", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();

			const removeListener = vi.fn();
			emitter.addListener("removeListener", removeListener);

			const listener = vi.fn();
			emitter.addListener("message", listener, { once: true });
			emitter.disposableOn("message", listener, { once: true });
			emitter.on("message", listener, { once: true });
			emitter.prependListener("message", listener, { once: true });

			// Act.
			emitter.emit("message", "Hello world");

			// Assert.
			expect(removeListener).toHaveBeenCalledTimes(4);
		});
	});

	describe("options.signal", () => {
		/**
		 * Asserts `EventListenerOptions.signal` removes listeners.
		 */
		test("abort removes listener", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();

			const controller = new AbortController();

			emitter.addListener("message", listener, { signal: controller.signal });
			emitter.on("message", listener, { signal: controller.signal });
			emitter.once("message", listener, { signal: controller.signal });
			emitter.prependListener("message", listener, { signal: controller.signal });
			emitter.prependOnceListener("message", listener, { signal: controller.signal });

			// Act
			controller.abort();
			emitter.emit("message", "World");

			// Assert
			expect(listener).toHaveBeenCalledTimes(0);
			expect(emitter.listenerCount("message")).toBe(0);
		});

		/**
		 * Asserts `EventListenerOptions.signal` does not add listeners if already aborted.
		 */
		test("already aborted does not add listener", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();

			const controller = new AbortController();
			controller.abort();

			// Act.
			emitter.addListener("message", listener, { signal: controller.signal });
			emitter.on("message", listener, { signal: controller.signal });
			emitter.once("message", listener, { signal: controller.signal });
			emitter.prependListener("message", listener, { signal: controller.signal });
			emitter.prependOnceListener("message", listener, { signal: controller.signal });

			emitter.emit("message", "Hello");

			// Assert.
			expect(listener).toHaveBeenCalledTimes(0);
			expect(emitter.listenerCount("message")).toBe(0);
		});

		/**
		 * Asserts listeners removed by `EventListenerOptions.signal` do not fire `removeListener`.
		 */
		test("does not emit removeListener after abort", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();

			const controller = new AbortController();

			emitter.addListener("message", listener, { signal: controller.signal });
			emitter.on("message", listener, { signal: controller.signal });
			emitter.once("message", listener, { signal: controller.signal });
			emitter.prependListener("message", listener, { signal: controller.signal });
			emitter.prependOnceListener("message", listener, { signal: controller.signal });

			const removeListener = vi.fn();
			emitter.on("removeListener", removeListener);

			// Act
			controller.abort();

			// Assert
			expect(removeListener).toHaveBeenCalledTimes(0);
		});

		/**
		 * Asserts aborting removes the event entirely when no other listeners remain.
		 */
		test("abort removes the event", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const controller = new AbortController();
			emitter.on("message", vi.fn(), { signal: controller.signal });

			// Act.
			controller.abort();

			// Assert.
			expect(emitter.eventNames()).toEqual([]);
			expect(emitter.listeners("message")).toEqual([]);
			expect(emitter.emit("message", "Hello")).toBe(false);
		});

		/**
		 * Asserts the abort handler is unregistered from the signal when the listener is removed by other means.
		 */
		test.each([
			{
				name: "off",
				remove: (emitter: EventEmitter<EventMap>, listener: () => void): void => void emitter.off("message", listener),
			},
			{
				name: "removeAllListeners",
				remove: (emitter: EventEmitter<EventMap>): void => void emitter.removeAllListeners("message"),
			},
			{
				name: "once",
				once: true,
				remove: (emitter: EventEmitter<EventMap>): void => void emitter.emit("message", "Hello"),
			},
		])("unregisters abort handler on $name", ({ remove, once }) => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();
			const controller = new AbortController();
			const addEventListener = vi.spyOn(controller.signal, "addEventListener");
			const removeEventListener = vi.spyOn(controller.signal, "removeEventListener");

			emitter.on("message", listener, { signal: controller.signal, once });

			// Act.
			remove(emitter, listener);

			// Assert.
			expect(addEventListener).toHaveBeenCalledTimes(1);
			expect(removeEventListener).toHaveBeenCalledTimes(1);
			expect(removeEventListener.mock.calls[0]?.[1]).toBe(addEventListener.mock.calls[0]?.[1]);
		});
	});

	describe("disposable listeners", () => {
		/**
		 * Asserts the {@link EventEmitter.disposableOn} adds the event listener.
		 */
		it("adds the listener", () => {
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
		 * Asserts {@link EventEmitter.disposableOn} only removes the listener it added.
		 */
		it("only removes self", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();

			// Act.
			const disposer = emitter.disposableOn("message", listener);
			emitter.disposableOn("message", listener);

			disposer.dispose();
			emitter.emit("message", "Hello world");

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith("Hello world");
		});

		/**
		 * Asserts listeners added via {@link EventEmitter.disposableOn} can be removed by disposing.
		 */
		it("can remove after emitting", () => {
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
		it("dispose", () => {
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
		it("[Symbol.dispose]", () => {
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
		 * Asserts {@link EventEmitter.off} removes all matching listeners.
		 */
		test("off removes all matching", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();

			emitter.on("message", listener);
			emitter.on("message", listener);
			emitter.on("message", listener);
			emitter.on("message", listener);

			// Act.
			expect(emitter.listenerCount("message")).toBe(4);
			emitter.off("message", listener);

			// Assert.
			expect(emitter.listenerCount("message")).toBe(0);
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

		/**
		 * Asserts {@link EventEmitter.removeListener} removes all matching listeners.
		 */
		test("removeListener removes all matching", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();

			emitter.on("message", listener);
			emitter.on("message", listener);
			emitter.on("message", listener);
			emitter.on("message", listener);

			// Act.
			expect(emitter.listenerCount("message")).toBe(4);
			emitter.removeListener("message", listener);

			// Assert.
			expect(emitter.listenerCount("message")).toBe(0);
		});
	});

	describe("default events", () => {
		/**
		 * Asserts the built-in `newListener` event is emitted.
		 */
		describe("newListener", () => {
			test("adding listeners", () => {
				// Arrange.
				const newListenerFn = vi.fn();
				const listeners = [vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn()] as const;

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
				const listeners = [vi.fn(), vi.fn(), vi.fn(), vi.fn()] as const;

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
				const listeners = [vi.fn(), vi.fn(), vi.fn(), vi.fn()] as const;

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

	describe("re-entrancy", () => {
		/**
		 * Asserts a listener removing itself during emission does not cause subsequent listeners to be skipped.
		 */
		test("removing self during emit", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const self = vi.fn(() => emitter.off("message", self));
			const next = vi.fn();
			emitter.on("message", self).on("message", next);

			// Act.
			emitter.emit("message", "Hello");

			// Assert.
			expect(self).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledTimes(1);
			expect(emitter.listeners("message")).toEqual([next]);
		});

		/**
		 * Asserts a listener disposing itself during emission does not cause subsequent listeners to be skipped.
		 */
		test("disposing self during emit", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const disposable = emitter.disposableOn("message", () => disposable[Symbol.dispose]());
			const next = vi.fn();
			emitter.on("message", next);

			// Act.
			emitter.emit("message", "Hello");

			// Assert.
			expect(next).toHaveBeenCalledTimes(1);
			expect(emitter.listenerCount("message")).toBe(1);
		});

		/**
		 * Asserts a listener removed by an earlier listener during emission is not invoked.
		 */
		test("removing a later listener during emit", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const later = vi.fn();
			emitter.on("message", () => emitter.off("message", later)).on("message", later);

			// Act.
			emitter.emit("message", "Hello");

			// Assert.
			expect(later).not.toHaveBeenCalled();
		});

		/**
		 * Asserts listeners added during emission are not invoked until the next emission.
		 */
		test("adding a listener during emit", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const late = vi.fn();
			emitter.once("message", () => emitter.on("message", late));

			// Act.
			emitter.emit("message", "First");
			emitter.emit("message", "Second");

			// Assert.
			expect(late).toHaveBeenCalledTimes(1);
			expect(late).toHaveBeenCalledWith("Second");
		});

		/**
		 * Asserts a nested emission does not cause the outer emission to skip listeners.
		 */
		test("nested emit", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const next = vi.fn();
			emitter.once("message", () => emitter.emit("message", "Inner"));
			emitter.on("message", next);

			// Act.
			emitter.emit("message", "Outer");

			// Assert.
			expect(next).toHaveBeenCalledTimes(2);
			expect(next).toHaveBeenNthCalledWith(1, "Inner");
			expect(next).toHaveBeenNthCalledWith(2, "Outer");
		});

		/**
		 * Asserts a once listener is not invoked again when a removeListener handler re-emits the event.
		 */
		test("once listener is not re-invoked by removeListener handler", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();
			emitter.once("message", listener);
			emitter.on("removeListener", () => emitter.emit("message", "Again"));

			// Act.
			emitter.emit("message", "Hello");

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts removeListener is emitted once, when a listener is removed again from within a removeListener handler.
		 */
		test("removeListener is emitted once per listener", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();
			const removeListener = vi.fn(() => emitter.off("message", listener));
			emitter.on("message", listener);
			emitter.on("removeListener", removeListener);

			// Act.
			emitter.off("message", listener);

			// Assert.
			expect(removeListener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts once listeners are not counted whilst being invoked.
		 */
		test("listenerCount within once listener", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			let count: number | undefined;
			let listeners: unknown[] | undefined;
			emitter.once("message", () => {
				count = emitter.listenerCount("message");
				listeners = emitter.listeners("message");
			});

			// Act.
			emitter.emit("message", "Hello");

			// Assert.
			expect(count).toBe(0);
			expect(listeners).toEqual([]);
		});

		/**
		 * Asserts removeAllListeners terminates, and retains listeners added by removeListener handlers.
		 */
		test("removeAllListeners with removeListener handler that adds listeners", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const added = vi.fn();
			emitter.on("message", vi.fn());
			emitter.on("removeListener", () => emitter.on("message", added));

			// Act.
			emitter.removeAllListeners("message");

			// Assert.
			expect(emitter.listeners("message")).toEqual([added]);
		});

		/**
		 * Asserts disposed listeners are cleaned up per event, when emitting another event before the cleanup occurs.
		 */
		test("once listener emitting another event is cleaned up", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			emitter.on("other", vi.fn());
			emitter.once("message", () => emitter.emit("other", 1));

			// Act.
			emitter.emit("message", "Hello");

			// Assert.
			expect(emitter.eventNames()).toEqual(["other"]);
			expect(emitter.emit("message", "Again")).toBe(false);
		});
	});

	describe("exceptions", () => {
		/**
		 * Asserts a throwing once listener is still removed, and its event deleted, when the error propagates from emit.
		 */
		test("throwing once listener is cleaned up", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const error = new Error("Listener failed");
			emitter.once("message", () => {
				throw error;
			});

			// Act, assert.
			expect(() => emitter.emit("message", "Hello")).toThrow(error);
			expect(emitter.eventNames()).toEqual([]);
			expect(emitter.emit("message", "Again")).toBe(false);
		});

		/**
		 * Asserts listeners before a throwing listener are invoked, and listeners after it are retained for later emits.
		 */
		test("throwing listener does not affect other listeners", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const before = vi.fn();
			const after = vi.fn();
			const throws = vi.fn(() => {
				throw new Error("Listener failed");
			});

			emitter.on("message", before).once("message", throws).on("message", after);

			// Act.
			expect(() => emitter.emit("message", "Hello")).toThrow();
			emitter.emit("message", "Again");

			// Assert.
			expect(before).toHaveBeenCalledTimes(2);
			expect(throws).toHaveBeenCalledTimes(1);
			expect(after).toHaveBeenCalledTimes(1);
			expect(after).toHaveBeenCalledWith("Again");
			expect(emitter.listeners("message")).toEqual([before, after]);
		});

		/**
		 * Asserts a throwing removeListener handler propagates from removeListener, and the disposed listener is removed.
		 */
		test("throwing removeListener handler during removeListener", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = vi.fn();
			const error = new Error("Handler failed");
			emitter.on("message", listener).on("message", listener);
			emitter.on("removeListener", () => {
				throw error;
			});

			// Act.
			expect(() => emitter.removeListener("message", listener)).toThrow(error);

			// Assert; the first match is removed, and the remaining match is retained as the error interrupted removal.
			expect(emitter.listenerCount("message")).toBe(1);
			expect(emitter.listeners("message")).toEqual([listener]);
		});

		/**
		 * Asserts a throwing removeListener handler propagates from removeAllListeners, and the disposed listener is removed.
		 */
		test("throwing removeListener handler during removeAllListeners", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const first = vi.fn();
			const second = vi.fn();
			emitter.on("message", first).on("message", second);
			emitter.on("removeListener", () => {
				throw new Error("Handler failed");
			});

			// Act.
			expect(() => emitter.removeAllListeners("message")).toThrow();

			// Assert.
			expect(emitter.listeners("message")).toEqual([second]);
		});

		/**
		 * Asserts a throwing removeListener handler propagates from disposing, and the listener is removed.
		 */
		test("throwing removeListener handler during dispose", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const disposable = emitter.disposableOn("message", vi.fn());
			emitter.on("removeListener", () => {
				throw new Error("Handler failed");
			});

			// Act.
			expect(() => disposable.dispose()).toThrow();

			// Assert.
			expect(emitter.eventNames()).toEqual(["removeListener"]);
			expect(emitter.listenerCount("message")).toBe(0);
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
				("another" | "array" | "empty" | "message" | "newListener" | "other" | "removeListener")[]
			>();

			// @ts-expect-error: arguments of type `string` are not valid
			type invalid = EventsOf<{
				invalid: string;
				valid: [name: string];
			}>;
		});

		/**
		 * Emitting events is restricted to the event map; default events are emitted internally.
		 */
		test("emit event name", () => {
			// Arrange.
			const emitter = new EventEmitter<EventMap>();
			const listener = (message: string): void => void message;

			// Act, assert.
			// @ts-expect-error: `newListener` is emitted internally.
			emitter.emit("newListener", "message", listener);

			// @ts-expect-error: `removeListener` is emitted internally.
			emitter.emit("removeListener", "message", listener);

			// @ts-expect-error: events not within the event map are not valid.
			emitter.emit("unknown");
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
			type CreateOrGet = ["user.create", (name: string) => void] | ["user.get", (id: number) => void];

			emitter.once("newListener", (...args) =>
				expectTypeOf(args).toEqualTypeOf<
					CreateOrGet | ["removeListener", (...args: RemoveListenerArgs<UserServiceEventMap>) => void]
				>(),
			);
			emitter.once("removeListener", (...args) =>
				expectTypeOf(args).toEqualTypeOf<
					CreateOrGet | ["newListener", (...args: NewListenerArgs<UserServiceEventMap>) => void]
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
