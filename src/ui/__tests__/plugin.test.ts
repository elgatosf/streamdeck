/**
 * @jest-environment jsdom
 */

import type { DidReceivePluginMessageEvent } from "..";
import type { DidReceivePluginMessage, SendToPlugin } from "../../api";
import { actionInfo } from "../../api/registration/__mocks__";
import { connection } from "../connection";
import { onDidReceivePluginMessage, sendToPlugin } from "../plugin";
import { getSettings, setSettings } from "../settings";

jest.mock("../connection");

describe("plugin", () => {
	let uuid!: string;
	beforeAll(async () => ({ uuid } = await connection.getInfo()));

	/**
	 * Asserts {@link onDidReceivePluginMessage} is invoked when `sendToPropertyInspector` is emitted.
	 */
	it("receives onDidReceivePluginMessage", async () => {
		// Arrange.
		const listener = jest.fn();
		const ev: DidReceivePluginMessage<PayloadOrSettings> = {
			action: "com.elgato.test.one",
			context: "action123",
			event: "sendToPropertyInspector",
			payload: {
				message: "Testing onDidReceivePluginMessage"
			}
		};

		// Act.
		const disposable = onDidReceivePluginMessage(listener);
		connection.emit("sendToPropertyInspector", ev);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceivePluginMessageEvent<PayloadOrSettings, PayloadOrSettings>]>({
			action: {
				id: "action123",
				manifestId: "com.elgato.test.one",
				getSettings,
				setSettings
			},
			payload: {
				message: "Testing onDidReceivePluginMessage"
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
	 * Asserts {@link sendToPlugin} sends the command to the {@link connection}.
	 */
	it("sends sendToPlugin", async () => {
		// Arrange, act.
		await sendToPlugin({
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
