/**
 * @jest-environment jsdom
 */

import streamDeck from "../";
import { actionInfo, registrationInfo } from "../../api/registration/__mocks__";
import { connection } from "../connection";
import { plugin } from "../plugin";
import * as settings from "../settings";
import * as system from "../system";

jest.mock("../connection");

describe("streamDeck", () => {
	/**
	 * Asserts the default export contains the required namespaces.
	 */
	it("exports namespaces", () => {
		// Arrange, act, assert.
		expect(streamDeck.plugin).toStrictEqual(plugin);
		expect(streamDeck.settings).toStrictEqual(settings);
		expect(streamDeck.system).toStrictEqual(system);
	});

	/**
	 * Asserts {@link streamDeck.onDidConnect} is propagated when the connection emits `connected`.
	 */
	it("receives onDidConnect", () => {
		// Arrange.
		const listener = jest.fn();

		// Act.
		const disposable = streamDeck.onDidConnect(listener);
		connection.emit("connected", registrationInfo, actionInfo);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith(registrationInfo, actionInfo);

		// Act (dispose).
		disposable.dispose();
		connection.emit("connected", registrationInfo, actionInfo);

		// Assert (dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
