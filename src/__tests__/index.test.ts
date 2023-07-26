import { registrationParameters } from "../connectivity/__mocks__/registration";
import { StreamDeckConnection } from "../connectivity/connection";
import { getDevices } from "../devices";
import { i18nProvider } from "../i18n";
import * as streamDeck from "../index";
import { StreamDeckClient } from "../interactivity/client";
import { getManifest } from "../manifest";
import { Router } from "../routing/router";

jest.mock("../common/logging");
jest.mock("../connectivity/connection");
jest.mock("../connectivity/registration");
jest.mock("../interactivity/client");
jest.mock("../devices");
jest.mock("../i18n");
jest.mock("../manifest");
jest.mock("../routing/router");

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

	it("Initializes router", () => {
		const mockedRouter = Router as jest.MockedClass<typeof Router>;
		expect(mockedRouter.mock.calls).toHaveLength(1);
		expect(mockedRouter.mock.calls[0]).toEqual([streamDeck.client, getManifest()]);
	});
});
