import { getMockedClient } from "../../../tests/__mocks__/client";
import { manifest as mockedManifest } from "../../__mocks__/manifest";
import * as mockEvents from "../../connectivity/__mocks__/events";
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
import { ActionRegistry } from "../action-registry";
import type { SingletonAction } from "../singleton-action";

jest.mock("../singleton-action");

describe("ActionRegistry", () => {
	it("Creates a scoped logger", () => {
		// Arrange.
		const { logger, client } = getMockedClient();
		const createScopeSpy = jest.spyOn(logger, "createScope");

		// Act.
		new ActionRegistry(client, mockedManifest, logger);

		// Act.
		expect(createScopeSpy).toHaveBeenCalledTimes(1);
		expect(createScopeSpy).toHaveBeenCalledWith("ActionRegistry");
	});

	describe("registerAction", () => {
		const manifestId = mockedManifest.Actions[0].UUID;

		afterEach(() => jest.clearAllMocks());

		it("Validates the manifestId is not undefined", () => {
			// Arrange.
			const { client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId: undefined
			};

			// Act, assert.
			expect(() => registrar.registerAction(action)).toThrow("The action's manifestId cannot be undefined.");
		});

		it("Warns when action does not exist in manifest", () => {
			// Arrange.
			const { client, logger, scopedLogger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			// Act.
			registrar.registerAction({
				manifestId: "com.elgato.action-service.__one"
			});

			// Assert.
			expect(scopedLogger.warn).toHaveBeenCalledTimes(1);
			expect(scopedLogger.warn).toHaveBeenCalledWith("Failed to route action: manifestId (UUID) com.elgato.action-service.__one was not found in the manifest.");
		});

		it("Routes onDialDown", () => {
			// Arrange.
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId,
				onDialDown: jest.fn()
			};

			// Act.
			registrar.registerAction(action);

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

		it("Routes onDialRotate", () => {
			// Arrange.
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId,
				onDialRotate: jest.fn()
			};

			// Act.
			registrar.registerAction(action);

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
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId,
				onDialUp: jest.fn()
			};

			// Act.
			registrar.registerAction(action);

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
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId,
				onDidReceiveSettings: jest.fn()
			};

			// Act.
			registrar.registerAction(action);

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
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId,
				onKeyDown: jest.fn()
			};

			// Act.
			registrar.registerAction(action);

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
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId,
				onKeyUp: jest.fn()
			};

			// Act.
			registrar.registerAction(action);

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
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId,
				onPropertyInspectorDidAppear: jest.fn()
			};

			// Act.
			registrar.registerAction(action);

			const { device, context } = connection.__emit({
				...mockEvents.propertyInspectorDidAppear,
				action: manifestId
			});

			connection.__emit(mockEvents.propertyInspectorDidAppear);

			// Assert.
			expect(action.onPropertyInspectorDidAppear).toHaveBeenCalledTimes(1);
			expect((action.onPropertyInspectorDidAppear as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onPropertyInspectorDidAppear).toHaveBeenCalledWith<[PropertyInspectorDidAppearEvent<never>]>({
				action: new Action(client, manifestId, context),
				deviceId: device,
				type: "propertyInspectorDidAppear"
			});
		});

		it("Routes onPropertyInspectorDidDisappear", () => {
			// Arrange.
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId,
				onPropertyInspectorDidDisappear: jest.fn()
			};

			// Act.
			registrar.registerAction(action);

			const { device, context } = connection.__emit({
				...mockEvents.propertyInspectorDidDisappear,
				action: manifestId
			});

			connection.__emit(mockEvents.propertyInspectorDidDisappear);

			// Assert.
			expect(action.onPropertyInspectorDidDisappear).toHaveBeenCalledTimes(1);
			expect((action.onPropertyInspectorDidDisappear as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onPropertyInspectorDidDisappear).toHaveBeenCalledWith<[PropertyInspectorDidDisappearEvent<never>]>({
				action: new Action(client, manifestId, context),
				deviceId: device,
				type: "propertyInspectorDidDisappear"
			});
		});

		it("Routes onSendToPlugin", () => {
			// Arrange.
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId,
				onSendToPlugin: jest.fn()
			};

			// Act.
			registrar.registerAction(action);

			const { payload, context } = connection.__emit({
				...mockEvents.sendToPlugin,
				action: manifestId
			});

			connection.__emit(mockEvents.sendToPlugin);

			// Assert.
			expect(action.onSendToPlugin).toHaveBeenCalledTimes(1);
			expect((action.onSendToPlugin as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onSendToPlugin).toHaveBeenCalledWith<[SendToPluginEvent<mockEvents.Settings, never>]>({
				action: new Action(client, manifestId, context),
				payload,
				type: "sendToPlugin"
			});
		});

		it("Routes onTitleParametersDidChange", () => {
			// Arrange.
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId,
				onTitleParametersDidChange: jest.fn()
			};

			// Act.
			registrar.registerAction(action);

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
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId,
				onTouchTap: jest.fn()
			};

			// Act.
			registrar.registerAction(action);

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
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId,
				onWillAppear: jest.fn()
			};

			// Act.
			registrar.registerAction(action);

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
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const action: SingletonAction = {
				manifestId,
				onWillDisappear: jest.fn()
			};

			// Act.
			registrar.registerAction(action);

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

		it("Ignore undefined handlers", () => {
			// Arrange.
			const { connection, client, logger } = getMockedClient();
			const registrar = new ActionRegistry(client, mockedManifest, logger);

			const onSpy = jest.spyOn(connection, "on");

			// Act.
			registrar.registerAction({ manifestId });

			// Assert.
			expect(onSpy).not.toHaveBeenCalled();
		});
	});
});
