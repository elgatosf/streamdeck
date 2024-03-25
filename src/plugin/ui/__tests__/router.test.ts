import { Action, MessageRequest, type MessageRequestOptions } from "../..";
import type { DidReceivePropertyInspectorMessage, SendToPropertyInspector } from "../../../api";
import type { RawMessageRequest } from "../../../common/messaging/message";
import { MessageResponder } from "../../../common/messaging/responder";
import { connection } from "../../connection";
import { PropertyInspector } from "../property-inspector";
import { getCurrentUI, router } from "../router";

jest.mock("../../connection");
jest.mock("../../logging");
jest.mock("../../manifest");

describe("current UI", () => {
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

		// Act.
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

	/**
	 * Asserts {@link getCurrentUI} uses the {@link router}.
	 */
	it("proxies fetch to router", async () => {
		// Arrange.
		const spyOnFetch = jest.spyOn(router, "fetch");
		connection.emit("propertyInspectorDidAppear", {
			action: "com.elgato.test.one",
			context: "abc123",
			device: "dev123",
			event: "propertyInspectorDidAppear"
		});

		// Act.
		await getCurrentUI()!.fetch({
			path: "/test",
			unidirectional: true,
			timeout: 1
		});

		// Assert.
		expect(spyOnFetch).toBeCalledTimes(1);
		expect(spyOnFetch).toHaveBeenCalledWith<[MessageRequestOptions]>({
			path: "/test",
			timeout: 1,
			unidirectional: true
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
			expect(listener).toHaveBeenCalledWith<[MessageRequest, MessageResponder]>(
				{
					action: new Action(ev),
					path: "/test",
					unidirectional: false,
					body: {
						name: "Elgato"
					}
				},
				expect.any(MessageResponder)
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
