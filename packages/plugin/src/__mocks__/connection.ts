import { vi } from "vitest";

import { registrationInfo } from "./registration.js";

const connection: typeof import("../connection.js").connection = (
	await vi.importActual<typeof import("../connection.js")>("../connection.js")
).connection;

vi.spyOn(connection, "connect").mockReturnValue(Promise.resolve());
vi.spyOn(connection, "registrationParameters", "get").mockReturnValue({
	info: registrationInfo,
	pluginUUID: "abc123",
	port: "12345",
	registerEvent: "register",
});

vi.spyOn(connection, "send").mockReturnValue(Promise.resolve());

export { connection };
