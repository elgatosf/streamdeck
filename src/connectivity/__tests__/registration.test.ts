import { getLogging } from "../../../test/mocks";
import { RegistrationParameters } from "../registration";

jest.mock("../../logging");

// Mock arguments.
const port = ["-port", "12345"];
const pluginUUID = ["-pluginUUID", "abc123"];
const registerEvent = ["-registerEvent", "test_event"];
const info = ["-info", `{"plugin":{"uuid":"com.elgato.test","version":"0.1.0"}}`];

describe("Registration Parameters", () => {
	/**
	 * Asserts {@link RegistrationParameters} is capable of parsing known arguments.
	 */
	it("Parses valid arguments", () => {
		// Arrange, act.
		const { loggerFactory } = getLogging();
		const regParams = new RegistrationParameters([...port, ...pluginUUID, ...registerEvent, ...info], loggerFactory);

		// Assert.
		expect(regParams.port).toBe("12345");
		expect(regParams.pluginUUID).toBe("abc123");
		expect(regParams.registerEvent).toBe("test_event");
		expect(regParams.info).not.toBeUndefined();
		expect(regParams.info.plugin.uuid).toBe("com.elgato.test");
		expect(regParams.info.plugin.version).toBe("0.1.0");
	});

	/**
	 * Asserts {@link RegistrationParameters} ignores unknown arguments.
	 */
	it("Ignores unknown arguments", () => {
		// Arrange, act.
		const { loggerFactory } = getLogging();
		const regParams = new RegistrationParameters([...port, "-other", "Hello world", ...pluginUUID, ...registerEvent, ...info], loggerFactory);

		// Assert.
		expect(regParams.port).toBe("12345");
		expect(regParams.pluginUUID).toBe("abc123");
		expect(regParams.registerEvent).toBe("test_event");
		expect(regParams.info).not.toBeUndefined();
		expect(regParams.info.plugin.uuid).toBe("com.elgato.test");
		expect(regParams.info.plugin.version).toBe("0.1.0");
	});

	/**
	 * Asserts {@link RegistrationParameters} is able to handle an odd number of key-value arguments.
	 */
	it("Handles uneven arguments", () => {
		// Arrange, act.
		const { loggerFactory } = getLogging();
		const regParams = new RegistrationParameters([...port, ...pluginUUID, "-bool", ...registerEvent, ...info], loggerFactory);

		// Assert.
		expect(regParams.port).toBe("12345");
		expect(regParams.pluginUUID).toBe("abc123");
		expect(regParams.registerEvent).toBe("test_event");
		expect(regParams.info).not.toBeUndefined();
		expect(regParams.info.plugin.uuid).toBe("com.elgato.test");
		expect(regParams.info.plugin.version).toBe("0.1.0");
	});

	/**
	 * Asserts {@link RegistrationParameters} logs all arguments to the {@link Logger}.
	 */
	it("Logs arguments", () => {
		// Arrange, act.
		const { loggerFactory, logger } = getLogging();
		const regParams = new RegistrationParameters([...port, ...pluginUUID, ...registerEvent, ...info], loggerFactory);

		// Assert.
		expect(logger.debug).toHaveBeenCalledTimes(4);
		expect(logger.debug).toBeCalledWith(`port=${[port[1]]}`);
		expect(logger.debug).toBeCalledWith(`pluginUUID=${[pluginUUID[1]]}`);
		expect(logger.debug).toBeCalledWith(`registerEvent=${[registerEvent[1]]}`);
		expect(logger.debug).toBeCalledWith(`info=${info[1]}`);
	});

	/**
	 * Asserts {@link RegistrationParameters} creates a named {@link Logger}.
	 */
	it("Creates a named logger", () => {
		// Arrange, act.
		const { loggerFactory, logger } = getLogging();
		new RegistrationParameters([...port, ...pluginUUID, ...registerEvent, ...info], loggerFactory);

		// Assert.
		expect(loggerFactory.createLogger).toBeCalledWith("RegistrationParameters");
	});

	/**
	 * Asserts {@link RegistrationParameters} throws when there is a missing argument, and all missing arguments are included in the message.
	 */
	it("Includes all missing arguments", () => {
		// Arrange.
		const { loggerFactory } = getLogging();

		// Act, assert.
		expect(() => new RegistrationParameters([], loggerFactory)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -port, -pluginUUID, -registerEvent, -info"
		);
	});

	/**
	 * Asserts {@link RegistrationParameters} throws when "-port" is missing.
	 */
	it("Requires port", () => {
		// Arrange.
		const { loggerFactory } = getLogging();

		// Act, assert.
		expect(() => new RegistrationParameters([...pluginUUID, ...registerEvent, ...info], loggerFactory)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -port"
		);
	});

	/**
	 * Asserts {@link RegistrationParameters} throws when "-pluginUUID" is missing.
	 */
	it("Requires pluginUUID", () => {
		// Arrange.
		const { loggerFactory } = getLogging();

		// Act, assert.
		expect(() => new RegistrationParameters([...port, ...registerEvent, ...info], loggerFactory)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -pluginUUID"
		);
	});

	/**
	 * Asserts {@link RegistrationParameters} throws when "-registerEvent" is missing.
	 */
	it("Requires registerEvent", () => {
		// Arrange.
		const { loggerFactory } = getLogging();

		// Act, assert.
		expect(() => new RegistrationParameters([...port, ...pluginUUID, ...info], loggerFactory)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -registerEvent"
		);
	});

	/**
	 * Asserts {@link RegistrationParameters} throws when "-info" is missing.
	 */
	it("Requires info", () => {
		// Arrange.
		const { loggerFactory } = getLogging();

		// Act, assert.
		expect(() => new RegistrationParameters([...port, ...pluginUUID, ...registerEvent], loggerFactory)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -info"
		);
	});
});
