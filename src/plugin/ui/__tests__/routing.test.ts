import { Action, JsonValue, MessageRequest, MessageRequestOptions } from "../..";
import type { DidReceivePropertyInspectorMessage, SendToPropertyInspector } from "../../../api";
import type { RawMessageRequest } from "../../../common/messaging/message";
import { MessageResponseBuilder } from "../../../common/messaging/responder";
import { connection } from "../../connection";
import { PropertyInspector, getCurrentUI, router } from "../routing";

jest.mock("../../connection");
jest.mock("../../logging");
jest.mock("../../manifest");

describe("getCurrentUI", () => {
	/**
	 * Asserts {@link getCurrentUI} is set when the connection emits `propertyInspectorDidAppear`.
	 */
	it("sets on propertyInspectorDidAppear", () => {
		// Arrange.
		connection.emit("propertyInspectorDidAppear", {
			action: "com.elgato.test.one",
			context: "abc123",
			device: "dev123",
			event: "propertyInspectorDidAppear"
		});

		const current = getCurrentUI();

		// Assert.
		expect(current).toBeInstanceOf(PropertyInspector);
		expect(current).not.toBeUndefined();
		expect(current?.deviceId).toBe("dev123");
		expect(current?.id).toBe("abc123");
		expect(current?.manifestId).toBe("com.elgato.test.one");
	});

	/**
	 * Asserts {@link getCurrentUI} is unset when the connection emits `propertyInspectorDidDisappear`.
	 */
	it("unset on propertyInspectorDidDisappear", () => {
		// Arrange.
		connection.emit("propertyInspectorDidAppear", {
			action: "com.elgato.test.one",
			context: "abc123",
			device: "dev123",
			event: "propertyInspectorDidAppear"
		});

		expect(getCurrentUI()).not.toBeUndefined();
		connection.emit("propertyInspectorDidDisappear", {
			action: "com.elgato.test.one",
			context: "abc123",
			device: "dev123",
			event: "propertyInspectorDidDisappear"
		});

		// Act.
		const current = getCurrentUI();

		// Assert.
		expect(current).toBeUndefined();
	});
});

describe("PropertyInspector", () => {
	/**
	 * Asserts {@link PropertyInspector} initializes it's context on construction.
	 */
	it("initializes context", () => {
		// Arrange, act.
		const pi = new PropertyInspector({
			action: "com.elgato.test.one",
			context: "abc123",
			device: "dev123"
		});

		// Assert.
		expect(pi.deviceId).toBe("dev123");
		expect(pi.id).toBe("abc123");
		expect(pi.manifestId).toBe("com.elgato.test.one");
	});

	describe("fetch", () => {
		/**
		 * Asserts {@link PropertyInspector.fetch} forwards the path/body to {@link router.fetch}.
		 */
		test("path and body", async () => {
			// Arrange.
			const spyOnFetch = jest.spyOn(router, "fetch");
			const pi = new PropertyInspector({
				action: "com.elgato.test.one",
				context: "abc123",
				device: "dev123"
			});

			// Act.
			await pi.fetch("/hello", { name: "Elgato" });

			// Assert.
			expect(spyOnFetch).toBeCalledTimes(1);
			expect(spyOnFetch).toHaveBeenLastCalledWith<[string, JsonValue]>("/hello", { name: "Elgato" });
		});

		/**
		 * Asserts {@link PropertyInspector.fetch} forwards the request {@link router.fetch}.
		 */
		test("request", async () => {
			// Arrange.
			const spyOnFetch = jest.spyOn(router, "fetch");
			const pi = new PropertyInspector({
				action: "com.elgato.test.one",
				context: "abc123",
				device: "dev123"
			});

			// Act.
			await pi.fetch({
				path: "/hello",
				body: { name: "Elgato" },
				timeout: 1000,
				unidirectional: true
			});

			// Assert.
			expect(spyOnFetch).toBeCalledTimes(1);
			expect(spyOnFetch).toHaveBeenLastCalledWith<[MessageRequestOptions]>({
				path: "/hello",
				body: { name: "Elgato" },
				timeout: 1000,
				unidirectional: true
			});
		});
	});

	/**
	 * Asserts {@link PropertyInspector.sendMessage} sends the event to the {@link connection}.
	 */
	it("sends messages", async () => {
		// Arrange.
		const spyOnSend = jest.spyOn(connection, "send");
		const pi = new PropertyInspector({
			action: "com.elgato.test.one",
			context: "abc123",
			device: "dev123"
		});

		// Act.
		await pi.sendMessage({ message: "Hello world" });

		// Assert.
		expect(spyOnSend).toBeCalledTimes(1);
		expect(spyOnSend).toHaveBeenLastCalledWith<[SendToPropertyInspector]>({
			context: "abc123",
			event: "sendToPropertyInspector",
			payload: {
				message: "Hello world"
			}
		});
	});
});

describe("router", () => {
	describe("inbound messages", () => {
		/**
		 * Asserts {@link router} processed messages when the {@link connection} emits `sendToPlugin`.
		 */
		it("processes", () => {
			// Arrange.
			const spyOnProcess = jest.spyOn(router, "process");
			const ev = {
				action: "com.elgato.test.one",
				context: "abc123",
				event: "sendToPlugin",
				payload: {
					__type: "request",
					id: "123-456-7890",
					path: "/test",
					unidirectional: false,
					body: {
						name: "Elgato"
					}
				}
			} satisfies DidReceivePropertyInspectorMessage<RawMessageRequest>;

			const listener = jest.fn();
			router.route("/test", listener);

			// Act.
			connection.emit("sendToPlugin", ev);

			// Assert.
			expect(spyOnProcess).toBeCalledTimes(1);
			expect(spyOnProcess).toHaveBeenCalledWith(ev);
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[MessageRequest<Action>, MessageResponseBuilder]>(
				{
					action: new Action(ev),
					path: "/test",
					unidirectional: false,
					body: {
						name: "Elgato"
					}
				},
				expect.any(MessageResponseBuilder)
			);
		});
	});

	describe("outbound messages", () => {
		describe("with ui", () => {
			beforeAll(() => jest.useFakeTimers());
			afterAll(() => jest.useRealTimers());

			/**
			 * Asserts {@link PropertyInspector.fetch} forwards the path/body to {@link router.fetch}.
			 */
			test("path and body", async () => {
				// Arrange.
				const spyOnSend = jest.spyOn(connection, "send");
				connection.emit("propertyInspectorDidAppear", {
					action: "com.elgato.test.one",
					context: "proxy-outbound-message-with-path-and-body",
					device: "dev123",
					event: "propertyInspectorDidAppear"
				});

				// Act.
				const req = router.fetch("/outbound/path-and-body", { name: "Elgato" });
				jest.runAllTimers();
				await req;

				// Assert.
				expect(spyOnSend).toHaveBeenCalledTimes(1);
				expect(spyOnSend).toHaveBeenCalledWith<[SendToPropertyInspector<RawMessageRequest>]>({
					context: "proxy-outbound-message-with-path-and-body",
					event: "sendToPropertyInspector",
					payload: {
						__type: "request",
						id: expect.any(String),
						path: "/outbound/path-and-body",
						unidirectional: false,
						body: {
							name: "Elgato"
						}
					}
				});
			});

			/**
			 * Asserts {@link PropertyInspector.fetch} forwards the request {@link router.fetch}.
			 */
			test("request", async () => {
				// Arrange.
				const spyOnSend = jest.spyOn(connection, "send");
				connection.emit("propertyInspectorDidAppear", {
					action: "com.elgato.test.one",
					context: "proxy-outbound-message-with-path-and-body",
					device: "dev123",
					event: "propertyInspectorDidAppear"
				});

				// Act.
				const req = router.fetch({
					path: "/outbound/request",
					body: { name: "Elgato" },
					timeout: 1000,
					unidirectional: true
				});
				jest.runAllTimers();
				await req;

				// Assert.
				expect(spyOnSend).toHaveBeenCalledTimes(1);
				expect(spyOnSend).toHaveBeenCalledWith<[SendToPropertyInspector<RawMessageRequest>]>({
					context: "proxy-outbound-message-with-path-and-body",
					event: "sendToPropertyInspector",
					payload: {
						__type: "request",
						id: expect.any(String),
						path: "/outbound/request",
						unidirectional: true,
						body: {
							name: "Elgato"
						}
					}
				});
			});
		});

		/**
		 * Asserts {@link router} outbound requests, i.e. `fetch`, aren't sent to the connection when there isn't a property inspector.
		 */
		test("without ui", async () => {
			// Arrange.
			connection.emit("propertyInspectorDidDisappear", {
				action: "com.elgato.test.one",
				context: "proxy-outbound-message-without-ui",
				device: "dev123",
				event: "propertyInspectorDidDisappear"
			});

			const spyOnSend = jest.spyOn(connection, "send");

			// Act.
			const res = await router.fetch({
				path: "/test",
				body: {
					name: "Elgato"
				},
				unidirectional: true,
				timeout: 1
			});

			// Assert.
			expect(spyOnSend).toHaveBeenCalledTimes(0);
			expect(res.ok).toBe(false);
			expect(res.status).toBe(406);
		});
	});
});
