import { registrationInfo } from "../../api/registration/__mocks__";

const { connection } = jest.requireActual<typeof import("../connection")>("../connection");

jest.spyOn(connection, "connect").mockReturnValue(Promise.resolve());
jest.spyOn(connection, "registrationParameters", "get").mockReturnValue({
	info: registrationInfo,
	pluginUUID: "abc123",
	port: "12345",
	registerEvent: "register",
});

jest.spyOn(connection, "send").mockReturnValue(Promise.resolve());

export { connection };
