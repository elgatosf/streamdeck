import * as messages from "../messages";

/**
 * Mocked {@link messages.ApplicationDidLaunch} message.
 */
export const applicationDidLaunch: messages.ApplicationDidLaunch = {
	event: "applicationDidLaunch",
	payload: {
		application: "notepad.exe"
	}
};
