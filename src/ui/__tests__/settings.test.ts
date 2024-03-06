import type { DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent } from "..";
import type { ActionIdentifier, DidReceiveGlobalSettings, DidReceiveSettings, GetGlobalSettings, SetGlobalSettings, SetSettings } from "../../api";
import { actionInfo, registrationInfo } from "../../api/registration/__mocks__";
import { PromiseCompletionSource } from "../../common/promises";
import { connection, type ConnectionInfo } from "../connection";
import { getGlobalSettings, getSettings, onDidReceiveGlobalSettings, onDidReceiveSettings, setGlobalSettings, setSettings } from "../settings";

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
	 * Asserts {@link getGlobalSettings} sends the command, and awaits the settings.
	 */
	it("Can getGlobalSettings", async () => {
		// Arrange.
		const sendAwaiter = new PromiseCompletionSource<boolean>();
		const spyOnSend = jest.spyOn(connection, "send").mockImplementation(() => {
			sendAwaiter.setResult(true);
			return Promise.resolve();
		});

		// Act.
		const settings = getGlobalSettings<Settings>();

		// Assert.
		await sendAwaiter.promise;
		expect(spyOnSend).toHaveBeenCalledTimes(1);
		expect(spyOnSend).toHaveBeenLastCalledWith({
			event: "getGlobalSettings",
			context: uuid
		} satisfies GetGlobalSettings);

		expect(Promise.race([settings, false])).resolves.toBe(false);

		// Act (Event).
		connection.emit("didReceiveGlobalSettings", {
			event: "didReceiveGlobalSettings",
			payload: {
				settings: {
					message: "Testing getGlobalSettings"
				}
			}
		} satisfies DidReceiveGlobalSettings<Settings>);
		await settings;

		// Assert (Event).
		expect(settings).resolves.toEqual<Settings>({
			message: "Testing getGlobalSettings"
		});
	});

	/**
	 * Asserts {@link onDidReceiveGlobalSettings} is invoked when `didReceiveGlobalSettings` is emitted.
	 */
	it("Receives onDidReceiveGlobalSettings", async () => {
		// Arrange.
		const listener = jest.fn();
		const spyOnDisposableOn = jest.spyOn(connection, "disposableOn");

		const ev: DidReceiveGlobalSettings<Settings> = {
			event: "didReceiveGlobalSettings",
			payload: {
				settings: {
					message: "Testing didReceiveGlobalSettings"
				}
			}
		};

		// Act.
		const disposable = onDidReceiveGlobalSettings(listener);
		connection.emit("didReceiveGlobalSettings", ev);

		// Assert.
		expect(spyOnDisposableOn).toHaveBeenCalledTimes(1);
		expect(spyOnDisposableOn).toHaveBeenCalledWith("didReceiveGlobalSettings", expect.any(Function));
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceiveGlobalSettingsEvent<Settings>]>({
			settings: {
				message: "Testing didReceiveGlobalSettings"
			},
			type: "didReceiveGlobalSettings"
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit("didReceiveGlobalSettings", ev);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link onDidReceiveSettings} is invoked when `onDidReceiveSettings` is emitted.
	 */
	it("Receives onDidReceiveSettings", async () => {
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
					message: "Testing onDidReceiveSettings"
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
	it("Sends setGlobalSettings", async () => {
		// Arrange, act.
		const spyOnSend = jest.spyOn(connection, "send");
		await setGlobalSettings({
			message: "Testing setGlobalSettings"
		});

		// Assert.
		expect(spyOnSend).toHaveBeenCalledTimes(1);
		expect(spyOnSend).toHaveBeenCalledWith<[SetGlobalSettings]>({
			context: uuid,
			event: "setGlobalSettings",
			payload: {
				message: "Testing setGlobalSettings"
			}
		});
	});

	/**
	 * Asserts {@link setSettings} sends the command to the {@link connection}.
	 */
	it("Sends setSettings", async () => {
		// Arrange, act.
		const spyOnSend = jest.spyOn(connection, "send");
		await setSettings({
			message: "Testing setSettings"
		});

		// Assert.
		expect(spyOnSend).toHaveBeenCalledTimes(1);
		expect(spyOnSend).toHaveBeenCalledWith<[ActionIdentifier & SetSettings]>({
			action: actionInfo.action,
			context: uuid,
			event: "setSettings",
			payload: {
				message: "Testing setSettings"
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
