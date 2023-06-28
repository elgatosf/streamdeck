import WebSocket from "ws";

import { emitFrom } from "../../test/events";
import { applicationDidLaunch } from "./__mocks__/messages";
import { StreamDeckConnection } from "./connection";
import { RegistrationParameters } from "./registration";

jest.mock("../common/logging");
jest.mock("ws");

const regParams = new RegistrationParameters(["-port", "12345", "-pluginUUID", "abc123", "-registerEvent", "test_event", "-info", `{"plugin":{"uuid":"com.elgato.test","version":"0.1.0"}}`]);

describe("Connection", () => {
	const mockedWebSocket = WebSocket as jest.MockedClass<typeof WebSocket>;
	beforeEach(() => mockedWebSocket.mockClear());

	it("Does not connect on construction", () => {
		new StreamDeckConnection(regParams);
		expect(mockedWebSocket.mock.instances).toHaveLength(0);
	});

	it("Send registration on connection", () => {
		// Arrange.
		const connection = new StreamDeckConnection(regParams);
		connection.connect();

		// Act.
		emitFrom(mockedWebSocket, "open");

		// Assert.
		const [webSocket] = mockedWebSocket.mock.instances;
		expect(webSocket.send).toBeCalledTimes(1);
		expect(webSocket.send).toBeCalledWith(
			JSON.stringify({
				event: regParams.registerEvent,
				uuid: regParams.pluginUUID
			})
		);
	});

	describe("Propagates messages", () => {
		/**
		 * Helper class for verifying messages against an instance of a {@link StreamDeckConnection}. The {@link setup} function is called, followed by a mock emit event with the specified
		 * {@link message} buffer. The {@link setup} function is responsible for the underlying verification of the test.
		 * @param message Object that represents the message to be emitted by the connection's WebSocket; converted to a JSON.
		 * @param setup Setup function called prior to emitting the event. The setup must call `verify()` after asserting all expectations otherwise the test will fail.
		 */
		function verifyMessage(message: object, setup: (connection: StreamDeckConnection, verify: () => void) => void) {
			const connection = new StreamDeckConnection(regParams);
			connection.connect();

			let verified = false;
			setup(connection, () => (verified = true));

			emitFrom(mockedWebSocket, "message", JSON.stringify(message));
			expect(verified).toBeTruthy();
		}

		it("ApplicationDidLaunch", () => {
			verifyMessage(applicationDidLaunch, (connection, verify) => {
				connection.on("applicationDidLaunch", (ev) => {
					expect(ev.event).toBe(applicationDidLaunch.event);
					expect(ev.payload.application).toBe(applicationDidLaunch.payload.application);
					verify();
				});
			});
		});
	});
});
