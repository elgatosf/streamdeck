import { logger } from "../../common/logging";
import { RegistrationParameters } from "../registration";

jest.mock("../../common/logging");

// Mock arguments.
const port = ["-port", "12345"];
const pluginUUID = ["-pluginUUID", "abc123"];
const registerEvent = ["-registerEvent", "test_event"];
const info = ["-info", `{"plugin":{"uuid":"com.elgato.test","version":"0.1.0"}}`];

describe("Registration Parameters", () => {
	afterEach(() => jest.clearAllMocks());

	it("Parses valid arguments", () => {
		const regParams = new RegistrationParameters([...port, ...pluginUUID, ...registerEvent, ...info]);
		expect(regParams.port).toBe("12345");
		expect(regParams.pluginUUID).toBe("abc123");
		expect(regParams.registerEvent).toBe("test_event");
		expect(regParams.info).not.toBeUndefined();
		expect(regParams.info.plugin.uuid).toBe("com.elgato.test");
		expect(regParams.info.plugin.version).toBe("0.1.0");
	});

	it("Requires port", () => {
		expect(() => new RegistrationParameters([...pluginUUID, ...registerEvent, ...info])).toThrow();
		expect(logger.logError).toBeCalledWith('Command line argument "-port" was not specified.');
		expect(logger.logDebug).toBeCalledWith(`pluginUUID=${[pluginUUID[1]]}`);
		expect(logger.logDebug).toBeCalledWith(`registerEvent=${[registerEvent[1]]}`);
		expect(logger.logDebug).toBeCalledWith(`info=${info[1]}`);
	});

	it("Requires pluginUUID", () => {
		expect(() => new RegistrationParameters([...port, ...registerEvent, ...info])).toThrow();
		expect(logger.logError).toBeCalledTimes(1);
		expect(logger.logDebug).toBeCalledWith(`port=${[port[1]]}`);
		expect(logger.logError).toBeCalledWith('Command line argument "-pluginUUID" was not specified.');
		expect(logger.logDebug).toBeCalledWith(`registerEvent=${[registerEvent[1]]}`);
		expect(logger.logDebug).toBeCalledWith(`info=${info[1]}`);
	});

	it("Requires registerEvent", () => {
		expect(() => new RegistrationParameters([...port, ...pluginUUID, ...info])).toThrow();
		expect(logger.logError).toBeCalledTimes(1);
		expect(logger.logDebug).toBeCalledWith(`port=${[port[1]]}`);
		expect(logger.logDebug).toBeCalledWith(`pluginUUID=${[pluginUUID[1]]}`);
		expect(logger.logError).toBeCalledWith('Command line argument "-registerEvent" was not specified.');
		expect(logger.logDebug).toBeCalledWith(`info=${info[1]}`);
	});

	it("Requires info", () => {
		expect(() => new RegistrationParameters([...port, ...pluginUUID, ...registerEvent])).toThrow();
		expect(logger.logError).toBeCalledTimes(1);
		expect(logger.logDebug).toBeCalledWith(`port=${[port[1]]}`);
		expect(logger.logDebug).toBeCalledWith(`pluginUUID=${[pluginUUID[1]]}`);
		expect(logger.logDebug).toBeCalledWith(`registerEvent=${[registerEvent[1]]}`);
		expect(logger.logError).toBeCalledWith('Command line argument "-info" was not specified.');
	});
});
