import { DeviceType, Target, type SetImage, type SetState, type SetTitle, type ShowAlert, type ShowOk } from "../../../api";
import { connection } from "../../connection";
import { Device } from "../../devices";
import { Action, type CoordinatedActionContext } from "../action";
import { KeyAction } from "../key";

jest.mock("../../logging");
jest.mock("../../manifest");
jest.mock("../../connection");

describe("KeyAction", () => {
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
	 * Asserts the constructor of {@link KeyAction} sets the context.
	 */
	it("constructor sets context", () => {
		// Arrange.
		const context: CoordinatedActionContext = {
			device,
			id: "ABC123",
			manifestId: "com.elgato.test.one",
			coordinates: {
				column: 1,
				row: 2
			}
		};

		// Act.
		const keyAction = new KeyAction(context);

		// Assert.
		expect(keyAction.coordinates).toBe(context.coordinates);
		expect(keyAction.device).toBe(context.device);
		expect(keyAction.id).toBe(context.id);
		expect(keyAction.manifestId).toBe(context.manifestId);
	});

	/**
	 * Asserts the inheritance of {@link KeyAction}.
	 */
	it("inherits shared methods", () => {
		// Arrange, act.
		const keyAction = new KeyAction({
			device,
			id: "ABC123",
			manifestId: "com.elgato.test.one",
			coordinates: {
				column: 1,
				row: 2
			}
		});

		// Assert.
		expect(keyAction).toBeInstanceOf(Action);
	});

	describe("sending", () => {
		const keyAction = new KeyAction({
			device,
			id: "ABC123",
			manifestId: "com.elgato.test.one",
			coordinates: {
				column: 1,
				row: 2
			}
		});

		/**
		 * Asserts {@link KeyAction.setImage} forwards the command to the {@link connection}.
		 */
		it("setImage", async () => {
			// Arrange, act
			await keyAction.setImage();
			await keyAction.setImage("./imgs/test.png", {
				state: 1,
				target: Target.Hardware
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(2);
			expect(connection.send).toHaveBeenNthCalledWith<[SetImage]>(1, {
				context: keyAction.id,
				event: "setImage",
				payload: {
					image: undefined,
					state: undefined,
					target: undefined
				}
			});

			expect(connection.send).toHaveBeenNthCalledWith<[SetImage]>(2, {
				context: keyAction.id,
				event: "setImage",
				payload: {
					image: "./imgs/test.png",
					state: 1,
					target: Target.Hardware
				}
			});
		});

		/**
		 * Asserts {@link KeyAction.setState} forwards the command to the {@link connection}.
		 */
		it("setState", async () => {
			// Arrange, act.
			await keyAction.setState(1);

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetState]>({
				context: keyAction.id,
				event: "setState",
				payload: {
					state: 1
				}
			});
		});

		/**
		 * Asserts {@link KeyAction.setTitle} forwards the command to the {@link connection}.
		 */
		it("setTitle", async () => {
			// Arrange, act.
			await keyAction.setTitle("Hello world");
			await keyAction.setTitle("This is a test", { state: 1, target: Target.Software });

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(2);
			expect(connection.send).toHaveBeenNthCalledWith<[SetTitle]>(1, {
				event: "setTitle",
				context: "ABC123",
				payload: {
					title: "Hello world"
				}
			});

			expect(connection.send).toHaveBeenNthCalledWith<[SetTitle]>(2, {
				event: "setTitle",
				context: "ABC123",
				payload: {
					state: 1,
					target: Target.Software,
					title: "This is a test"
				}
			});
		});

		/**
		 * Asserts {@link KeyAction.showAlert} forwards the command to the {@link connection}.
		 */
		it("showAlert", async () => {
			// Arrange, act.
			await keyAction.showAlert();

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[ShowAlert]>({
				context: keyAction.id,
				event: "showAlert"
			});
		});

		/**
		 * Asserts {@link KeyAction.showOk} forwards the command to the {@link connection}.
		 */
		it("showOk", async () => {
			// Arrange, act
			await keyAction.showOk();

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[ShowOk]>({
				context: keyAction.id,
				event: "showOk"
			});
		});
	});
});
