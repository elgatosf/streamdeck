import { vi } from "vitest";

import { registrationInfo } from "../../api/registration/__mocks__";

const { connection } = await vi.importActual<typeof import("../connection")>("../connection");

vi.spyOn(connection, "connect").mockReturnValue(Promise.resolve());
vi.spyOn(connection, "registrationParameters", "get").mockReturnValue({
	info: registrationInfo,
	pluginUUID: "abc123",
	port: "12345",
	registerEvent: "register",
});

vi.spyOn(connection, "send").mockReturnValue(Promise.resolve());

export { connection };
