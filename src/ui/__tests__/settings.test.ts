import type { DidReceiveGlobalSettingsEvent } from "..";
import type { ActionIdentifier, SetGlobalSettings, SetSettings } from "../../api";
import { actionInfo, registrationInfo } from "../../api/registration/__mocks__";
import { connection, type ConnectionInfo } from "../connection";
import { onDidReceiveGlobalSettings, setGlobalSettings, setSettings } from "../settings";

jest.mock("../connection");

describe("settings", () => {
	const uuid = "abc123xyz";

	beforeEach(() => {
		jest.spyOn(connection, "getInfo").mockReturnValue(
			Promise.resolve<ConnectionInfo>({
				actionInfo,
				info: registrationInfo,
				uuid
			})
		);
	});

	afterEach(() => jest.resetAllMocks());

	/**
	 * Asserts {@link onDidReceiveGlobalSettings} is invoked when `didReceiveGlobalSettings` is emitted.
	 */
	test("onDidReceiveGlobalSettings", async () => {
		// Arrange.
		const listener = jest.fn();
		const spyOnDisposableOn = jest.spyOn(connection, "disposableOn");
		const disposable = onDidReceiveGlobalSettings(listener);

		// Act.
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
