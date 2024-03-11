import type { OpenUrl } from "../../api";
import { connection } from "../connection";
import { openUrl } from "../system";

jest.mock("../connection");

describe("system", () => {
	/**
	 * Asserts {@link openUrl} sends the command to the {@link connection}.
	 */
	it("sends openUrl", async () => {
		// Arrange, act.
		const spyOnSend = jest.spyOn(connection, "send");
		await openUrl("https://elgato.com");

		// Assert.
		expect(spyOnSend).toHaveBeenCalledTimes(1);
		expect(spyOnSend).toHaveBeenCalledWith<[OpenUrl]>({
			event: "openUrl",
			payload: {
				url: "https://elgato.com"
			}
		});
	});
});
