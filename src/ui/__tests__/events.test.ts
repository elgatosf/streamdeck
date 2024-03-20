import { DidReceiveGlobalSettingsEvent } from "../events";

describe("events", () => {
	/**
	 * Asserts {@link DidReceiveGlobalSettingsEvent} is exported.
	 */
	it("exports DidReceiveGlobalSettingsEvent", async () => {
		expect(DidReceiveGlobalSettingsEvent).toBe((await require("../../common/events")).DidReceiveGlobalSettingsEvent);
	});
});
