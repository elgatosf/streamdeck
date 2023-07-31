import { manifest as mockManifest } from "../../__mocks__/manifest";
import { StreamDeckClient } from "../../client";
import { logger } from "../../common/logging";
import { MockStreamDeckConnection } from "../../connectivity/__mocks__/connection";
import * as mockEvents from "../../connectivity/__mocks__/events";
import { StreamDeckConnection } from "../../connectivity/connection";
import { Device } from "../../devices";
import {
	DialDownEvent,
	DialRotateEvent,
	DialUpEvent,
	DidReceiveSettingsEvent,
	KeyDownEvent,
	KeyUpEvent,
	PropertyInspectorDidAppearEvent,
	PropertyInspectorDidDisappearEvent,
	SendToPluginEvent,
	TitleParametersDidChangeEvent,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent
} from "../../events";
import { Action } from "../action";
import { ActionsController } from "../actions-controller";
import { SingletonAction } from "../singleton-action";

jest.mock("../../common/logging");
jest.mock("../../connectivity/connection");
jest.mock("../singleton-action", () => {
	return {
		SingletonAction: jest.fn().mockImplementation(() => {
			return {
				onDialDown: jest.fn(),
				onDialRotate: jest.fn(),
				onDialUp: jest.fn(),
				onDidReceiveSettings: jest.fn(),
				onKeyDown: jest.fn(),
				onKeyUp: jest.fn(),
				onPropertyInspectorDidAppear: jest.fn(),
				onPropertyInspectorDidDisappear: jest.fn(),
				onSendToPlugin: jest.fn(),
				onTitleParametersDidChange: jest.fn(),
				onTouchTap: jest.fn(),
				onWillAppear: jest.fn(),
				onWillDisappear: jest.fn()
			};
		})
	};
});

describe("ActionService", () => {
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

	afterEach(() => jest.clearAllMocks());

	it("Warns when action does not exist in manifest", () => {
		// Arrange.
		const { client } = getClient();
		const actions = new ActionsController(client, manifest);

		// Act.
		actions.registerAction("com.elgato.action-service.__one", new SingletonAction());

		// Assert.
		expect(logger.logWarn).toHaveBeenCalledTimes(1);
		expect(logger.logWarn).toHaveBeenCalledWith("Failed to route action. The specified action UUID does not exist in the manifest: com.elgato.action-service.__one");
	});

	it("Routes onDialDown", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { device, payload, context } = connection.__emit({
			...mockEvents.dialDown,
			action: manifestId
		});

		connection.__emit(mockEvents.dialDown);

		// Assert.
		expect(action.onDialDown).toHaveBeenCalledTimes(1);
		expect(action.onDialDown).toHaveBeenCalledWith<[DialDownEvent<mockEvents.Settings>]>({
			action: new Action(client, manifestId, context),
			deviceId: device,
			payload,
			type: "dialDown"
		});
	});

	it("Routes onDialDown", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { device, payload, context } = connection.__emit({
			...mockEvents.dialDown,
			action: manifestId
		});

		connection.__emit(mockEvents.dialDown);

		// Assert.
		expect(action.onDialDown).toHaveBeenCalledTimes(1);
		expect((action.onDialDown as jest.Mock).mock.contexts[0]).toStrictEqual(action);
		expect(action.onDialDown).toHaveBeenCalledWith<[DialDownEvent<mockEvents.Settings>]>({
			action: new Action(client, manifestId, context),
			deviceId: device,
			payload,
			type: "dialDown"
		});
	});

	it("Routes onDialRotate", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { device, payload, context } = connection.__emit({
			...mockEvents.dialRotate,
			action: manifestId
		});

		connection.__emit(mockEvents.dialRotate);

		// Assert.
		expect(action.onDialRotate).toHaveBeenCalledTimes(1);
		expect((action.onDialRotate as jest.Mock).mock.contexts[0]).toStrictEqual(action);
		expect(action.onDialRotate).toHaveBeenCalledWith<[DialRotateEvent<mockEvents.Settings>]>({
			action: new Action(client, manifestId, context),
			deviceId: device,
			payload,
			type: "dialRotate"
		});
	});

	it("Routes onDialUp", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { device, payload, context } = connection.__emit({
			...mockEvents.dialUp,
			action: manifestId
		});

		connection.__emit(mockEvents.dialUp);

		// Assert.
		expect(action.onDialUp).toHaveBeenCalledTimes(1);
		expect((action.onDialUp as jest.Mock).mock.contexts[0]).toStrictEqual(action);
		expect(action.onDialUp).toHaveBeenCalledWith<[DialUpEvent<mockEvents.Settings>]>({
			action: new Action(client, manifestId, context),
			deviceId: device,
			payload,
			type: "dialUp"
		});
	});

	it("Routes onDidReceiveSettings", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { device, payload, context } = connection.__emit({
			...mockEvents.didReceiveSettings,
			action: manifestId
		});

		connection.__emit(mockEvents.didReceiveSettings);

		// Assert.
		expect(action.onDidReceiveSettings).toHaveBeenCalledTimes(1);
		expect((action.onDidReceiveSettings as jest.Mock).mock.contexts[0]).toStrictEqual(action);
		expect(action.onDidReceiveSettings).toHaveBeenCalledWith<[DidReceiveSettingsEvent<mockEvents.Settings>]>({
			action: new Action(client, manifestId, context),
			deviceId: device,
			payload,
			type: "didReceiveSettings"
		});
	});

	it("Routes onKeyDown", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { device, payload, context } = connection.__emit({
			...mockEvents.keyDown,
			action: manifestId
		});

		connection.__emit(mockEvents.keyDown);

		// Assert.
		expect(action.onKeyDown).toHaveBeenCalledTimes(1);
		expect((action.onKeyDown as jest.Mock).mock.contexts[0]).toStrictEqual(action);
		expect(action.onKeyDown).toHaveBeenCalledWith<[KeyDownEvent<mockEvents.Settings>]>({
			action: new Action(client, manifestId, context),
			deviceId: device,
			payload,
			type: "keyDown"
		});
	});

	it("Routes onKeyUp", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { device, payload, context } = connection.__emit({
			...mockEvents.keyUp,
			action: manifestId
		});

		connection.__emit(mockEvents.keyUp);

		// Assert.
		expect(action.onKeyUp).toHaveBeenCalledTimes(1);
		expect((action.onKeyUp as jest.Mock).mock.contexts[0]).toStrictEqual(action);
		expect(action.onKeyUp).toHaveBeenCalledWith<[KeyUpEvent<mockEvents.Settings>]>({
			action: new Action(client, manifestId, context),
			deviceId: device,
			payload,
			type: "keyUp"
		});
	});

	it("Routes onPropertyInspectorDidAppear", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { device, context } = connection.__emit({
			...mockEvents.propertyInspectorDidAppear,
			action: manifestId
		});

		connection.__emit(mockEvents.propertyInspectorDidAppear);

		// Assert.
		expect(action.onPropertyInspectorDidAppear).toHaveBeenCalledTimes(1);
		expect((action.onPropertyInspectorDidAppear as jest.Mock).mock.contexts[0]).toStrictEqual(action);
		expect(action.onPropertyInspectorDidAppear).toHaveBeenCalledWith<[PropertyInspectorDidAppearEvent]>({
			action: new Action(client, manifestId, context),
			deviceId: device,
			type: "propertyInspectorDidAppear"
		});
	});

	it("Routes onPropertyInspectorDidDisappear", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { device, context } = connection.__emit({
			...mockEvents.propertyInspectorDidDisappear,
			action: manifestId
		});

		connection.__emit(mockEvents.propertyInspectorDidDisappear);

		// Assert.
		expect(action.onPropertyInspectorDidDisappear).toHaveBeenCalledTimes(1);
		expect((action.onPropertyInspectorDidDisappear as jest.Mock).mock.contexts[0]).toStrictEqual(action);
		expect(action.onPropertyInspectorDidDisappear).toHaveBeenCalledWith<[PropertyInspectorDidDisappearEvent]>({
			action: new Action(client, manifestId, context),
			deviceId: device,
			type: "propertyInspectorDidDisappear"
		});
	});

	it("Routes onSendToPlugin", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { payload, context } = connection.__emit({
			...mockEvents.sendToPlugin,
			action: manifestId
		});

		connection.__emit(mockEvents.sendToPlugin);

		// Assert.
		expect(action.onSendToPlugin).toHaveBeenCalledTimes(1);
		expect((action.onSendToPlugin as jest.Mock).mock.contexts[0]).toStrictEqual(action);
		expect(action.onSendToPlugin).toHaveBeenCalledWith<[SendToPluginEvent<mockEvents.Settings>]>({
			action: new Action(client, manifestId, context),
			payload,
			type: "sendToPlugin"
		});
	});

	it("Routes onTitleParametersDidChange", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { device, payload, context } = connection.__emit({
			...mockEvents.titleParametersDidChange,
			action: manifestId
		});

		connection.__emit(mockEvents.titleParametersDidChange);

		// Assert.
		expect(action.onTitleParametersDidChange).toHaveBeenCalledTimes(1);
		expect((action.onTitleParametersDidChange as jest.Mock).mock.contexts[0]).toStrictEqual(action);
		expect(action.onTitleParametersDidChange).toHaveBeenCalledWith<[TitleParametersDidChangeEvent<mockEvents.Settings>]>({
			action: new Action(client, manifestId, context),
			deviceId: device,
			payload,
			type: "titleParametersDidChange"
		});
	});

	it("Routes onTouchTap", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { device, payload, context } = connection.__emit({
			...mockEvents.touchTap,
			action: manifestId
		});

		connection.__emit(mockEvents.touchTap);

		// Assert.
		expect(action.onTouchTap).toHaveBeenCalledTimes(1);
		expect((action.onTouchTap as jest.Mock).mock.contexts[0]).toStrictEqual(action);
		expect(action.onTouchTap).toHaveBeenCalledWith<[TouchTapEvent<mockEvents.Settings>]>({
			action: new Action(client, manifestId, context),
			deviceId: device,
			payload,
			type: "touchTap"
		});
	});

	it("Routes onWillAppear", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { device, payload, context } = connection.__emit({
			...mockEvents.willAppear,
			action: manifestId
		});

		connection.__emit(mockEvents.willAppear);

		// Assert.
		expect(action.onWillAppear).toHaveBeenCalledTimes(1);
		expect((action.onWillAppear as jest.Mock).mock.contexts[0]).toStrictEqual(action);
		expect(action.onWillAppear).toHaveBeenCalledWith<[WillAppearEvent<mockEvents.Settings>]>({
			action: new Action(client, manifestId, context),
			deviceId: device,
			payload,
			type: "willAppear"
		});
	});

	it("Routes onWillDisappear", () => {
		// Arrange.
		const { connection, client } = getClient();
		const action = new SingletonAction();

		// Act.
		const actions = new ActionsController(client, manifest);
		actions.registerAction(manifestId, action);

		const { device, payload, context } = connection.__emit({
			...mockEvents.willDisappear,
			action: manifestId
		});

		connection.__emit(mockEvents.willDisappear);

		// Assert.
		expect(action.onWillDisappear).toHaveBeenCalledTimes(1);
		expect((action.onWillDisappear as jest.Mock).mock.contexts[0]).toStrictEqual(action);
		expect(action.onWillDisappear).toHaveBeenCalledWith<[WillDisappearEvent<mockEvents.Settings>]>({
			action: new Action(client, manifestId, context),
			deviceId: device,
			payload,
			type: "willDisappear"
		});
	});

	/**
	 * Gets the {@link StreamDeckClient} connected to a mock {@link StreamDeckConnection}
	 * @returns The client and its connection.
	 */
	function getClient() {
		const connection = new StreamDeckConnection() as MockStreamDeckConnection;
		return {
			connection,
			client: new StreamDeckClient(connection, new Map<string, Device>())
		};
	}
});
