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
		await openUrl("https://elgato.com");

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[OpenUrl]>({
			event: "openUrl",
			payload: {
				url: "https://elgato.com"
			}
		});
	});
});
