import { ActionsController } from "../actions/actions-controller";
import { StreamDeckClient } from "../client";
import { registrationParameters } from "../connectivity/__mocks__/registration";
import { StreamDeckConnection } from "../connectivity/connection";
import { getDevices } from "../devices";
import { i18nProvider } from "../i18n";
import * as streamDeck from "../index";
import { getManifest } from "../manifest";

jest.mock("../actions/actions-controller");
jest.mock("../common/logging");
jest.mock("../connectivity/connection");
jest.mock("../connectivity/registration");
jest.mock("../client");
jest.mock("../devices");
jest.mock("../i18n");
jest.mock("../manifest");

describe("Index", () => {
	const mockedConnection = StreamDeckConnection as jest.MockedClass<typeof StreamDeckConnection>;

	it("Establishes single connection", () => {
		expect(mockedConnection.mock.calls).toHaveLength(1);
		expect(mockedConnection.mock.results[0].value.connect).toHaveBeenCalledTimes(1);
	});

	it("Exports info", () => {
		expect(streamDeck.info).toBe(mockedConnection.mock.results[0].value.registrationParameters.info);
	});

	it("Initializes client", () => {
		const mockedStreamDeckClient = StreamDeckClient as jest.MockedClass<typeof StreamDeckClient>;
		expect(mockedStreamDeckClient.mock.calls).toHaveLength(1);
		expect(mockedStreamDeckClient.mock.calls[0]).toEqual([mockedConnection.mock.results[0].value]);
	});

	it("Initializes devices", () => {
		expect(jest.isMockFunction(getDevices)).toBeTruthy();
		expect(getDevices).toHaveBeenCalledTimes(1);
		expect(getDevices).toHaveBeenLastCalledWith(mockedConnection.mock.results[0].value);
	});

	it("Initializes getManifest", () => {
		expect(jest.isMockFunction(getManifest)).toBeTruthy();
		expect(getManifest).toHaveBeenCalledTimes(1);
	});

	it("Initializes i18n", () => {
		const mockedI18nProvider = i18nProvider as jest.MockedClass<typeof i18nProvider>;
		expect(mockedI18nProvider.mock.calls).toHaveLength(1);
		expect(mockedI18nProvider.mock.calls[0]).toEqual([registrationParameters.info.application.language]);
	});

	it("Initializes actions", () => {
		const mockedActions = ActionsController as jest.MockedClass<typeof ActionsController>;
		expect(mockedActions.mock.calls).toHaveLength(1);
		expect(mockedActions.mock.calls[0]).toEqual([streamDeck.client, getManifest()]);
	});
});
