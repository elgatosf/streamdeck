import { getMockedActionContainer } from "../../../tests/__mocks__/action-container";
import * as mockEvents from "../../connectivity/__mocks__/events";
import {
	DialDownEvent,
	DialRotateEvent,
	DialUpEvent,
	KeyDownEvent,
	KeyUpEvent,
	TitleParametersDidChangeEvent,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent
} from "../../events";
import { Action } from "../action";
import { ActionClient } from "../client";
import { SingletonAction } from "../singleton-action";

describe("ActionClient", () => {
	/**
	 * Asserts {@link ActionClient.onDialDown} invokes the listener when the connection emits the `dialDown` event.
	 */
	it("Receives onDialDown", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		const listener = jest.fn();
		client.onDialDown(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.dialDown);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DialDownEvent<mockEvents.Settings>]>({
			action: new Action(connection, action, context),
			deviceId: device,
			payload,
			type: "dialDown"
		});
	});

	/**
	 * Asserts {@link ActionClient.onDialRotate} invokes the listener when the connection emits the `dialRotate` event.
	 */
	it("Receives onDialRotate", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		const listener = jest.fn();
		client.onDialRotate(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.dialRotate);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DialRotateEvent<mockEvents.Settings>]>({
			action: new Action(connection, action, context),
			deviceId: device,
			payload,
			type: "dialRotate"
		});
	});

	/**
	 * Asserts {@link ActionClient.onDialUp} invokes the listener when the connection emits the `dialUp` event.
	 */
	it("Receives onDialUp", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		const listener = jest.fn();
		client.onDialUp(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.dialUp);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DialUpEvent<mockEvents.Settings>]>({
			action: new Action(connection, action, context),
			deviceId: device,
			payload,
			type: "dialUp"
		});
	});

	/**
	 * Asserts {@link ActionClient.onKeyDown} invokes the listener when the connection emits the `keyDown` event.
	 */
	it("Receives onKeyDown", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		const listener = jest.fn();
		client.onKeyDown(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.keyDown);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[KeyDownEvent<mockEvents.Settings>]>({
			action: new Action(connection, action, context),
			deviceId: device,
			payload,
			type: "keyDown"
		});
	});

	/**
	 * Asserts {@link ActionClient.onKeyUp} invokes the listener when the connection emits the `keyUp` event.
	 */
	it("Receives onKeyUp", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		const listener = jest.fn();
		client.onKeyUp(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.keyUp);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[KeyUpEvent<mockEvents.Settings>]>({
			action: new Action(connection, action, context),
			deviceId: device,
			payload,
			type: "keyUp"
		});
	});

	/**
	 * Asserts {@link ActionClient.onTitleParametersDidChange} invokes the listener when the connection emits the `titleParametersDidChange` event.
	 */
	it("Receives onTitleParametersDidChange", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		const listener = jest.fn();
		client.onTitleParametersDidChange(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.titleParametersDidChange);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[TitleParametersDidChangeEvent<mockEvents.Settings>]>({
			action: new Action(connection, action, context),
			deviceId: device,
			payload,
			type: "titleParametersDidChange"
		});
	});

	/**
	 * Asserts {@link ActionClient.onTouchTap} invokes the listener when the connection emits the `touchTap` event.
	 */
	it("Receives onTouchTap", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		const listener = jest.fn();
		client.onTouchTap(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.touchTap);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[TouchTapEvent<mockEvents.Settings>]>({
			action: new Action(connection, action, context),
			deviceId: device,
			payload,
			type: "touchTap"
		});
	});

	/**
	 * Asserts {@link ActionClient.onWillAppear} invokes the listener when the connection emits the `willAppear` event.
	 */
	it("Receives onWillAppear", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		const listener = jest.fn();
		client.onWillAppear(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.willAppear);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[WillAppearEvent<mockEvents.Settings>]>({
			action: new Action(connection, action, context),
			deviceId: device,
			payload,
			type: "willAppear"
		});
	});

	/**
	 * Asserts {@link ActionClient.onWillDisappear} invokes the listener when the connection emits the `willDisappear` event.
	 */
	it("Receives onWillAppear", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		const listener = jest.fn();
		client.onWillDisappear(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.willDisappear);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[WillDisappearEvent<mockEvents.Settings>]>({
			action: new Action(connection, action, context),
			deviceId: device,
			payload,
			type: "willDisappear"
		});
	});

	/**
	 * Asserts {@link ActionClient.registerAction} propagates the request to the action container.
	 */
	it("Propagates registerAction", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);
		const registerActionSpy = jest.spyOn(container, "registerAction");

		// Act.
		const action: SingletonAction = {
			manifestId: "com.action-client.test.1"
		};

		client.registerAction(action);

		// Assert.
		expect(registerActionSpy).toHaveBeenCalledTimes(1);
		expect(registerActionSpy).toHaveBeenCalledWith(action);
	});
});
