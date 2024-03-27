/**
 * @jest-environment jsdom
 */

import type { MessageRequest, SendToPropertyInspectorEvent } from "..";
import type { DidReceivePluginMessage, SendToPlugin } from "../../api";
import { actionInfo } from "../../api/registration/__mocks__";
import type { RawMessageRequest } from "../../common/messaging/message";
import { MessageResponder } from "../../common/messaging/responder";
import { connection } from "../connection";
import { plugin, router, type PluginController } from "../plugin";
import { getSettings, setSettings } from "../settings";

jest.mock("../connection");

describe("plugin", () => {
	let uuid!: string;
	beforeAll(async () => ({ uuid } = await connection.getInfo()));

	describe("fetch", () => {
		beforeAll(() => jest.useFakeTimers());
		afterAll(() => jest.useRealTimers());

		const mockUUID = "ab038da2-77b0-441b-a4f5-c8d33f17a7a2";
		beforeEach(() => (global.crypto.randomUUID = () => mockUUID));

		/**
		 * Asserts {@link PluginController.fetch} forwards the path/body to {@link router.fetch}.
		 */
		test("path and body", async () => {
			// Arrange.
			const spyOnSend = jest.spyOn(connection, "send");

			// Act.
			const req = plugin.fetch("/outbound/path-and-body", { name: "Elgato" });
			jest.runAllTimers();
			await req;

			// Assert.
			expect(spyOnSend).toHaveBeenCalledTimes(1);
			expect(spyOnSend).toHaveBeenCalledWith<[SendToPlugin<RawMessageRequest>]>({
				action: actionInfo.action,
				context: uuid,
				event: "sendToPlugin",
				payload: {
					__type: "request",
					id: mockUUID,
					path: "/outbound/path-and-body",
					unidirectional: false,
					body: {
						name: "Elgato"
					}
				}
			});
		});

		/**
		 * Asserts {@link PluginController.fetch} forwards the request {@link router.fetch}.
		 */
		test("request", async () => {
			// Arrange.
			const spyOnSend = jest.spyOn(connection, "send");

			// Act.
			const req = plugin.fetch({
				path: "/outbound/request",
				body: { name: "Elgato" },
				timeout: 1000,
				unidirectional: true
			});
			jest.runAllTimers();
			await req;

			// Assert.
			expect(spyOnSend).toHaveBeenCalledTimes(1);
			expect(spyOnSend).toHaveBeenCalledWith<[SendToPlugin<RawMessageRequest>]>({
				action: actionInfo.action,
				context: uuid,
				event: "sendToPlugin",
				payload: {
					__type: "request",
					id: mockUUID,
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
	 * Asserts {@link PluginController.onMessage} is invoked when `sendToPropertyInspector` is emitted.
	 */
	it("receives onSendToPropertyInspector", async () => {
		// Arrange.
		const listener = jest.fn();
		const ev: DidReceivePluginMessage<PayloadOrSettings> = {
			action: "com.elgato.test.one",
			context: "action123",
			event: "sendToPropertyInspector",
			payload: {
				message: "Testing onMessage"
			}
		};

		// Act.
		const disposable = plugin.onSendToPropertyInspector(listener);
		connection.emit("sendToPropertyInspector", ev);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[SendToPropertyInspectorEvent<PayloadOrSettings, PayloadOrSettings>]>({
			action: {
				id: "action123",
				manifestId: "com.elgato.test.one",
				getSettings,
				setSettings
			},
			payload: {
				message: "Testing onMessage"
			},
			type: "sendToPropertyInspector"
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit("sendToPropertyInspector", ev);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link PluginController.registerRoute} registers the route with the router.
	 */
	it("registerRoute", () => {
		// Arrange.
		const spyOnRoute = jest.spyOn(router, "route");
		const handler = jest.fn();
		const options = {
			filter: () => true
		};

		// Act.
		plugin.registerRoute("/register", handler, options);

		// Assert.
		expect(spyOnRoute).toHaveBeenCalledTimes(1);
		expect(spyOnRoute).toHaveBeenCalledWith("/register", handler, options);
	});

	/**
	 * Asserts {@link router} routes the request with a construct action.
	 */
	it("receives request", () => {
		// Arrange.
		const listener = jest.fn();
		plugin.registerRoute("/receive", listener);

		// Act.
		connection.emit("sendToPropertyInspector", {
			action: actionInfo.action,
			context: uuid,
			event: "sendToPropertyInspector",
			payload: {
				__type: "request",
				id: "abc123",
				path: "/receive",
				unidirectional: false,
				body: {
					name: "Elgato"
				}
			}
		} satisfies DidReceivePluginMessage<RawMessageRequest>);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[MessageRequest, MessageResponder]>(
			{
				action: {
					id: uuid,
					manifestId: actionInfo.action,
					getSettings,
					setSettings
				},
				path: "/receive",
				unidirectional: false,
				body: {
					name: "Elgato"
				}
			},
			expect.any(MessageResponder)
		);
	});

	/**
	 * Asserts {@link PluginController.sendToPlugin} sends the command to the {@link connection}.
	 */
	it("sends sendToPlugin", async () => {
		// Arrange, act.
		await plugin.sendToPlugin({
			message: "Testing sendToPlugin"
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[SendToPlugin]>({
			action: actionInfo.action,
			context: uuid,
			event: "sendToPlugin",
			payload: {
				message: "Testing sendToPlugin"
			}
		});
	});
});

/**
 * Mock payload or settings.
 */
type PayloadOrSettings = {
	message: string;
};
