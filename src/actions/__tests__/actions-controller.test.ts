import { getMockedClient } from "../../../tests/__mocks__/client";
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

	it("Creates a scoped logger", () => {
		// Arrange.
		const { logger, client } = getMockedClient();
		const createScopeSpy = jest.spyOn(logger, "createScope");

		// Act.
		new ActionsController(client, manifest, logger);

		// Act.
		expect(createScopeSpy).toHaveBeenCalledTimes(1);
		expect(createScopeSpy).toHaveBeenCalledWith("ActionsController");
	});

	it("Adds valid routes", () => {
		// Arrange.
		const mockedRoute = Route as jest.MockedClass<typeof Route>;
		const { logger, client } = getMockedClient();
		const action: SingletonAction = {
			manifestId
		};
		const actions = new ActionsController(client, manifest, logger);

		// Act.
		actions.registerAction(action);

		// Assert.
		expect(mockedRoute.mock.instances).toHaveLength(1);
		expect(mockedRoute.mock.calls[0]).toEqual([client, action]);
	});

	it("Warns when action does not exist in manifest", () => {
		// Arrange.
		const { logger, scopedLogger, client } = getMockedClient();
		const actions = new ActionsController(client, manifest, logger);

		// Act.
		actions.registerAction({
			manifestId: "com.elgato.action-service.__one"
		});

		// Assert.
		expect(scopedLogger.warn).toHaveBeenCalledTimes(1);
		expect(scopedLogger.warn).toHaveBeenCalledWith("Failed to route action: manifestId (UUID) com.elgato.action-service.__one was not found in the manifest.");
	});

	it("Warns when manifestId is undefined", () => {
		// Arrange.
		const { logger, scopedLogger, client } = getMockedClient();
		const actions = new ActionsController(client, manifest, logger);

		// Act.
		actions.registerAction({
			manifestId: undefined
		});

		// Assert.
		expect(scopedLogger.warn).toHaveBeenCalledTimes(1);
		expect(scopedLogger.warn).toHaveBeenCalledWith("Failed to route action: manifestId (UUID) undefined was not found in the manifest.");
	});
});
