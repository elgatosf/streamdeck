import { actionInfo, registrationInfo } from "../../api/registration/__mocks__";
import type { ConnectionInfo } from "../connection";

const { connection } = jest.requireActual<typeof import("../connection")>("../connection");

jest.spyOn(connection, "getInfo").mockReturnValue(
	Promise.resolve<ConnectionInfo>({
		actionInfo,
		info: registrationInfo,
		uuid: "abc123",
	}),
);

jest.spyOn(connection, "send").mockReturnValue(Promise.resolve());

export { connection };
