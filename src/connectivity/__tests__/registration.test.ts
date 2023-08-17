import { getMockedLogger } from "../../../test/mocks/logging";
import type { Logger } from "../../logging";
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
		const { logger } = getMockedLogger();
		const regParams = new RegistrationParameters([...port, ...pluginUUID, ...registerEvent, ...info], logger);

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
		const { logger } = getMockedLogger();
		const regParams = new RegistrationParameters([...port, "-other", "Hello world", ...pluginUUID, ...registerEvent, ...info], logger);

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
		const { logger } = getMockedLogger();
		const regParams = new RegistrationParameters([...port, ...pluginUUID, "-bool", ...registerEvent, ...info], logger);

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
		const { logger, scopedLogger } = getMockedLogger();
		new RegistrationParameters([...port, ...pluginUUID, ...registerEvent, ...info], logger);

		// Assert.
		expect(scopedLogger.debug).toHaveBeenCalledTimes(4);
		expect(scopedLogger.debug).toBeCalledWith(`port=${[port[1]]}`);
		expect(scopedLogger.debug).toBeCalledWith(`pluginUUID=${[pluginUUID[1]]}`);
		expect(scopedLogger.debug).toBeCalledWith(`registerEvent=${[registerEvent[1]]}`);
		expect(scopedLogger.debug).toBeCalledWith(`info=${info[1]}`);
	});

	/**
	 * Asserts {@link RegistrationParameters} creates a named {@link Logger}.
	 */
	it("Creates a scoped logger", () => {
		// Arrange, act.
		const { logger } = getMockedLogger();
		new RegistrationParameters([...port, ...pluginUUID, ...registerEvent, ...info], logger);

		// Assert.
		expect(logger.createScope).toBeCalledWith("RegistrationParameters");
	});

	/**
	 * Asserts {@link RegistrationParameters} throws when there is a missing argument, and all missing arguments are included in the message.
	 */
	it("Includes all missing arguments", () => {
		// Arrange.
		const { logger } = getMockedLogger();

		// Act, assert.
		expect(() => new RegistrationParameters([], logger)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -port, -pluginUUID, -registerEvent, -info"
		);
	});

	/**
	 * Asserts {@link RegistrationParameters} throws when "-port" is missing.
	 */
	it("Requires port", () => {
		// Arrange.
		const { logger } = getMockedLogger();

		// Act, assert.
		expect(() => new RegistrationParameters([...pluginUUID, ...registerEvent, ...info], logger)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -port"
		);
	});

	/**
	 * Asserts {@link RegistrationParameters} throws when "-pluginUUID" is missing.
	 */
	it("Requires pluginUUID", () => {
		// Arrange.
		const { logger } = getMockedLogger();

		// Act, assert.
		expect(() => new RegistrationParameters([...port, ...registerEvent, ...info], logger)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -pluginUUID"
		);
	});

	/**
	 * Asserts {@link RegistrationParameters} throws when "-registerEvent" is missing.
	 */
	it("Requires registerEvent", () => {
		// Arrange.
		const { logger } = getMockedLogger();

		// Act, assert.
		expect(() => new RegistrationParameters([...port, ...pluginUUID, ...info], logger)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -registerEvent"
		);
	});

	/**
	 * Asserts {@link RegistrationParameters} throws when "-info" is missing.
	 */
	it("Requires info", () => {
		// Arrange.
		const { logger } = getMockedLogger();

		// Act, assert.
		expect(() => new RegistrationParameters([...port, ...pluginUUID, ...registerEvent], logger)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -info"
		);
	});
});
