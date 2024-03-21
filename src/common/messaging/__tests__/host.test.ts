import type { DidReceivePropertyInspectorMessage } from "../../../api";
import { type Action } from "../../../plugin/actions/action";
import type { JsonValue } from "../../json";
import { MessengerHost, type MessageRequest } from "../host";
import type { RawMessageRequest } from "../message";
import { MessageResponseBuilder } from "../responder";

describe("MessengerHost", () => {
	it("must provide sender action", async () => {
		// Arrange.
		type MockAction = Pick<Action, "id" | "manifestId">;
		const proxy = jest.fn();
		const provider = jest.fn().mockReturnValue({
			id: "abc123",
			manifestId: "com.elgato.test.one"
		});
		const handler = jest.fn();
		const messenger = new MessengerHost<MockAction>(proxy, provider);
		messenger.route("/test", handler);

		// Act.
		const handled = await messenger.process({
			action: "com.elgato.test.one",
			context: "abc123",
			event: "sendToPlugin",
			payload: {
				__type: "request",
				id: "req1",
				path: "/test",
				unidirectional: false,
				body: {
					name: "Elgato"
				}
			}
		} satisfies DidReceivePropertyInspectorMessage<RawMessageRequest>);

		expect(handled).toBe(true);
		expect(handler).toHaveBeenCalledTimes(1);
		expect(handler).toHaveBeenCalledWith<[MessageRequest<MockAction>, MessageResponseBuilder]>(
			{
				action: {
					id: "abc123",
					manifestId: "com.elgato.test.one"
				},
				path: "/test",
				unidirectional: false,
				body: {
					name: "Elgato"
				}
			},
			expect.any(MessageResponseBuilder)
		);
	});

	/**
	 * Asserts {@link MessengerHost.process} correctly handles unexpected data structures.
	 */
	it("must not process unknown payloads", async () => {
		// Arrange.
		const proxy = jest.fn();
		const provider = jest.fn();
		const messenger = new MessengerHost<object>(proxy, provider);

		// Act.
		// @ts-expect-error type checking should also occur within `process`.
		const actual = await messenger.process(true);

		// Assert.
		expect(actual).toBe(false);
		expect(proxy).toHaveBeenCalledTimes(0);
		expect(provider).toHaveBeenCalledTimes(0);
	});

	describe("handlers", () => {
		it("must execute in order", async () => {
			const proxy = jest.fn();
			const messenger = new MessengerHost<object>(proxy, jest.fn());
			const order: string[] = [];
			const handlers = [
				() => {
					order.push("First");
				},
				() => {
					order.push("Second");
				}
			];

			// Act.
			messenger.route("/test", handlers[0]);
			messenger.route("/test", handlers[1]);
			await messenger.process({
				action: "com.elgato.test.one",
				context: "abc123",
				event: "sendToPlugin",
				payload: {
					__type: "request",
					id: "12345",
					path: "/test",
					unidirectional: false,
					body: {
						name: "Elgato"
					}
				} satisfies RawMessageRequest
			});

			// Assert
			expect(order).toEqual(["First", "Second"]);
		});
	});

	describe("fetch e2e", () => {
		let host!: MessengerHost<object>;
		let server!: MessengerHost<object>;
		let cascade!: (message: string) => void;

		beforeEach(() => {
			cascade = jest.fn();

			host = new MessengerHost(async (value) => {
				try {
					await server.process({
						action: "com.elgato.test.one",
						context: "abc123",
						event: "sendToPlugin",
						payload: value as JsonValue
					});
				} catch (err) {
					// SafeError is acceptable as it is used for "/error"
					if (!(err instanceof SafeError)) {
						throw err;
					}
				}
			}, jest.fn());

			server = new MessengerHost<object>(async (value) => {
				await host.process({
					action: "com.elgato.test.one",
					context: "abc123",
					event: "sendToPropertyInspector",
					payload: value as JsonValue
				});
			}, jest.fn())
				.route("/test", (req, res) => {
					res.success({
						name: "Elgato"
					});
				})
				.route("/error", () => {
					throw new SafeError();
				})
				.route("/cascade", () => {
					cascade("First");
					return true;
				})
				.route("/cascade", () => {
					cascade("Second");
					return false;
				});
		});

		afterEach(() => jest.resetAllMocks());

		/**
		 * Test known routes.
		 */
		describe("known routes", () => {
			/**
			 * Asserts a response of `200` for a successful request.
			 */
			it("200 on success", async () => {
				// Arrange, act.
				const { body, ok, status } = await host.fetch<MockData>("/test");

				// Assert.
				expect(status).toBe(200);
				expect(ok).toBeTruthy();
				expect(body).toEqual({ name: "Elgato" });
			});

			/**
			 * Asserts a response of `202` for a unidirectional request.
			 */
			it("202 on unidirectional request", async () => {
				// Arrange, act.
				const { body, ok, status } = await host.fetch({
					path: "/test",
					unidirectional: true
				});

				// Assert.
				expect(status).toBe(202);
				expect(ok).toBeTruthy();
				expect(body).toBeUndefined();
			});

			/**
			 * Asserts a response of `500` for an error thrown by the handler.
			 */
			it("500 on error", async () => {
				// Arrange, act.
				const { body, ok, status } = await host.fetch("/error");

				// Assert.
				expect(status).toBe(500);
				expect(ok).toBeFalsy();
				expect(body).toBeUndefined();
			});

			/**
			 * Asserts a response of `202` for an error thrown by the handler on a unidirectional request.
			 */
			it("202 on error (unidirectional request)", async () => {
				// Arrange, act.
				const { body, ok, status } = await host.fetch({
					path: "/error",
					unidirectional: true
				});

				// Assert.
				expect(status).toBe(202);
				expect(ok).toBeTruthy();
				expect(body).toBeUndefined();
			});

			/**
			 * Asserts a response of `408` for a timeout.
			 */
			it("408 on timeout", async () => {
				// Arrange.
				// @ts-expect-error setTimeout should return Nodejs.Timeout, but we aren't using it, so its fine.
				const spyOnSetTimeout = jest.spyOn(global, "setTimeout").mockImplementation((fn) => fn());
				const spyOnClearTimeout = jest.spyOn(global, "clearTimeout");

				// Act.
				const res = host.fetch({
					path: "/test",
					timeout: 1
				});

				const { body, ok, status } = await res;

				// Assert.
				expect(status).toBe(408);
				expect(ok).toBeFalsy();
				expect(body).toBeUndefined();
				expect(spyOnSetTimeout).toHaveBeenCalledWith(expect.any(Function), 1);
				expect(spyOnClearTimeout).toHaveBeenCalledTimes(0);
			});
		});

		/**
		 * Test unknown routes.
		 */
		describe("unknown routes", () => {
			/**
			 * Asserts a response of `501` for unknown paths.
			 */
			it("501 on unknown routes", async () => {
				// Arrange, act.
				const { body, ok, status } = await host.fetch("/unknown");

				// Assert.
				expect(status).toBe(501);
				expect(ok).toBeFalsy();
				expect(body).toBeUndefined();
			});

			/**
			 * Asserts a response of `501` for unknown paths (unidirectional request).
			 */
			it("501 on unknown routes (unidirectional request)", async () => {
				// Arrange, act.
				const { body, ok, status } = await host.fetch({
					path: "/unknown",
					unidirectional: true
				});

				// Assert.
				expect(status).toBe(501);
				expect(ok).toBeFalsy();
				expect(body).toBeUndefined();
			});
		});

		/**
		 * Asserts {@link MessengerHost.fetch} executes all paths, but does not respond more than once.
		 */
		it("should execute all, but return after the first", async () => {
			// Arrange, act.
			const { body, ok, status } = await host.fetch("/cascade");

			// Assert.
			expect(status).toBe(200);
			expect(ok).toBe(true);
			expect(body).toBe(true);
			expect(cascade).toHaveBeenCalledTimes(2);
			expect(cascade).toHaveBeenNthCalledWith(1, "First");
			expect(cascade).toHaveBeenNthCalledWith(2, "Second");
		});
	});
});

type MockData = {
	name: string;
};

class SafeError extends Error {}
