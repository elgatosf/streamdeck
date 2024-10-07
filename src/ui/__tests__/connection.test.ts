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
	 * Asserts `connectElgatoStreamDeckSocket` is set on the `window`.
	 */
	it("connectElgatoStreamDeckSocket should exist on the window", () => {
		// Arrange, act, assert.
		expect(window.connectElgatoStreamDeckSocket).not.toBeUndefined();
	});

	/**
	 * Asserts the connection registers with the web sockets using the provided event and identifier.
	 */
	it("registers", async () => {
		// Arrange.
		const event = "register";
		const uuid = "123_registers";

		// Act.
		await window.connectElgatoStreamDeckSocket(
			port,
			uuid,
			event,
			JSON.stringify(registrationInfo),
			JSON.stringify(actionInfo),
		);

		// Assert
		await expect(server).toReceiveMessage({ event, uuid });
	});

	/**
	 * Asserts `connecting` and `connected` are emitted.
	 */
	it("emits connecting and connected", async () => {
		// Arrange.
		const uuid = "123_emits-connected";
		const connectingSpy = jest.fn();
		const connectedSpy = jest.fn();

		// Act.
		connection.on("connecting", connectingSpy);
		connection.on("connected", connectedSpy);

		await window.connectElgatoStreamDeckSocket(
			port,
			uuid,
			"register",
			JSON.stringify(registrationInfo),
			JSON.stringify(actionInfo),
		);

		// Assert
		await connection.getInfo();
		expect(connectingSpy).toHaveBeenCalledTimes(1);
		expect(connectingSpy).toBeCalledWith<[RegistrationInfo, ActionInfo]>(registrationInfo, actionInfo);
		expect(connectedSpy).toHaveBeenCalledTimes(1);
		expect(connectedSpy).toBeCalledWith<[RegistrationInfo, ActionInfo]>(registrationInfo, actionInfo);
		expect(connectingSpy.mock.invocationCallOrder[0]).toBeLessThan(connectedSpy.mock.invocationCallOrder[0]); // connecting before connected
	});

	/**
	 * Asserts `getInfo()` resolves the information provided as part of `connect(...)`.
	 */
	it("resolve info", async () => {
		// Arrange.
		const uuid = "123-resolve-info";
		await window.connectElgatoStreamDeckSocket(
			port,
			uuid,
			"register",
			JSON.stringify(registrationInfo),
			JSON.stringify(actionInfo),
		);

		// Act.
		const info = await connection.getInfo();

		// Assert
		expect(info.actionInfo).toEqual(actionInfo);
		expect(info.info).toEqual(registrationInfo);
		expect(info.uuid).toBe(uuid);
	});

	/**
	 * Asserts the connection forwards messages to the server.
	 */
	it("sends", async () => {
		// Arrange.
		const event = "register";
		const uuid = "123-sends";
		await window.connectElgatoStreamDeckSocket(
			port,
			uuid,
			event,
			JSON.stringify(registrationInfo),
			JSON.stringify(actionInfo),
		);

		// Act.
		await connection.send({
			event: "setSettings",
			action: "com.elgato.test.actionOne",
			context: "abc123",
			payload: {
				message: "Hello world",
			},
		});

		// Assert.
		await expect(server).toReceiveMessage({
			event,
			uuid,
		});

		await expect(server).toReceiveMessage({
			event: "setSettings",
			action: "com.elgato.test.actionOne",
			context: "abc123",
			payload: {
				message: "Hello world",
			},
		});
	});

	/**
	 * Asserts messages sent from the server are propagated by the connection.
	 */
	it("propagates messages", async () => {
		// Arrange.
		const listener = jest.fn();
		connection.on("didReceiveGlobalSettings", listener);

		await window.connectElgatoStreamDeckSocket(
			port,
			"123-propagate-messages",
			"register",
			JSON.stringify(registrationInfo),
			JSON.stringify(actionInfo),
		);

		// Act.
		server.send({
			event: "didReceiveGlobalSettings",
			payload: {
				settings: {
					message: "Hello world",
				},
			},
		} satisfies DidReceiveGlobalSettings<Settings>);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceiveGlobalSettings<Settings>]>({
			event: "didReceiveGlobalSettings",
			payload: {
				settings: {
					message: "Hello world",
				},
			},
		});
	});
});

type Settings = {
	message: string;
};
