import { getMockedActionContainer } from "../../../tests/__mocks__/action-container";
import * as mockEvents from "../../connectivity/__mocks__/events";
import { SetFeedback, SetFeedbackLayout, SetImage, SetState, SetTitle, SetTriggerDescription, ShowAlert, ShowOk } from "../../connectivity/commands";
import { StreamDeckConnection } from "../../connectivity/connection";
import { Target } from "../../connectivity/target";
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
import { ActionClient } from "../action-client";
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
			action: new Action(container.controller, action, context),
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
			action: new Action(container.controller, action, context),
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
			action: new Action(container.controller, action, context),
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
			action: new Action(container.controller, action, context),
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
			action: new Action(container.controller, action, context),
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
			action: new Action(container.controller, action, context),
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
			action: new Action(container.controller, action, context),
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
			action: new Action(container.controller, action, context),
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
			action: new Action(container.controller, action, context),
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

	/**
	 * Asserts {@link ActionClient.setFeedback} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setFeedback", async () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		// Act.
		await client.setFeedback("ABC123", {
			key1: {
				value: "Hello"
			},
			key2: 13
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[SetFeedback]>({
			event: "setFeedback",
			context: "ABC123",
			payload: {
				key1: {
					value: "Hello"
				},
				key2: 13
			}
		});
	});

	/**
	 * Asserts {@link ActionClient.setFeedbackLayout} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setFeedback", async () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		// Act.
		await client.setFeedbackLayout("ABC123", "./layouts/custom.json");

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[SetFeedbackLayout]>({
			event: "setFeedbackLayout",
			context: "ABC123",
			payload: {
				layout: "./layouts/custom.json"
			}
		});
	});

	/**
	 * Asserts {@link ActionClient.setImage} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setImage", async () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		// Act.
		await client.setImage("ABC123");
		await client.setImage("XYZ789", "./imgs/test.png", {
			state: 1,
			target: Target.Software
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(2);
		expect(connection.send).toHaveBeenNthCalledWith<[SetImage]>(1, {
			event: "setImage",
			context: "ABC123",
			payload: {
				image: undefined,
				state: undefined,
				target: undefined
			}
		});

		expect(connection.send).toHaveBeenNthCalledWith<[SetImage]>(2, {
			event: "setImage",
			context: "XYZ789",
			payload: {
				image: "./imgs/test.png",
				state: 1,
				target: 2
			}
		});
	});

	/**
	 * Asserts {@link ActionClient.setState} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setState", async () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		// Act.
		await client.setState("ABC123", 0);
		await client.setState("XYZ789", 1);

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(2);
		expect(connection.send).toHaveBeenNthCalledWith<[SetState]>(1, {
			event: "setState",
			context: "ABC123",
			payload: {
				state: 0
			}
		});

		expect(connection.send).toHaveBeenNthCalledWith<[SetState]>(2, {
			event: "setState",
			context: "XYZ789",
			payload: {
				state: 1
			}
		});
	});

	/**
	 * Asserts {@link ActionClient.setTitle} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setTitle", async () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		// Act.
		await client.setTitle("CTX1", "Hello world");
		await client.setTitle("CTX2", "This is a test", { state: 1, target: Target.Software });

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(2);
		expect(connection.send).toHaveBeenNthCalledWith<[SetTitle]>(1, {
			event: "setTitle",
			context: "CTX1",
			payload: {
				title: "Hello world"
			}
		});

		expect(connection.send).toHaveBeenNthCalledWith<[SetTitle]>(2, {
			event: "setTitle",
			context: "CTX2",
			payload: {
				state: 1,
				target: Target.Software,
				title: "This is a test"
			}
		});
	});

	/**
	 * Asserts {@link ActionClient.setTriggerDescription} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setTriggerDescription", async () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		// Act.
		await client.setTriggerDescription("ABC123");
		await client.setTriggerDescription("XYZ789", {
			longTouch: "Long-touch",
			push: "Push",
			rotate: "Rotate",
			touch: "Touch"
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(2);
		expect(connection.send).toHaveBeenNthCalledWith<[SetTriggerDescription]>(1, {
			event: "setTriggerDescription",
			context: "ABC123",
			payload: {}
		});

		expect(connection.send).toHaveBeenNthCalledWith<[SetTriggerDescription]>(2, {
			event: "setTriggerDescription",
			context: "XYZ789",
			payload: {
				longTouch: "Long-touch",
				push: "Push",
				rotate: "Rotate",
				touch: "Touch"
			}
		});
	});

	/**
	 * Asserts {@link ActionClient.showAlert} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends showAlert", async () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		// Act.
		await client.showAlert("ABC123");

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[ShowAlert]>({
			event: "showAlert",
			context: "ABC123"
		});
	});

	/**
	 * Asserts {@link ActionClient.showOk} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends showOk", async () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new ActionClient(connection, container);

		// Act.
		await client.showOk("ABC123");

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[ShowOk]>({
			event: "showOk",
			context: "ABC123"
		});
	});
});
