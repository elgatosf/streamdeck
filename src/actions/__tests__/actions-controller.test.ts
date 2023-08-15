import { getMockClient } from "../../../test/client";
import { manifest as mockManifest } from "../../__mocks__/manifest";
import { ActionsController } from "../actions-controller";
import { Route } from "../route";
import { SingletonAction } from "../singleton-action";

jest.mock("../singleton-action");
jest.mock("../route");

describe("ActionsController", () => {
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

	afterEach(() => jest.resetAllMocks());

	it("Adds valid routes", () => {
		// Arrange.
		const mockedRoute = Route as jest.MockedClass<typeof Route>;
		const { loggerFactory, client } = getMockClient();
		const action: SingletonAction = {};
		const actions = new ActionsController(client, manifest, loggerFactory);

		// Act.
		actions.registerAction(manifestId, action);

		// Assert.
		expect(mockedRoute.mock.instances).toHaveLength(1);
		expect(mockedRoute.mock.calls[0]).toEqual([client, manifestId, action]);
	});

	it("Warns when action does not exist in manifest", () => {
		// Arrange.
		const { loggerFactory, logger, client } = getMockClient();
		const actions = new ActionsController(client, manifest, loggerFactory);

		// Act.
		actions.registerAction("com.elgato.action-service.__one", new SingletonAction());

		// Assert.
		expect(logger.warn).toHaveBeenCalledTimes(1);
		expect(logger.warn).toHaveBeenCalledWith("Failed to route action. The specified action UUID does not exist in the manifest: com.elgato.action-service.__one");
	});
});
