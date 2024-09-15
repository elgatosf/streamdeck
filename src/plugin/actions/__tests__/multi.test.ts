import { DeviceType, type SetState } from "../../../api";
import { connection } from "../../connection";
import { Device } from "../../devices/device";
import { Action, type ActionContext } from "../action";
import { MultiActionKey } from "../multi";

jest.mock("../../logging");
jest.mock("../../manifest");
jest.mock("../../connection");

describe("KeyMultiAction", () => {
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
	 * Asserts the constructor of {@link MultiActionKey} sets the context.
	 */
	it("constructor sets context", () => {
		// Arrange.
		const context: ActionContext = {
			device,
			id: "ABC123",
			manifestId: "com.elgato.test.one"
		};

		// Act.
		const multiActionKey = new MultiActionKey(context);

		// Assert.
		expect(multiActionKey.device).toBe(context.device);
		expect(multiActionKey.id).toBe(context.id);
		expect(multiActionKey.manifestId).toBe(context.manifestId);
	});

	/**
	 * Asserts the inheritance of {@link MultiActionKey}.
	 */
	it("inherits shared methods", () => {
		// Arrange, act.
		const multiActionKey = new MultiActionKey({
			device,
			id: "ABC123",
			manifestId: "com.elgato.test.one"
		});

		// Assert.
		expect(multiActionKey).toBeInstanceOf(Action);
	});

	describe("sending", () => {
		const multiActionKey = new MultiActionKey({
			device,
			id: "ABC123",
			manifestId: "com.elgato.test.one"
		});

		/**
		 * Asserts {@link MultiActionKey.setState} forwards the command to the {@link connection}.
		 */
		it("setState", async () => {
			// Arrange, act.
			await multiActionKey.setState(1);

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetState]>({
				context: multiActionKey.id,
				event: "setState",
				payload: {
					state: 1
				}
			});
		});
	});
});
