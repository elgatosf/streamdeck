import { type SetState } from "../../../api";
import { connection } from "../../connection";
import { Action, type ActionContext } from "../action";
import { KeyInMultiAction } from "../multi";

jest.mock("../../logging");
jest.mock("../../manifest");
jest.mock("../../connection");

describe("KeyMultiAction", () => {
	/**
	 * Asserts the constructor of {@link KeyInMultiAction} sets the {@link KeyInMultiAction.manifestId} and {@link KeyInMultiAction.id}.
	 */
	it("constructor sets manifestId and id", () => {
		// Arrange.
		const context: ActionContext = {
			device: {
				id: "DEV123",
				isConnected: false
			},
			id: "ABC123",
			manifestId: "com.elgato.test.one"
		};

		// Act.
		const keyInMultiAction = new KeyInMultiAction(context);

		// Assert.
		expect(keyInMultiAction.device).toBe(context.device);
		expect(keyInMultiAction.id).toBe(context.id);
		expect(keyInMultiAction.manifestId).toBe(context.manifestId);
	});

	/**
	 * Asserts the inheritance of {@link KeyInMultiAction}.
	 */
	it("inherits shared methods", () => {
		// Arrange, act.
		const keyInMultiAction = new KeyInMultiAction({
			device: {
				id: "DEV123",
				isConnected: false
			},
			id: "ABC123",
			manifestId: "com.elgato.test.one"
		});

		// Assert.
		expect(keyInMultiAction).toBeInstanceOf(Action);
	});

	describe("sending", () => {
		const keyInMultiAction = new KeyInMultiAction({
			device: {
				id: "DEV123",
				isConnected: false
			},
			id: "ABC123",
			manifestId: "com.elgato.test.one"
		});

		/**
		 * Asserts {@link KeyInMultiAction.setState} forwards the command to the {@link connection}.
		 */
		it("setState", async () => {
			// Arrange, act.
			await keyInMultiAction.setState(1);

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetState]>({
				context: keyInMultiAction.id,
				event: "setState",
				payload: {
					state: 1
				}
			});
		});
	});
});
