import { emitFrom } from "../../test/events";
import * as messages from "../connectivity/messages";
import { Device } from "../devices";
import { StreamDeckClient } from "./client";
import { SendToPluginEvent } from "./events";

const { StreamDeckConnection } = jest.createMockFromModule<typeof import("../connectivity/connection")>("../connectivity/connection");

describe("StreamDeckClient", () => {
	let connection: typeof StreamDeckConnection.prototype;

	beforeEach(() => {
		connection = new StreamDeckConnection();
		jest.resetAllMocks();
	});

	/**
	 * Assert {@link StreamDeckClient.sendToPropertyInspector} forwards the message to the {@link StreamDeckConnection}.
	 */
	it("Sends sendToPropertyInspector", () => {
		// Arrange.
		const client = new StreamDeckClient(connection, new Map<string, Device>());

		// Act.
		client.sendToPropertyInspector("ABC123", {
			name: "Elgato"
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith("sendToPropertyInspector", {
			context: "ABC123",
			payload: {
				name: "Elgato"
			}
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.sendToPlugin} is received from the {@link StreamDeckConnection}.
	 */
	it("Receives onSendToPlugin", () => {
		// Arrange.
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		let verified = false;

		// Act.
		client.onSendToPlugin(verify);
		emitFrom<"sendToPlugin", messages.SendToPlugin>(connection, "sendToPlugin", {
			action: "com.elgato.tests.one",
			context: "abc123",
			event: "sendToPlugin",
			payload: {
				name: "Elgato"
			}
		});

		// Assert
		expect(verified).toBe(true);

		/**
		 * Verifies {@link StreamDeckClient.onSendToPlugin}.
		 * @param ev Event arguments.
		 */
		function verify(ev: SendToPluginEvent<Settings>) {
			expect(ev.action.id).toBe("abc123");
			expect(ev.action.manifestId).toBe("com.elgato.tests.one");
			expect(ev.payload.name).toBe("Elgato");
			expect(ev.type).toBe("sendToPlugin");

			verified = true;
		}
	});
});

/**
 * Mock settings.
 */
type Settings = {
	/**
	 * Mock property.
	 */
	name: string;
};
