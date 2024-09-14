import { type ActionIdentifier, type SetState } from "../../../api";
import { connection } from "../../connection";
import { Action } from "../action";
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
		const source: ActionIdentifier = {
			action: "com.elgato.test.one",
			context: "ABC123"
		};

		// Act.
		const keyInMultiAction = new KeyInMultiAction(source);

		// Assert.
		expect(keyInMultiAction.id).toBe("ABC123");
		expect(keyInMultiAction.manifestId).toBe("com.elgato.test.one");
	});

	/**
	 * Asserts the inheritance of {@link KeyInMultiAction}.
	 */
	it("inherits shared methods", () => {
		// Arrange, act.
		const keyInMultiAction = new KeyInMultiAction({
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		// Assert.
		expect(keyInMultiAction).toBeInstanceOf(Action);
	});

	describe("sending", () => {
		const keyInMultiAction = new KeyInMultiAction({
			action: "com.elgato.test.one",
			context: "ABC123"
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
