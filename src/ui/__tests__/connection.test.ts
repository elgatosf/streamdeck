/**
 * @jest-environment jsdom
 */

import { WS as WebSocketServer } from "jest-websocket-mock";
import { ActionInfo, RegistrationInfo } from "..";
import { type DidReceiveGlobalSettings } from "../../api";
import { actionInfo, registrationInfo } from "../../api/registration/__mocks__/";
import type { connection as UIConnection } from "../connection";

describe("connection", () => {
	let connection!: typeof UIConnection;
	let server!: WebSocketServer;
	const port = "12345";

	// Reset the state of the connection before each test.
	beforeEach(async () => {
		jest.resetModules();

		({ connection } = await require("../connection"));
		server = new WebSocketServer(`ws://127.0.0.1:${port}`, { jsonProtocol: true });
	});

	// Clean-up the web socket server.
	afterEach(() => WebSocketServer.clean());

	/**
	 * Asserts the connection registers with the web sockets using the provided event and identifier.
	 */
	it("registers", async () => {
		// Arrange.
		const event = "register";
		const uuid = "123_registers";

		// Act.
		await connection.connect(port, uuid, event, registrationInfo, actionInfo);

		// Assert
		await expect(server).toReceiveMessage({ event, uuid });
	});

	/**
	 * Asserts `connected` is emitted once a connection has been established.
	 */
	it("emits connected", async () => {
		// Arrange.
		const uuid = "123_emits-connected";
		const connectedSpy = jest.fn();

		// Act.
		connection.on("connected", connectedSpy);
		await connection.connect(port, uuid, "register", registrationInfo, actionInfo);

		// Assert
		await connection.getInfo();
		expect(connectedSpy).toHaveBeenCalledTimes(1);
		expect(connectedSpy).toBeCalledWith<[RegistrationInfo, ActionInfo]>(registrationInfo, actionInfo);
	});

	/**
	 * Asserts `getInfo()` resolves the information provided as part of `connect(...)`.
	 */
	it("resolve info", async () => {
		// Arrange.
		const uuid = "123-resolve-info";
		await connection.connect(port, uuid, "register", registrationInfo, actionInfo);

		// Act.
		const info = await connection.getInfo();

		// Assert
		expect(info.actionInfo).toBe(actionInfo);
		expect(info.info).toBe(registrationInfo);
		expect(info.uuid).toBe(uuid);
	});

	/**
	 * Asserts the connection forwards messages to the server.
	 */
	it("sends", async () => {
		// Arrange.
		const event = "register";
		const uuid = "123-sends";
		await connection.connect(port, uuid, event, registrationInfo, actionInfo);

		// Act.
		await connection.send({
			event: "setSettings",
			action: "com.elgato.test.actionOne",
			context: "abc123",
			payload: {
				message: "Hello world"
			}
		});

		// Assert.
		await expect(server).toReceiveMessage({
			event,
			uuid
		});

		await expect(server).toReceiveMessage({
			event: "setSettings",
			action: "com.elgato.test.actionOne",
			context: "abc123",
			payload: {
				message: "Hello world"
			}
		});
	});

	/**
	 * Asserts messages sent from the server are propagated by the connection.
	 */
	it("propagates messages", async () => {
		// Arrange.
		const listener = jest.fn();
		connection.on("didReceiveGlobalSettings", listener);

		await connection.connect(port, "123-propagate-messages", "register", registrationInfo, actionInfo);

		// Act.
		server.send({
			event: "didReceiveGlobalSettings",
			payload: {
				settings: {
					message: "Hello world"
				}
			}
		} satisfies DidReceiveGlobalSettings<Settings>);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceiveGlobalSettings<Settings>]>({
			event: "didReceiveGlobalSettings",
			payload: {
				settings: {
					message: "Hello world"
				}
			}
		});
	});
});

type Settings = {
	message: string;
};
