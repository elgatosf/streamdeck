import { Logger } from "../../common/logging";
import { RegistrationParameters } from "../registration";

jest.mock("../../common/logging");

// Mock arguments.
const port = ["-port", "12345"];
const pluginUUID = ["-pluginUUID", "abc123"];
const registerEvent = ["-registerEvent", "test_event"];
const info = ["-info", `{"plugin":{"uuid":"com.elgato.test","version":"0.1.0"}}`];

describe("Registration Parameters", () => {
	let logger: Logger;

	beforeEach(() => (logger = new Logger()));
	afterEach(() => jest.clearAllMocks());

	it("Parses valid arguments", () => {
		// Arrange, act.
		const regParams = new RegistrationParameters([...port, ...pluginUUID, ...registerEvent, ...info], logger);

		// Assert.
		expect(regParams.port).toBe("12345");
		expect(regParams.pluginUUID).toBe("abc123");
		expect(regParams.registerEvent).toBe("test_event");
		expect(regParams.info).not.toBeUndefined();
		expect(regParams.info.plugin.uuid).toBe("com.elgato.test");
		expect(regParams.info.plugin.version).toBe("0.1.0");
	});

	it("Logs arguments", () => {
		// Arrange, act.
		const regParams = new RegistrationParameters([...port, ...pluginUUID, ...registerEvent, ...info], logger);

		// Assert.
		expect(logger.logDebug).toHaveBeenCalledTimes(4);
		expect(logger.logDebug).toBeCalledWith(`port=${[port[1]]}`);
		expect(logger.logDebug).toBeCalledWith(`pluginUUID=${[pluginUUID[1]]}`);
		expect(logger.logDebug).toBeCalledWith(`registerEvent=${[registerEvent[1]]}`);
		expect(logger.logDebug).toBeCalledWith(`info=${info[1]}`);
	});

	it("Includes all missing arguments", () => {
		expect(() => new RegistrationParameters([], logger)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -port, -pluginUUID, -registerEvent, -info"
		);
	});

	it("Requires port", () => {
		expect(() => new RegistrationParameters([...pluginUUID, ...registerEvent, ...info], logger)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -port"
		);
	});

	it("Requires pluginUUID", () => {
		expect(() => new RegistrationParameters([...port, ...registerEvent, ...info], logger)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -pluginUUID"
		);
	});

	it("Requires registerEvent", () => {
		expect(() => new RegistrationParameters([...port, ...pluginUUID, ...info], logger)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -registerEvent"
		);
	});

	it("Requires info", () => {
		expect(() => new RegistrationParameters([...port, ...pluginUUID, ...registerEvent], logger)).toThrow(
			"Unable to establish a connection with Stream Deck, missing command line arguments: -info"
		);
	});
});
