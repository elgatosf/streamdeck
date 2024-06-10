import { Action, MessageRequest, type MessageRequestOptions } from "../..";
import type { DidReceivePropertyInspectorMessage, SendToPropertyInspector } from "../../../api";
import type { RawMessageRequest } from "../../../common/messaging/message";
import { MessageResponder } from "../../../common/messaging/responder";
import { PromiseCompletionSource } from "../../../common/promises";
import { connection } from "../../connection";
import { PropertyInspector } from "../property-inspector";
import { getCurrentUI, router } from "../router";

jest.mock("../../connection");
jest.mock("../../logging");
jest.mock("../../manifest");

describe("current UI", () => {
	beforeEach(() => {
		// Resets the debounce counter.
		const context = {
			action: "__reset__",
			context: "__reset__",
			device: "__reset__"
		};

		connection.emit("propertyInspectorDidAppear", { event: "propertyInspectorDidAppear", ...context });
		connection.emit("propertyInspectorDidDisappear", { event: "propertyInspectorDidDisappear", ...context });
	});

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
	 * Asserts {@link getCurrentUI} is overwritten when the connection emits `propertyInspectorDidAppear`.
	 */
	it("overwrites on propertyInspectorDidAppear", () => {
		// Arrange.
		connection.emit("propertyInspectorDidAppear", {
			action: "com.elgato.test.one",
			context: "__first__",
			device: "dev123",
			event: "propertyInspectorDidAppear"
		});

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
	 * Asserts {@link getCurrentUI} is unset when the connection emits `propertyInspectorDidDisappear` for the current UI.
	 */
	it("clears matching PI", () => {
		// Arrange.
		const context = {
			action: "com.elgato.test.one",
			context: "abc123",
			device: "dev123"
		};

		connection.emit("propertyInspectorDidAppear", {
			...context,
			event: "propertyInspectorDidAppear"
		});

		expect(getCurrentUI()).not.toBeUndefined();
		connection.emit("propertyInspectorDidDisappear", {
			...context,
			event: "propertyInspectorDidDisappear"
		});

		// Act.
		const current = getCurrentUI();

		// Assert.
		expect(current).toBeUndefined();
	});

	/**
	 * Asserts {@link getCurrentUI} is not cleared when the connection emits `propertyInspectorDidDisappear` when the debounce count is greater than zero.
	 */
	it("does not clear matching PI with debounce", () => {
		// Arrange.
		const context = {
			action: "com.elgato.test.one",
			context: "abc123",
			device: "dev123"
		};

		connection.emit("propertyInspectorDidAppear", {
			...context,
			event: "propertyInspectorDidAppear"
		});

		// Show twice (mock event race)
		connection.emit("propertyInspectorDidAppear", {
			...context,
			event: "propertyInspectorDidAppear"
		});

		expect(getCurrentUI()).not.toBeUndefined();
		connection.emit("propertyInspectorDidDisappear", {
			...context,
			event: "propertyInspectorDidDisappear"
		});

		// Act, assert.
		const current = getCurrentUI();
		expect(current).not.toBeUndefined();

		// Act, assert.
		connection.emit("propertyInspectorDidDisappear", {
			...context,
			event: "propertyInspectorDidDisappear"
		});
		expect(getCurrentUI()).toBeUndefined();
	});

	/**
	 * Asserts {@link getCurrentUI} is not cleared when the connection emits `propertyInspectorDidDisappear` for a UI that is not the current.
	 */
	it("does not clear non-matching PI", () => {
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
			context: "__other__",
			device: "dev123",
			event: "propertyInspectorDidDisappear"
		});

		// Act.
		const current = getCurrentUI();

		// Assert.
		expect(current).not.toBeUndefined();
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
			path: "public:/test",
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
		it("processes", async () => {
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

			const awaiter = new PromiseCompletionSource();
			const listener = jest.fn().mockImplementation(() => awaiter.setResult(true));
			const disposable = router.route("/test", listener);

			// Act.
			connection.emit("sendToPlugin", ev);
			await awaiter.promise;

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

			// Act, assert (dispose).
			disposable.dispose();
			connection.emit("sendToPlugin", ev);
			expect(listener).toHaveBeenCalledTimes(1);
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
			const ev = {
				action: "com.elgato.test.one",
				context: "proxy-outbound-message-without-ui",
				device: "dev123"
			};

			connection.emit("propertyInspectorDidAppear", {
				...ev,
				event: "propertyInspectorDidAppear"
			});

			connection.emit("propertyInspectorDidDisappear", {
				...ev,
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
