import { getConnection } from "../../../tests/__mocks__/connection";
import { getMockedLogger } from "../../../tests/__mocks__/logging";
import { manifest as mockedManifest } from "../../__mocks__/manifest";
import * as mockEvents from "../../connectivity/__mocks__/events";
import { StreamDeckConnection } from "../../connectivity/connection";
import { ActionIdentifier } from "../../connectivity/events";
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
import { SettingsClient } from "../../settings/client";
import { UIClient } from "../../ui";
import { Action } from "../action";
import { ActionClient } from "../client";
import { SingletonAction } from "../singleton-action";

jest.mock("../action", () => {
	const ActionModule = jest.requireActual("../action") as typeof import("../action");
	return {
		Action: jest.fn().mockImplementation((connection, source) => {
			return new ActionModule.Action(connection, source);
		})
	};
});

describe("ActionClient", () => {
	afterEach(() => jest.clearAllMocks());

	/**
	 * Asserts the constructor for {@link ActionClient} creates a scoped logger.
	 */
	it("Creates a scoped logger", () => {
		// Arrange.
		const { connection, settingsClient, uiClient, logger } = getParameters();
		const createScopeSpy = jest.spyOn(logger, "createScope");

		// Act.
		new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

		// Act.
		expect(createScopeSpy).toHaveBeenCalledTimes(1);
		expect(createScopeSpy).toHaveBeenCalledWith("ActionClient");
	});

	/**
	 * Asserts {@link ActionClient.createController} initializes a new action.
	 */
	it("Creates controllers", () => {
		// Arrange.
		const { connection, settingsClient, uiClient, logger } = getParameters();
		const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

		// Act.
		const action = client.createController("ABC123");

		// Assert.
		expect(action).not.toBeUndefined();
		expect(action.id).toBe("ABC123");
		// @ts-expect-error: manifestId is omitted, and should be an empty string.
		expect(action.manifestId).toBe("");
		expect(Action).toHaveBeenCalledTimes(1);
		expect(Action).toHaveBeenCalledWith<[StreamDeckConnection, ActionIdentifier]>(connection, { action: "", context: "ABC123" });
	});

	describe("Event emitters", () => {
		/**
		 * Asserts {@link ActionClient.onDialDown} invokes the listener when the connection emits the `dialDown` event.
		 */
		it("Receives onDialDown", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const listener = jest.fn();
			const emit = () => emitMessage(mockEvents.dialDown);

			// Act.
			const result = client.onDialDown(listener);
			const { action, context, device, payload } = emit();

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialDownEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action, context }),
				deviceId: device,
				payload,
				type: "dialDown"
			});

			// Act (dispose).
			result.dispose();
			emit();

			// Assert (dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionClient.onDialRotate} invokes the listener when the connection emits the `dialRotate` event.
		 */
		it("Receives onDialRotate", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const listener = jest.fn();
			const emit = () => emitMessage(mockEvents.dialRotate);

			// Act.
			const result = client.onDialRotate(listener);
			const { action, context, device, payload } = emit();

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialRotateEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action, context }),
				deviceId: device,
				payload,
				type: "dialRotate"
			});

			// Act (dispose).
			result.dispose();
			emit();

			// Assert (dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionClient.onDialUp} invokes the listener when the connection emits the `dialUp` event.
		 */
		it("Receives onDialUp", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const listener = jest.fn();
			const emit = () => emitMessage(mockEvents.dialUp);

			// Act.
			const result = client.onDialUp(listener);
			const { action, context, device, payload } = emit();

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialUpEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action, context }),
				deviceId: device,
				payload,
				type: "dialUp"
			});

			// Act (dispose).
			result.dispose();
			emit();

			// Assert (dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionClient.onKeyDown} invokes the listener when the connection emits the `keyDown` event.
		 */
		it("Receives onKeyDown", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const listener = jest.fn();
			const emit = () => emitMessage(mockEvents.keyDown);

			// Act.
			const result = client.onKeyDown(listener);
			const { action, context, device, payload } = emit();

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[KeyDownEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action, context }),
				deviceId: device,
				payload,
				type: "keyDown"
			});

			// Act (dispose).
			result.dispose();
			emit();

			// Assert (dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionClient.onKeyUp} invokes the listener when the connection emits the `keyUp` event.
		 */
		it("Receives onKeyUp", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const listener = jest.fn();
			const emit = () => emitMessage(mockEvents.keyUp);

			// Act.
			const result = client.onKeyUp(listener);
			const { action, context, device, payload } = emit();

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[KeyUpEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action, context }),
				deviceId: device,
				payload,
				type: "keyUp"
			});

			// Act (dispose).
			result.dispose();
			emit();

			// Assert (dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionClient.onTitleParametersDidChange} invokes the listener when the connection emits the `titleParametersDidChange` event.
		 */
		it("Receives onTitleParametersDidChange", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const listener = jest.fn();
			const emit = () => emitMessage(mockEvents.titleParametersDidChange);

			// Act.
			const result = client.onTitleParametersDidChange(listener);
			const { action, context, device, payload } = emit();

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[TitleParametersDidChangeEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action, context }),
				deviceId: device,
				payload,
				type: "titleParametersDidChange"
			});

			// Act (dispose).
			result.dispose();
			emit();

			// Assert (dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionClient.onTouchTap} invokes the listener when the connection emits the `touchTap` event.
		 */
		it("Receives onTouchTap", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const listener = jest.fn();
			const emit = () => emitMessage(mockEvents.touchTap);

			// Act.
			const result = client.onTouchTap(listener);
			const { action, context, device, payload } = emit();

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[TouchTapEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action, context }),
				deviceId: device,
				payload,
				type: "touchTap"
			});

			// Act (dispose).
			result.dispose();
			emit();

			// Assert (dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionClient.onWillAppear} invokes the listener when the connection emits the `willAppear` event.
		 */
		it("Receives onWillAppear", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const listener = jest.fn();
			const emit = () => emitMessage(mockEvents.willAppear);

			// Act.
			const result = client.onWillAppear(listener);
			const { action, context, device, payload } = emit();

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[WillAppearEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action, context }),
				deviceId: device,
				payload,
				type: "willAppear"
			});

			// Act (dispose).
			result.dispose();
			emit();

			// Assert (dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionClient.onWillDisappear} invokes the listener when the connection emits the `willDisappear` event.
		 */
		it("Receives onWillAppear", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const listener = jest.fn();
			const emit = () => emitMessage(mockEvents.willDisappear);

			// Act.
			const result = client.onWillDisappear(listener);
			const { action, context, device, payload } = emit();

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[WillDisappearEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action, context }),
				deviceId: device,
				payload,
				type: "willDisappear"
			});

			// Act (dispose).
			result.dispose();
			emit();

			// Assert (dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});
	});

	describe("Registering an action", () => {
		const manifestId = mockedManifest.Actions[0].UUID;

		afterEach(() => jest.clearAllMocks());

		/**
		 * Asserts {@link ActionClient.registerAction} validates the manifest identifier is not undefined.
		 */
		it("Validates the manifestId is not undefined", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId: undefined
			};

			// Act, assert.
			expect(() => client.registerAction(action)).toThrow("The action's manifestId cannot be undefined.");
		});

		/**
		 * Asserts {@link ActionClient.registerAction} validates the manifest identifier exists within the manifest.
		 */
		it("Warns when action does not exist in manifest", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, scopedLogger } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			// Act.
			client.registerAction({
				manifestId: "com.elgato.action-service.__one"
			});

			// Assert.
			expect(scopedLogger.warn).toHaveBeenCalledTimes(1);
			expect(scopedLogger.warn).toHaveBeenCalledWith("Failed to route action: manifestId (UUID) com.elgato.action-service.__one was not found in the manifest.");
		});

		/**
		 * Asserts {@link ActionClient.registerAction} ignores undefined handlers.
		 */
		it("Ignore undefined handlers", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const onSpy = jest.spyOn(connection, "on");

			// Act.
			client.registerAction({ manifestId });

			// Assert.
			expect(onSpy).not.toHaveBeenCalled();
		});

		/**
		 * Asserts {@link ActionClient.registerAction} route {@link ActionClient.onDialDown} to the action.
		 */
		it("Routes onDialDown", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId,
				onDialDown: jest.fn()
			};

			// Act.
			client.registerAction(action);

			const { device, payload, context } = emitMessage({
				...mockEvents.dialDown,
				action: manifestId
			});

			emitMessage(mockEvents.dialDown);

			// Assert.
			expect(action.onDialDown).toHaveBeenCalledTimes(1);
			expect(action.onDialDown).toHaveBeenCalledWith<[DialDownEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action: manifestId, context }),
				deviceId: device,
				payload,
				type: "dialDown"
			});
		});

		/**
		 * Asserts {@link ActionClient.registerAction} route {@link ActionClient.onDialRotate} to the action.
		 */
		it("Routes onDialRotate", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId,
				onDialRotate: jest.fn()
			};

			// Act.
			client.registerAction(action);

			const { device, payload, context } = emitMessage({
				...mockEvents.dialRotate,
				action: manifestId
			});

			emitMessage(mockEvents.dialRotate);

			// Assert.
			expect(action.onDialRotate).toHaveBeenCalledTimes(1);
			expect((action.onDialRotate as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onDialRotate).toHaveBeenCalledWith<[DialRotateEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action: manifestId, context }),
				deviceId: device,
				payload,
				type: "dialRotate"
			});
		});

		/**
		 * Asserts {@link ActionClient.registerAction} route {@link ActionClient.onDialUp} to the action.
		 */
		it("Routes onDialUp", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId,
				onDialUp: jest.fn()
			};

			// Act.
			client.registerAction(action);

			const { device, payload, context } = emitMessage({
				...mockEvents.dialUp,
				action: manifestId
			});

			emitMessage(mockEvents.dialUp);

			// Assert.
			expect(action.onDialUp).toHaveBeenCalledTimes(1);
			expect((action.onDialUp as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onDialUp).toHaveBeenCalledWith<[DialUpEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action: manifestId, context }),
				deviceId: device,
				payload,
				type: "dialUp"
			});
		});

		/**
		 * Asserts {@link ActionClient.registerAction} route {@link SettingsClient.onDidReceiveSettings} to the action.
		 */
		it("Routes onDidReceiveSettings", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId,
				onDidReceiveSettings: jest.fn()
			};

			// Act.
			client.registerAction(action);

			const { device, payload, context } = emitMessage({
				...mockEvents.didReceiveSettings,
				action: manifestId
			});

			emitMessage(mockEvents.didReceiveSettings);

			// Assert.
			expect(action.onDidReceiveSettings).toHaveBeenCalledTimes(1);
			expect((action.onDidReceiveSettings as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onDidReceiveSettings).toHaveBeenCalledWith<[DidReceiveSettingsEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action: manifestId, context }),
				deviceId: device,
				payload,
				type: "didReceiveSettings"
			});
		});

		/**
		 * Asserts {@link ActionClient.registerAction} route {@link ActionClient.onKeyDown} to the action.
		 */
		it("Routes onKeyDown", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId,
				onKeyDown: jest.fn()
			};

			// Act.
			client.registerAction(action);

			const { device, payload, context } = emitMessage({
				...mockEvents.keyDown,
				action: manifestId
			});

			emitMessage(mockEvents.keyDown);

			// Assert.
			expect(action.onKeyDown).toHaveBeenCalledTimes(1);
			expect((action.onKeyDown as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onKeyDown).toHaveBeenCalledWith<[KeyDownEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action: manifestId, context }),
				deviceId: device,
				payload,
				type: "keyDown"
			});
		});

		/**
		 * Asserts {@link ActionClient.registerAction} route {@link ActionClient.onKeyUp} to the action.
		 */
		it("Routes onKeyUp", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId,
				onKeyUp: jest.fn()
			};

			// Act.
			client.registerAction(action);

			const { device, payload, context } = emitMessage({
				...mockEvents.keyUp,
				action: manifestId
			});

			emitMessage(mockEvents.keyUp);

			// Assert.
			expect(action.onKeyUp).toHaveBeenCalledTimes(1);
			expect((action.onKeyUp as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onKeyUp).toHaveBeenCalledWith<[KeyUpEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action: manifestId, context }),
				deviceId: device,
				payload,
				type: "keyUp"
			});
		});

		/**
		 * Asserts {@link ActionClient.registerAction} route {@link UIClient.onPropertyInspectorDidAppear} to the action.
		 */
		it("Routes onPropertyInspectorDidAppear", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId,
				onPropertyInspectorDidAppear: jest.fn()
			};

			// Act.
			client.registerAction(action);

			const { device, context } = emitMessage({
				...mockEvents.propertyInspectorDidAppear,
				action: manifestId
			});

			emitMessage(mockEvents.propertyInspectorDidAppear);

			// Assert.
			expect(action.onPropertyInspectorDidAppear).toHaveBeenCalledTimes(1);
			expect((action.onPropertyInspectorDidAppear as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onPropertyInspectorDidAppear).toHaveBeenCalledWith<[PropertyInspectorDidAppearEvent<never>]>({
				action: new Action(connection, { action: manifestId, context }),
				deviceId: device,
				type: "propertyInspectorDidAppear"
			});
		});

		/**
		 * Asserts {@link ActionClient.registerAction} route {@link UIClient.onPropertyInspectorDidDisappear} to the action.
		 */
		it("Routes onPropertyInspectorDidDisappear", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId,
				onPropertyInspectorDidDisappear: jest.fn()
			};

			// Act.
			client.registerAction(action);

			const { device, context } = emitMessage({
				...mockEvents.propertyInspectorDidDisappear,
				action: manifestId
			});

			emitMessage(mockEvents.propertyInspectorDidDisappear);

			// Assert.
			expect(action.onPropertyInspectorDidDisappear).toHaveBeenCalledTimes(1);
			expect((action.onPropertyInspectorDidDisappear as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onPropertyInspectorDidDisappear).toHaveBeenCalledWith<[PropertyInspectorDidDisappearEvent<never>]>({
				action: new Action(connection, { action: manifestId, context }),
				deviceId: device,
				type: "propertyInspectorDidDisappear"
			});
		});

		/**
		 * Asserts {@link ActionClient.registerAction} route {@link UIClient.onSendToPlugin} to the action.
		 */
		it("Routes onSendToPlugin", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId,
				onSendToPlugin: jest.fn()
			};

			// Act.
			client.registerAction(action);

			const { payload, context } = emitMessage({
				...mockEvents.sendToPlugin,
				action: manifestId
			});

			emitMessage(mockEvents.sendToPlugin);

			// Assert.
			expect(action.onSendToPlugin).toHaveBeenCalledTimes(1);
			expect((action.onSendToPlugin as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onSendToPlugin).toHaveBeenCalledWith<[SendToPluginEvent<mockEvents.Settings, never>]>({
				action: new Action(connection, { action: manifestId, context }),
				payload,
				type: "sendToPlugin"
			});
		});

		/**
		 * Asserts {@link ActionClient.registerAction} route {@link ActionClient.onTitleParametersDidChange} to the action.
		 */
		it("Routes onTitleParametersDidChange", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId,
				onTitleParametersDidChange: jest.fn()
			};

			// Act.
			client.registerAction(action);

			const { device, payload, context } = emitMessage({
				...mockEvents.titleParametersDidChange,
				action: manifestId
			});

			emitMessage(mockEvents.titleParametersDidChange);

			// Assert.
			expect(action.onTitleParametersDidChange).toHaveBeenCalledTimes(1);
			expect((action.onTitleParametersDidChange as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onTitleParametersDidChange).toHaveBeenCalledWith<[TitleParametersDidChangeEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action: manifestId, context }),
				deviceId: device,
				payload,
				type: "titleParametersDidChange"
			});
		});

		/**
		 * Asserts {@link ActionClient.registerAction} route {@link ActionClient.onTouchTap} to the action.
		 */
		it("Routes onTouchTap", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId,
				onTouchTap: jest.fn()
			};

			// Act.
			client.registerAction(action);

			const { device, payload, context } = emitMessage({
				...mockEvents.touchTap,
				action: manifestId
			});

			emitMessage(mockEvents.touchTap);

			// Assert.
			expect(action.onTouchTap).toHaveBeenCalledTimes(1);
			expect((action.onTouchTap as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onTouchTap).toHaveBeenCalledWith<[TouchTapEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action: manifestId, context }),
				deviceId: device,
				payload,
				type: "touchTap"
			});
		});

		/**
		 * Asserts {@link ActionClient.registerAction} route {@link ActionClient.onWillAppear} to the action.
		 */
		it("Routes onWillAppear", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId,
				onWillAppear: jest.fn()
			};

			// Act.
			client.registerAction(action);

			const { device, payload, context } = emitMessage({
				...mockEvents.willAppear,
				action: manifestId
			});

			emitMessage(mockEvents.willAppear);

			// Assert.
			expect(action.onWillAppear).toHaveBeenCalledTimes(1);
			expect((action.onWillAppear as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onWillAppear).toHaveBeenCalledWith<[WillAppearEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action: manifestId, context }),
				deviceId: device,
				payload,
				type: "willAppear"
			});
		});

		/**
		 * Asserts {@link ActionClient.registerAction} route {@link ActionClient.onWillDisappear} to the action.
		 */
		it("Routes onWillDisappear", () => {
			// Arrange.
			const { connection, settingsClient, uiClient, logger, emitMessage } = getParameters();
			const client = new ActionClient(connection, mockedManifest, settingsClient, uiClient, logger);

			const action: SingletonAction = {
				manifestId,
				onWillDisappear: jest.fn()
			};

			// Act.
			client.registerAction(action);

			const { device, payload, context } = emitMessage({
				...mockEvents.willDisappear,
				action: manifestId
			});

			emitMessage(mockEvents.willDisappear);

			// Assert.
			expect(action.onWillDisappear).toHaveBeenCalledTimes(1);
			expect((action.onWillDisappear as jest.Mock).mock.contexts[0]).toStrictEqual(action);
			expect(action.onWillDisappear).toHaveBeenCalledWith<[WillDisappearEvent<mockEvents.Settings>]>({
				action: new Action(connection, { action: manifestId, context }),
				deviceId: device,
				payload,
				type: "willDisappear"
			});
		});
	});

	/**
	 * Gets the mocked parameters required to construct a new {@link ActionClient}.
	 * @returns Mocked parameters.
	 */
	function getParameters() {
		const { logger, scopedLogger } = getMockedLogger();
		const { connection, emitMessage } = getConnection();
		return {
			connection,
			emitMessage,
			logger,
			scopedLogger,
			settingsClient: new SettingsClient(connection),
			uiClient: new UIClient(connection)
		};
	}
});
