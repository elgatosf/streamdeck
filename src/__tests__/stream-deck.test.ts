import { ActionsController } from "../actions/actions-controller";
import { StreamDeckClient } from "../client";
import { StreamDeckConnection } from "../connectivity/connection";
import { RegistrationParameters } from "../connectivity/registration";
import * as devices from "../devices";
import { Device, getDevices } from "../devices";
import { I18nProvider } from "../i18n";
import * as logging from "../logging";
import { createLogger } from "../logging";
import { getManifest } from "../manifest";
import { ProfilesController } from "../profiles";
import { SettingsClient } from "../settings";
import { StreamDeck } from "../stream-deck";
import { System } from "../system";

jest.mock("../actions/actions-controller");
jest.mock("../client");
jest.mock("../connectivity/connection");
jest.mock("../connectivity/registration");
jest.mock("../devices");
jest.mock("../i18n");
jest.mock("../logging");
jest.mock("../manifest");
jest.mock("../profiles");
jest.mock("../settings");
jest.mock("../system");

describe("StreamDeck", () => {
	beforeEach(async () => {
		jest.spyOn(logging, "createLogger").mockReturnValue(
			new logging.Logger({
				level: logging.LogLevel.INFO,
				target: {
					write: jest.fn()
				}
			})
		);

		jest.spyOn(devices, "getDevices").mockReturnValue(new Map<string, Device>());
	});

	afterEach(() => jest.clearAllMocks());

	/**
	 * Asserts all properties within {@link StreamDeck} are not initialized upon construction
	 */
	it("Does not initialize on construction", async () => {
		// Arrange, act.
		new StreamDeck();

		// Assert.
		expect(ActionsController).toHaveBeenCalledTimes(0);
		expect(getDevices).toHaveBeenCalledTimes(0);
		expect(I18nProvider).toHaveBeenCalledTimes(0);
		expect(createLogger).toHaveBeenCalledTimes(0);
		expect(getManifest).toHaveBeenCalledTimes(0);
		expect(ProfilesController).toHaveBeenCalledTimes(0);
		expect(SettingsClient).toHaveBeenCalledTimes(0);
		expect(StreamDeckClient).toHaveBeenCalledTimes(0);
		expect(StreamDeckConnection).toHaveBeenCalledTimes(0);
		expect(RegistrationParameters).toHaveBeenCalledTimes(0);
		expect(System).toHaveBeenCalledTimes(0);
	});

	/**
	 * Asserts all properties within {@link StreamDeck} are only initialized once.
	 */
	it("Only initializes properties once", () => {
		// Arrange.
		const streamDeck = new StreamDeck();

		const readAllProperties = () => {
			expect(streamDeck.actions).not.toBeUndefined();
			expect(streamDeck.client).not.toBeUndefined();
			expect(streamDeck.devices).not.toBeUndefined();
			expect(streamDeck.i18n).not.toBeUndefined();
			expect(streamDeck.info).not.toBeUndefined();
			expect(streamDeck.logger).not.toBeUndefined();
			expect(streamDeck.manifest).not.toBeUndefined();
			expect(streamDeck.profiles).not.toBeUndefined();
			expect(streamDeck.client).not.toBeUndefined();
			expect(streamDeck.system).not.toBeUndefined();
		};

		const expectInitializedOnce = () => {
			expect(ActionsController).toHaveBeenCalledTimes(1);
			expect(getDevices).toHaveBeenCalledTimes(1);
			expect(I18nProvider).toHaveBeenCalledTimes(1);
			expect(createLogger).toHaveBeenCalledTimes(1);
			expect(getManifest).toHaveBeenCalledTimes(1);
			expect(ProfilesController).toHaveBeenCalledTimes(1);
			expect(SettingsClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckClient).toHaveBeenCalledTimes(1);
			expect(StreamDeckConnection).toHaveBeenCalledTimes(1);
			expect(RegistrationParameters).toHaveBeenCalledTimes(1);
			expect(System).toHaveBeenCalledTimes(1);
		};

		// Act, assert.
		readAllProperties();
		expectInitializedOnce();

		// Act, assert.
		readAllProperties();
		expectInitializedOnce();
	});

	describe("Initializes properties with one-another", () => {
		/**
		 * Asserts accessing the {@link StreamDeck.actions} correctly loads its dependencies and dependents.
		 */
		it("actions", async () => {
			// Arrange, act.
			const streamDeck = new StreamDeck() as any;
			const { actions } = streamDeck;

			// Assert.
			expect(actions).not.toBeUndefined();

			const { client, manifest, logger } = streamDeck;
			expect(ActionsController).toHaveBeenCalledTimes(1);
			expect(ActionsController).toHaveBeenCalledWith(client, manifest, logger);
		});

		/**
		 * Asserts accessing the {@link StreamDeck.client} correctly loads its dependencies and dependents.
		 */
		it("client", async () => {
			// Arrange, act.
			const streamDeck = new StreamDeck() as any;
			const { client } = streamDeck;

			// Assert.
			expect(client).not.toBeUndefined();

			const { _connection, devices } = streamDeck;
			expect(StreamDeckClient).toHaveBeenCalledTimes(1);
			expect(StreamDeckClient).toHaveBeenCalledWith(_connection, devices);
		});

		/**
		 * Asserts accessing the {@link StreamDeck.devices} correctly loads its dependencies and dependents.
		 */
		it("devices", async () => {
			// Arrange, act.
			const streamDeck = new StreamDeck() as any;
			const { devices } = streamDeck;

			// Assert.
			expect(devices).not.toBeUndefined();

			const { _connection } = streamDeck;
			expect(getDevices).toHaveBeenCalledTimes(1);
			expect(getDevices).toHaveBeenCalledWith(_connection);
		});

		/**
		 * Asserts accessing the {@link StreamDeck.i18n} correctly loads its dependencies and dependents.
		 */
		it("i18n", async () => {
			// Arrange, act.
			const streamDeck = new StreamDeck() as any;
			const { i18n } = streamDeck;

			// Assert.
			expect(i18n).not.toBeUndefined();

			const { _registrationParameters, logger } = streamDeck;
			expect(I18nProvider).toHaveBeenCalledTimes(1);
			expect(I18nProvider).toHaveBeenCalledWith(_registrationParameters.info.application.language, getManifest(), logger);
		});

		/**
		 * Asserts accessing the {@link StreamDeck.info} correctly loads its dependencies and dependents.
		 */
		it("info", () => {
			// Arrange, act.
			const streamDeck = new StreamDeck() as any;
			const { info } = streamDeck;

			// Assert.
			expect(info).not.toBeUndefined();

			const { logger } = streamDeck;
			expect(RegistrationParameters).toHaveBeenCalledTimes(1);
			expect(RegistrationParameters).toHaveBeenCalledWith(process.argv, logger);
		});

		/**
		 * Asserts accessing the {@link StreamDeck.logger} correctly loads its dependencies and dependents.
		 */
		it("logger", () => {
			// Arrange, act.
			const streamDeck = new StreamDeck() as any;
			const { logger } = streamDeck;

			// Assert.
			expect(logger).not.toBeUndefined();
			expect(createLogger).toHaveBeenCalledTimes(1);
			expect(createLogger).toHaveBeenCalledWith();
		});

		/**
		 * Asserts accessing the {@link StreamDeck.manifest} correctly loads its dependencies and dependents.
		 */
		it("manifest", () => {
			// Arrange, act.
			const streamDeck = new StreamDeck() as any;
			const { manifest } = streamDeck;

			// Assert.
			expect(manifest).not.toBeUndefined();
			expect(getManifest).toHaveBeenCalledTimes(1);
			expect(getManifest).toHaveBeenCalledWith();
		});

		/**
		 * Asserts accessing the {@link StreamDeck.system} correctly loads its dependencies and dependents.
		 */
		it("system", async () => {
			// Arrange, act.
			const streamDeck = new StreamDeck() as any;
			const { system } = streamDeck;

			// Assert.
			expect(system).not.toBeUndefined();

			const { _connection } = streamDeck;
			expect(System).toHaveBeenCalledTimes(1);
			expect(System).toHaveBeenCalledWith(_connection);
		});
	});

	describe("Only initializes dependencies and dependents", () => {
		/**
		 * Asserts {@link StreamDeck.actions} is constructed with the correct dependencies.
		 */
		it("actions", async () => {
			// Arrange, act.
			const { actions } = new StreamDeck();

			// Assert.
			expect(actions).not.toBeUndefined();
			expect(actions).toBeInstanceOf(ActionsController);

			expect(ActionsController).toHaveBeenCalledTimes(1);
			expect(getDevices).toHaveBeenCalledTimes(1);
			expect(I18nProvider).toHaveBeenCalledTimes(0);
			expect(createLogger).toHaveBeenCalledTimes(1);
			expect(getManifest).toHaveBeenCalledTimes(1);
			expect(ProfilesController).toHaveBeenCalledTimes(0);
			expect(SettingsClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckClient).toHaveBeenCalledTimes(1);
			expect(StreamDeckConnection).toHaveBeenCalledTimes(1);
			expect(RegistrationParameters).toHaveBeenCalledTimes(1);
			expect(System).toHaveBeenCalledTimes(0);
		});

		/**
		 * Asserts {@link StreamDeck.client} is constructed with the correct dependencies
		 */
		it("client", async () => {
			// Arrange, act.
			const { client } = new StreamDeck();

			// Assert.
			expect(client).not.toBeUndefined();
			expect(client).toBeInstanceOf(StreamDeckClient);

			expect(ActionsController).toHaveBeenCalledTimes(0);
			expect(getDevices).toHaveBeenCalledTimes(1);
			expect(I18nProvider).toHaveBeenCalledTimes(0);
			expect(createLogger).toHaveBeenCalledTimes(1);
			expect(getManifest).toHaveBeenCalledTimes(0);
			expect(ProfilesController).toHaveBeenCalledTimes(0);
			expect(SettingsClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckClient).toHaveBeenCalledTimes(1);
			expect(StreamDeckConnection).toHaveBeenCalledTimes(1);
			expect(RegistrationParameters).toHaveBeenCalledTimes(1);
			expect(System).toHaveBeenCalledTimes(0);
		});

		/**
		 * Asserts {@link StreamDeck.devices} is constructed with the correct dependencies
		 */
		it("devices", async () => {
			// Arrange, act.
			const { devices } = new StreamDeck();

			// Assert.
			expect(devices).not.toBeUndefined();
			expect(devices).toBeInstanceOf(Map<string, Device>);

			expect(ActionsController).toHaveBeenCalledTimes(0);
			expect(getDevices).toHaveBeenCalledTimes(1);
			expect(I18nProvider).toHaveBeenCalledTimes(0);
			expect(createLogger).toHaveBeenCalledTimes(1);
			expect(getManifest).toHaveBeenCalledTimes(0);
			expect(ProfilesController).toHaveBeenCalledTimes(0);
			expect(SettingsClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckConnection).toHaveBeenCalledTimes(1);
			expect(RegistrationParameters).toHaveBeenCalledTimes(1);
			expect(System).toHaveBeenCalledTimes(0);
		});

		/**
		 * Asserts {@link StreamDeck.i18n} is constructed with the correct dependencies
		 */
		it("i18n", async () => {
			// Arrange.
			const { i18n } = new StreamDeck();

			// Assert.
			expect(i18n).not.toBeUndefined();
			expect(i18n).toBeInstanceOf(I18nProvider);

			expect(ActionsController).toHaveBeenCalledTimes(0);
			expect(getDevices).toHaveBeenCalledTimes(0);
			expect(I18nProvider).toHaveBeenCalledTimes(1);
			expect(createLogger).toHaveBeenCalledTimes(1);
			expect(getManifest).toHaveBeenCalledTimes(1);
			expect(ProfilesController).toHaveBeenCalledTimes(0);
			expect(SettingsClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckConnection).toHaveBeenCalledTimes(0);
			expect(RegistrationParameters).toHaveBeenCalledTimes(1);
			expect(System).toHaveBeenCalledTimes(0);
		});

		/**
		 * Asserts {@link StreamDeck.info} is constructed with the correct dependencies
		 */
		it("info", () => {
			// Arrange, act.
			const { info } = new StreamDeck();

			// Assert.
			expect(info).not.toBeUndefined();

			expect(ActionsController).toHaveBeenCalledTimes(0);
			expect(getDevices).toHaveBeenCalledTimes(0);
			expect(I18nProvider).toHaveBeenCalledTimes(0);
			expect(createLogger).toHaveBeenCalledTimes(1);
			expect(getManifest).toHaveBeenCalledTimes(0);
			expect(ProfilesController).toHaveBeenCalledTimes(0);
			expect(SettingsClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckConnection).toHaveBeenCalledTimes(0);
			expect(RegistrationParameters).toHaveBeenCalledTimes(1);
			expect(System).toHaveBeenCalledTimes(0);
		});

		/**
		 * Asserts {@link StreamDeck.logger} is constructed with the correct dependencies
		 */
		it("logger", () => {
			// Arrange, act.
			const { logger } = new StreamDeck();

			// Assert.
			expect(logger).not.toBeUndefined();
			expect(logger).toBeInstanceOf(logging.Logger);

			expect(ActionsController).toHaveBeenCalledTimes(0);
			expect(getDevices).toHaveBeenCalledTimes(0);
			expect(I18nProvider).toHaveBeenCalledTimes(0);
			expect(createLogger).toHaveBeenCalledTimes(1);
			expect(getManifest).toHaveBeenCalledTimes(0);
			expect(ProfilesController).toHaveBeenCalledTimes(0);
			expect(SettingsClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckConnection).toHaveBeenCalledTimes(0);
			expect(RegistrationParameters).toHaveBeenCalledTimes(0);
			expect(System).toHaveBeenCalledTimes(0);
		});

		/**
		 * Asserts {@link StreamDeck.manifest} is constructed with the correct dependencies
		 */
		it("manifest", () => {
			// Arrange, act.
			const { manifest } = new StreamDeck();

			// Assert.
			expect(manifest).not.toBeUndefined();

			expect(ActionsController).toHaveBeenCalledTimes(0);
			expect(getDevices).toHaveBeenCalledTimes(0);
			expect(I18nProvider).toHaveBeenCalledTimes(0);
			expect(createLogger).toHaveBeenCalledTimes(0);
			expect(getManifest).toHaveBeenCalledTimes(1);
			expect(ProfilesController).toHaveBeenCalledTimes(0);
			expect(SettingsClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckConnection).toHaveBeenCalledTimes(0);
			expect(RegistrationParameters).toHaveBeenCalledTimes(0);
			expect(System).toHaveBeenCalledTimes(0);
		});

		/**
		 * Asserts {@link StreamDeck.profiles} is constructed with the correct dependencies
		 */
		it("profiles", () => {
			// Arrange, act.
			const { profiles } = new StreamDeck();

			// Assert.
			expect(profiles).not.toBeUndefined();
			expect(profiles).toBeInstanceOf(ProfilesController);

			expect(ActionsController).toHaveBeenCalledTimes(0);
			expect(getDevices).toHaveBeenCalledTimes(1);
			expect(I18nProvider).toHaveBeenCalledTimes(0);
			expect(createLogger).toHaveBeenCalledTimes(1);
			expect(getManifest).toHaveBeenCalledTimes(0);
			expect(ProfilesController).toHaveBeenCalledTimes(1);
			expect(SettingsClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckConnection).toHaveBeenCalledTimes(1);
			expect(RegistrationParameters).toHaveBeenCalledTimes(1);
			expect(System).toHaveBeenCalledTimes(0);
		});

		/**
		 * Asserts {@link StreamDeck.settings} is constructed with the correct dependencies
		 */
		it("settings", () => {
			// Arrange, act.
			const { settings } = new StreamDeck();

			// Assert.
			expect(settings).not.toBeUndefined();
			expect(settings).toBeInstanceOf(SettingsClient);

			expect(ActionsController).toHaveBeenCalledTimes(0);
			expect(getDevices).toHaveBeenCalledTimes(1);
			expect(I18nProvider).toHaveBeenCalledTimes(0);
			expect(createLogger).toHaveBeenCalledTimes(1);
			expect(getManifest).toHaveBeenCalledTimes(0);
			expect(ProfilesController).toHaveBeenCalledTimes(0);
			expect(SettingsClient).toHaveBeenCalledTimes(1);
			expect(StreamDeckClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckConnection).toHaveBeenCalledTimes(1);
			expect(RegistrationParameters).toHaveBeenCalledTimes(1);
			expect(System).toHaveBeenCalledTimes(0);
		});

		/**
		 * Asserts {@link StreamDeck.system} is constructed with the correct dependencies
		 */
		it("system", () => {
			// Arrange, act.
			const { system } = new StreamDeck();

			// Assert.
			expect(system).not.toBeUndefined();
			expect(system).toBeInstanceOf(System);

			expect(ActionsController).toHaveBeenCalledTimes(0);
			expect(getDevices).toHaveBeenCalledTimes(1);
			expect(I18nProvider).toHaveBeenCalledTimes(0);
			expect(createLogger).toHaveBeenCalledTimes(1);
			expect(getManifest).toHaveBeenCalledTimes(0);
			expect(ProfilesController).toHaveBeenCalledTimes(0);
			expect(SettingsClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckClient).toHaveBeenCalledTimes(0);
			expect(StreamDeckConnection).toHaveBeenCalledTimes(1);
			expect(RegistrationParameters).toHaveBeenCalledTimes(1);
			expect(System).toHaveBeenCalledTimes(1);
		});
	});

	/**
	 * Asserts {@link StreamDeck.connect} propagates the request to the underlying connection.
	 */
	it("Calls connect on the connection", () => {
		// Arrange.
		const streamDeck = new StreamDeck() as any;

		// Act.
		streamDeck.connect();

		// Assert.
		expect(streamDeck._connection.connect).toHaveBeenCalledTimes(1);
	});
});
