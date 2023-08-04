import { manifest as mockManifest } from "../../__mocks__/manifest";
import { StreamDeckClient } from "../../client";
import { Logger } from "../../common/logging";
import { MockStreamDeckConnection } from "../../connectivity/__mocks__/connection";
import { registrationParameters } from "../../connectivity/__mocks__/registration";
import { StreamDeckConnection } from "../../connectivity/connection";
import { Device } from "../../devices";
import { ActionsController } from "../actions-controller";
import { Route } from "../route";
import { SingletonAction } from "../singleton-action";

jest.mock("../../common/logging");
jest.mock("../../connectivity/connection");
jest.mock("../singleton-action");
jest.mock("../route");

describe("ActionsController", () => {
	let logger: Logger;
	const manifest = mockManifest;
	const manifestId = "com.elgato.action-service.one";

	manifest.Actions = [
		{
			Name: "Action One",
			UUID: manifestId,
			Icon: "icon.png",
			States: [{ Image: "state.png" }]
		}
	];

	beforeEach(() => (logger = new Logger()));
	afterEach(() => jest.clearAllMocks());

	it("Adds valid routes", () => {
		// Arrange.
		const mockedRoute = Route as jest.MockedClass<typeof Route>;
		const { client } = getClient();
		const action: SingletonAction = {};
		const actions = new ActionsController(client, manifest, logger);

		// Act.
		actions.registerAction(manifestId, action);

		// Assert.
		expect(mockedRoute.mock.instances).toHaveLength(1);
		expect(mockedRoute.mock.calls[0]).toEqual([client, manifestId, action]);
	});

	it("Warns when action does not exist in manifest", () => {
		// Arrange.
		const { client } = getClient();
		const actions = new ActionsController(client, manifest, logger);

		// Act.
		actions.registerAction("com.elgato.action-service.__one", new SingletonAction());

		// Assert.
		expect(logger.logWarn).toHaveBeenCalledTimes(1);
		expect(logger.logWarn).toHaveBeenCalledWith("Failed to route action. The specified action UUID does not exist in the manifest: com.elgato.action-service.__one");
	});

	/**
	 * Gets the {@link StreamDeckClient} connected to a mock {@link StreamDeckConnection}
	 * @returns The client and its connection.
	 */
	function getClient() {
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;
		return {
			connection,
			client: new StreamDeckClient(connection, new Map<string, Device>())
		};
	}
});
