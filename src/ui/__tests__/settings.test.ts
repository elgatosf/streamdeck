import type { DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent } from "..";
import type { DidReceiveGlobalSettings, DidReceiveSettings, GetGlobalSettings, SetGlobalSettings, UIGetSettings, UISetSettings } from "../../api";
import { actionInfo } from "../../api/registration/__mocks__";
import { PromiseCompletionSource } from "../../common/promises";
import { connection } from "../connection";
import { getGlobalSettings, getSettings, onDidReceiveGlobalSettings, onDidReceiveSettings, setGlobalSettings, setSettings } from "../settings";

jest.mock("../connection");

describe("settings", () => {
	let uuid!: string;
	beforeAll(async () => ({ uuid } = await connection.getInfo()));

	/**
	 * Asserts {@link getGlobalSettings} sends the command, and awaits the settings.
	 */
	it("can getGlobalSettings", async () => {
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
	 * Asserts {@link getSettings} sends the command, and awaits the settings.
	 */
	it("can getSettings", async () => {
		// Arrange.
		const sendAwaiter = new PromiseCompletionSource<boolean>();
		const spyOnSend = jest.spyOn(connection, "send").mockImplementation(() => {
			sendAwaiter.setResult(true);
			return Promise.resolve();
		});

		// Act.
		const settings = getSettings<Settings>();

		// Assert.
		await sendAwaiter.promise;
		expect(spyOnSend).toHaveBeenCalledTimes(1);
		expect(spyOnSend).toHaveBeenLastCalledWith({
			event: "getSettings",
			action: actionInfo.action,
			context: uuid
		} satisfies UIGetSettings);

		expect(Promise.race([settings, false])).resolves.toBe(false);

		// Act (Event).
		connection.emit("didReceiveSettings", {
			event: "didReceiveSettings",
			action: actionInfo.action,
			context: "action123",
			device: "dev123",
			payload: {
				controller: "Encoder",
				coordinates: {
					column: 1,
					row: 0
				},
				isInMultiAction: false,
				settings: {
					message: "Testing getSettings"
				}
			}
		} satisfies DidReceiveSettings<Settings>);
		await settings;

		// Assert (Event).
		expect(settings).resolves.toEqual<Settings>({
			message: "Testing getSettings"
		});
	});

	/**
	 * Asserts {@link onDidReceiveGlobalSettings} is invoked when `didReceiveGlobalSettings` is emitted.
	 */
	it("receives onDidReceiveGlobalSettings", async () => {
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
	it("receives onDidReceiveSettings", async () => {
		// Arrange.
		const listener = jest.fn();
		const spyOnDisposableOn = jest.spyOn(connection, "disposableOn");

		const ev: DidReceiveSettings<Settings> = {
			event: "didReceiveSettings",
			action: "com.elgato.test.action",
			context: "action123",
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
	it("sends setGlobalSettings", async () => {
		// Arrange, act.
		await setGlobalSettings({
			message: "Testing setGlobalSettings"
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[SetGlobalSettings]>({
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
	it("sends setSettings", async () => {
		// Arrange, act.
		await setSettings({
			message: "Testing setSettings"
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[UISetSettings]>({
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
