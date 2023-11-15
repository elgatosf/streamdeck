import { getConnection } from "../../tests/__mocks__/connection";
import { Action } from "../actions/action";
import * as mockEvents from "../connectivity/__mocks__/events";
import { PropertyInspectorDidAppearEvent, PropertyInspectorDidDisappearEvent, SendToPluginEvent } from "../events";
import { UIClient } from "../ui";

describe("UIClient", () => {
	/**
	 * Asserts {@link UIClient.onPropertyInspectorDidAppear} invokes the listener when the connection emits the `propertyInspectorDidAppear` event.
	 */
	it("Receives onPropertyInspectorDidAppear", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const client = new UIClient(connection);

		const listener = jest.fn();
		client.onPropertyInspectorDidAppear(listener);

		// Act.
		const { action, context, device } = emitMessage(mockEvents.propertyInspectorDidAppear);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidAppearEvent<never>]>({
			action: new Action(connection, { action, context }),
			deviceId: device,
			type: "propertyInspectorDidAppear"
		});
	});

	/**
	 * Asserts {@link UIClient.onPropertyInspectorDidDisappear} invokes the listener when the connection emits the `propertyInspectorDidDisappear` event.
	 */
	it("Receives onPropertyInspectorDidDisappear", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const client = new UIClient(connection);

		const listener = jest.fn();
		client.onPropertyInspectorDidDisappear(listener);

		// Act.
		const { action, context, device } = emitMessage(mockEvents.propertyInspectorDidDisappear);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidDisappearEvent<never>]>({
			action: new Action(connection, { action, context }),
			deviceId: device,
			type: "propertyInspectorDidDisappear"
		});
	});

	/**
	 * Asserts {@link UIClient.onSendToPlugin} invokes the listener when the connection emits the `sendToPlugin` event.
	 */
	it("Receives onSendToPlugin", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const client = new UIClient(connection);

		const listener = jest.fn();
		client.onSendToPlugin(listener);

		// Act.
		const { action, context, payload } = emitMessage(mockEvents.sendToPlugin);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[SendToPluginEvent<mockEvents.Settings, never>]>({
			action: new Action(connection, { action, context }),
			payload,
			type: "sendToPlugin"
		});
	});
});
