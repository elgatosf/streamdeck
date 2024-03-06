import type { DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent } from "..";
import type { ActionIdentifier, DidReceiveSettings, SetGlobalSettings, SetSettings } from "../../api";
import { actionInfo, registrationInfo } from "../../api/registration/__mocks__";
import { connection, type ConnectionInfo } from "../connection";
import { getSettings, onDidReceiveGlobalSettings, onDidReceiveSettings, setGlobalSettings, setSettings } from "../settings";

jest.mock("../connection");

describe("settings", () => {
	const uuid = "abc123xyz";

	beforeEach(async () => {
		jest.spyOn(connection, "getInfo").mockReturnValue(
			Promise.resolve<ConnectionInfo>({
				actionInfo,
				info: registrationInfo,
				uuid
			})
		);
	});

	afterEach(() => jest.clearAllMocks());

	/**
	 * Asserts {@link onDidReceiveGlobalSettings} is invoked when `didReceiveGlobalSettings` is emitted.
	 */
	test("onDidReceiveGlobalSettings", async () => {
		// Arrange.
		const listener = jest.fn();
		const spyOnDisposableOn = jest.spyOn(connection, "disposableOn");

		// Act.
		const disposable = onDidReceiveGlobalSettings(listener);
		connection.emit("didReceiveGlobalSettings", {
			event: "didReceiveGlobalSettings",
			payload: {
				settings: {
					message: "Hello world"
				}
			}
		});

		// Assert.
		expect(spyOnDisposableOn).toHaveBeenCalledTimes(1);
		expect(spyOnDisposableOn).toHaveBeenCalledWith("didReceiveGlobalSettings", expect.any(Function));
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceiveGlobalSettingsEvent<Settings>]>({
			settings: {
				message: "Hello world"
			},
			type: "didReceiveGlobalSettings"
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit("didReceiveGlobalSettings", {
			event: "didReceiveGlobalSettings",
			payload: {
				settings: {
					message: "Hello world"
				}
			}
		});

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link onDidReceiveSettings} is invoked when `onDidReceiveSettings` is emitted.
	 */
	test("onDidReceiveSettings", async () => {
		// Arrange.
		const listener = jest.fn();
		const spyOnDisposableOn = jest.spyOn(connection, "disposableOn");

		const ev: DidReceiveSettings<Settings> = {
			event: "didReceiveSettings",
			action: "com.elgato.test.action",
			context: "abc123",
			device: "dev123",
			payload: {
				controller: "Keypad",
				coordinates: {
					column: 2,
					row: 2
				},
				isInMultiAction: false,
				settings: {
					message: "Hello world"
				}
			}
		};

		// Act.
		const disposable = onDidReceiveSettings(listener);
		connection.emit("didReceiveSettings", ev);

		// Assert.
		expect(spyOnDisposableOn).toHaveBeenCalledTimes(1);
		expect(spyOnDisposableOn).toHaveBeenCalledWith("didReceiveSettings", expect.any(Function));
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceiveSettingsEvent<Settings>]>({
			action: {
				id: ev.context,
				manifestId: ev.action,
				getSettings,
				setSettings
			},
			deviceId: ev.device,
			payload: ev.payload,
			type: "didReceiveSettings"
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit("didReceiveSettings", ev);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link setGlobalSettings} sends the command to the {@link connection}.
	 */
	test("setGlobalSettings", async () => {
		// Arrange, act.
		const spyOnSend = jest.spyOn(connection, "send");
		await setGlobalSettings({
			message: "Hello world"
		});

		// Assert.
		expect(spyOnSend).toHaveBeenCalledTimes(1);
		expect(spyOnSend).toHaveBeenCalledWith<[SetGlobalSettings]>({
			context: uuid,
			event: "setGlobalSettings",
			payload: {
				message: "Hello world"
			}
		});
	});

	/**
	 * Asserts {@link setSettings} sends the command to the {@link connection}.
	 */
	test("setSettings", async () => {
		// Arrange, act.
		const spyOnSend = jest.spyOn(connection, "send");
		await setSettings({
			message: "Hello world"
		});

		// Assert.
		expect(spyOnSend).toHaveBeenCalledTimes(1);
		expect(spyOnSend).toHaveBeenCalledWith<[ActionIdentifier & SetSettings]>({
			action: actionInfo.action,
			context: uuid,
			event: "setSettings",
			payload: {
				message: "Hello world"
			}
		});
	});
});

/**
 * Mock settings.
 */
type Settings = {
	message: string;
};
