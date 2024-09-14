import { type ActionIdentifier, type GetSettings, type SendToPropertyInspector, type SetSettings } from "../../../api";
import { Settings } from "../../../api/__mocks__/events";
import { connection } from "../../connection";
import { Action } from "../action";

jest.mock("../../logging");
jest.mock("../../manifest");
jest.mock("../../connection");

describe("Action", () => {
	/**
	 * Asserts the constructor of {@link Action} sets the {@link Action.manifestId} and {@link Action.id}.
	 */
	it("constructor sets manifestId and id", () => {
		// Arrange.
		const source: ActionIdentifier = {
			action: "com.elgato.test.one",
			context: "ABC123"
		};

		// Act.
		const action = new Action(source);

		// Assert.
		expect(action.id).toBe("ABC123");
		expect(action.manifestId).toBe("com.elgato.test.one");
	});

	/**
	 * Asserts {@link Action.getSettings} requests the settings from the connection.
	 */
	it("getSettings", async () => {
		// Arrange.
		const action = new Action<Settings>({
			action: "com.elgato.test.one",
			context: "ABC123"
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

	// describe("type checking", () => {
	// 	/**
	// 	 * Asserts {@link Action.isDial}.
	// 	 */
	// 	it("can be dial", () => {
	// 		// Arrange.
	// 		const action = new DialAction({
	// 			action: "com.elgato.test.one",
	// 			context: "ABC123"
	// 		});

	// 		// Act, assert.
	// 		expect(action.isDial()).toBe(true);
	// 		expect(action.isKey()).toBe(false);
	// 		expect(action.isKeyInMultiAction()).toBe(false);
	// 	});

	// 	/**
	// 	 * Asserts {@link Action.isKey}.
	// 	 */
	// 	it("can be key", () => {
	// 		// Arrange.
	// 		const action = new KeyAction({
	// 			action: "com.elgato.test.one",
	// 			context: "ABC123"
	// 		});

	// 		// Act, assert.
	// 		expect(action.isDial()).toBe(false);
	// 		expect(action.isKey()).toBe(true);
	// 		expect(action.isKeyInMultiAction()).toBe(false);
	// 	});

	// 	/**
	// 	 * Asserts {@link Action.isKeyInMultiAction}.
	// 	 */
	// 	it("can be key in multi-action", () => {
	// 		// Arrange.
	// 		const action = new KeyInMultiAction({
	// 			action: "com.elgato.test.one",
	// 			context: "ABC123"
	// 		});

	// 		// Act, assert.
	// 		expect(action.isDial()).toBe(false);
	// 		expect(action.isKey()).toBe(false);
	// 		expect(action.isKeyInMultiAction()).toBe(true);
	// 	});
	// });

	describe("sending", () => {
		const action = new Action({
			action: "com.elgato.test.one",
			context: "ABC123"
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
