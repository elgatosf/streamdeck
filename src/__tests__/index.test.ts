import type { StreamDeckClient } from "../client";
import { registrationParameters } from "../connectivity/__mocks__/registration";
import type { StreamDeckConnection } from "../connectivity/connection";
import { LoggerFactory } from "../logging";

jest.mock("../actions/actions-controller");
jest.mock("../logging");
jest.mock("../connectivity/connection");
jest.mock("../connectivity/registration");
jest.mock("../client");
jest.mock("../devices");
jest.mock("../i18n");
jest.mock("../manifest");

describe("Index", () => {
	let mockedConnection: jest.MockedClass<typeof StreamDeckConnection>;
	let mockedClient: jest.MockedClass<typeof StreamDeckClient>;

	beforeEach(async () => {
		mockedConnection = (await require("../connectivity/connection")).StreamDeckConnection;
		mockedClient = (await require("../client")).StreamDeckClient;
	});

	afterEach(async () => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	it("Initializes connection", async () => {
		// Arrange, act.
		await require("../index");

		// Arrange.
		expect(mockedConnection.mock.calls).toHaveLength(1);
		expect(mockedConnection.mock.results[0].value.connect).toHaveBeenCalledTimes(1);
	});

	it("Initializes client", async () => {
		// Arrange, act.
		const streamDeck = (await require("../index")) as typeof import("../index");

		// Assert.
		expect(mockedClient.mock.calls).toHaveLength(1);
		expect(mockedClient.mock.calls[0]).toEqual([mockedConnection.mock.results[0].value]);
		expect(streamDeck.client).toEqual(mockedClient.mock.instances[0]);
	});

	it("Initializes devices", async () => {
		// Arrange, act.
		const { getDevices } = await require("../devices");
		const streamDeck = (await require("../index")) as typeof import("../index");

		// Assert
		expect(jest.isMockFunction(getDevices)).toBeTruthy();
		expect(getDevices).toHaveBeenCalledTimes(1);
		expect(getDevices).toHaveBeenLastCalledWith(mockedConnection.mock.results[0].value);
		expect(streamDeck.devices).toEqual(getDevices(mockedConnection.mock.results[0].value));
	});

	it("Exports info", async () => {
		// Arrange, act.
		const streamDeck = (await require("../index")) as typeof import("../index");

		// Assert.
		expect(streamDeck.info).toStrictEqual(mockedConnection.mock.results[0].value.registrationParameters.info);
	});

	it("Initializes logging", async () => {
		// Arrange.
		const logging = (await require("../logging")) as typeof import("../logging");
		const createLoggerFactory = jest.spyOn(logging, "createLoggerFactory").mockReturnValue("__mock__logger_factory__" as unknown as LoggerFactory);

		// Act.
		const streamDeck = (await require("../index")) as typeof import("../index");

		// Assert.
		expect(createLoggerFactory).toHaveBeenCalledTimes(1);
		expect(streamDeck.logging).toEqual("__mock__logger_factory__");
	});

	it("Initializes getManifest", async () => {
		// Arrange, act.
		const streamDeck = (await require("../index")) as typeof import("../index");
		const { getManifest } = await require("../manifest");

		// Assert.
		expect(jest.isMockFunction(getManifest)).toBeTruthy();
		expect(getManifest).toHaveBeenCalledTimes(1);
		expect(streamDeck.manifest).toEqual(getManifest());
	});

	it("Initializes i18n", async () => {
		// Arrange.
		const { I18nProvider } = await require("../i18n");
		const mockedI18nProvider = I18nProvider as jest.MockedClass<typeof I18nProvider>;

		// Act.
		const streamDeck = (await require("../index")) as typeof import("../index");

		// Assert.
		expect(mockedI18nProvider.mock.calls).toHaveLength(1);
		expect(mockedI18nProvider.mock.calls[0]).toEqual([registrationParameters.info.application.language, streamDeck.logging]);
		expect(streamDeck.i18n).toEqual(mockedI18nProvider.mock.instances[0]);
	});

	it("Initializes actions", async () => {
		// Arrange.
		const { getManifest } = await require("../manifest");

		const { ActionsController } = await require("../actions/actions-controller");
		const mockedActions = ActionsController as jest.MockedClass<typeof ActionsController>;

		// Act.
		const streamDeck = (await require("../index")) as typeof import("../index");

		// Assert.
		expect(mockedActions.mock.calls).toHaveLength(1);
		expect(mockedActions.mock.calls[0]).toEqual([streamDeck.client, getManifest(), streamDeck.logging]);
		expect(streamDeck.actions).toEqual(mockedActions.mock.instances[0]);
	});

	it("Initializes registration parameters", async () => {
		// Arrange.
		const { RegistrationParameters } = await require("../connectivity/registration");
		const mockedRegistrationParameters = RegistrationParameters as jest.MockedClass<typeof RegistrationParameters>;

		const { Logger } = await require("../logging");
		const mockedLogger = Logger as jest.MockedClass<typeof Logger>;

		// Act.
		await require("../index");

		// Assert.
		expect(mockedRegistrationParameters.mock.calls).toHaveLength(1);
		expect(mockedRegistrationParameters.mock.calls[0]).toEqual([process.argv, ...mockedLogger.mock.instances]);
	});
});
