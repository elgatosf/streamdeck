import { DeviceType, type GetSettings, type SendToPropertyInspector, type SetSettings } from "../../../api";
import { Settings } from "../../../api/__mocks__/events";
import { connection } from "../../connection";
import { Device } from "../../devices/device";
import { Action, type ActionContext } from "../action";
import { MultiActionKey } from "../multi";

jest.mock("../../logging");
jest.mock("../../manifest");
jest.mock("../../connection");

describe("Action", () => {
	// Mock device.
	const device = new Device(
		"dev123",
		{
			name: "Device One",
			size: {
				columns: 5,
				rows: 3
			},
			type: DeviceType.StreamDeck
		},
		false
	);

	/**
	 * Asserts the constructor of {@link Action} sets the context.
	 */
	it("constructor sets context", () => {
		// Arrange.
		const context: ActionContext = {
			device,
			id: "ABC123",
			manifestId: "com.elgato.test.one"
		};

		// Act.
		const action = new MultiActionKey(context);

		// Assert.
		expect(action).toBeInstanceOf(Action);
		expect(action.device).toBe(context.device);
		expect(action.id).toBe(context.id);
		expect(action.manifestId).toBe(context.manifestId);
	});

	/**
	 * Asserts {@link Action.getSettings} requests the settings from the connection.
	 */
	it("getSettings", async () => {
		// Arrange.
		const action = new MultiActionKey<Settings>({
			device,
			id: "ABC123",
			manifestId: "com.elgato.test.one"
		});

		// Act (Command).
		const settings = action.getSettings();

		// Assert (Command).
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenLastCalledWith<[GetSettings]>({
			event: "getSettings",
			context: action.id
		});

		expect(Promise.race([settings, false])).resolves.toBe(false);

		// Act (Event).
		connection.emit("didReceiveSettings", {
			action: "com.other.test.one",
			context: "__other__", // Other action.
			event: "didReceiveSettings",
			device: "device123",
			payload: {
				controller: "Keypad",
				coordinates: {
					column: 0,
					row: 0
				},
				isInMultiAction: false,
				settings: {
					name: "Other"
				}
			}
		});

		connection.emit("didReceiveSettings", {
			action: action.manifestId,
			context: action.id, // Correct action.
			event: "didReceiveSettings",
			device: "device123",
			payload: {
				controller: "Keypad",
				coordinates: {
					column: 1,
					row: 3
				},
				isInMultiAction: false,
				settings: {
					name: "Elgato"
				}
			}
		});

		await settings;

		// Assert (Event).
		expect(await settings).toEqual<Settings>({
			name: "Elgato"
		});
	});

	describe("sending", () => {
		const action = new MultiActionKey({
			device,
			id: "ABC123",
			manifestId: "com.elgato.test.one"
		});

		/**
		 * Asserts {@link Action.sendToPropertyInspector} forwards the command to the {@link connection}.
		 */
		it("sendToPropertyInspector", async () => {
			// Arrange, act.
			await action.sendToPropertyInspector({
				name: "Elgato"
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SendToPropertyInspector]>({
				context: action.id,
				event: "sendToPropertyInspector",
				payload: {
					name: "Elgato"
				}
			});
		});

		/**
		 * Asserts {@link Action.setSettings} forwards the command to the {@link connection}.
		 */
		it("setSettings", async () => {
			// Arrange, act.
			await action.setSettings({
				name: "Elgato"
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetSettings]>({
				context: action.id,
				event: "setSettings",
				payload: {
					name: "Elgato"
				}
			});
		});
	});
});
