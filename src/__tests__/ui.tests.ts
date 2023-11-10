import { getMockedActionContainer } from "../../tests/__mocks__/action-container";
import { Action } from "../actions/action";
import * as mockEvents from "../connectivity/__mocks__/events";
import { SendToPropertyInspector } from "../connectivity/commands";
import { StreamDeckConnection } from "../connectivity/connection";
import { PropertyInspectorDidAppearEvent, PropertyInspectorDidDisappearEvent, SendToPluginEvent } from "../events";
import { UIClient } from "../ui";

describe("UIClient", () => {
	/**
	 * Asserts {@link UIClient.onPropertyInspectorDidAppear} invokes the listener when the connection emits the `propertyInspectorDidAppear` event.
	 */
	it("Receives onPropertyInspectorDidAppear", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new UIClient(connection, container);

		const listener = jest.fn();
		client.onPropertyInspectorDidAppear(listener);

		// Act.
		const { action, context, device } = connection.__emit(mockEvents.propertyInspectorDidAppear);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidAppearEvent<never>]>({
			action: new Action(container.controller, action, context),
			deviceId: device,
			type: "propertyInspectorDidAppear"
		});
	});

	/**
	 * Asserts {@link UIClient.onPropertyInspectorDidDisappear} invokes the listener when the connection emits the `propertyInspectorDidDisappear` event.
	 */
	it("Receives onPropertyInspectorDidDisappear", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new UIClient(connection, container);

		const listener = jest.fn();
		client.onPropertyInspectorDidDisappear(listener);

		// Act.
		const { action, context, device } = connection.__emit(mockEvents.propertyInspectorDidDisappear);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidDisappearEvent<never>]>({
			action: new Action(container.controller, action, context),
			deviceId: device,
			type: "propertyInspectorDidDisappear"
		});
	});

	/**
	 * Asserts {@link UIClient.onSendToPlugin} invokes the listener when the connection emits the `sendToPlugin` event.
	 */
	it("Receives onSendToPlugin", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new UIClient(connection, container);

		const listener = jest.fn();
		client.onSendToPlugin(listener);

		// Act.
		const { action, context, payload } = connection.__emit(mockEvents.sendToPlugin);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[SendToPluginEvent<mockEvents.Settings, never>]>({
			action: new Action(container.controller, action, context),
			payload,
			type: "sendToPlugin"
		});
	});

	/**
	 * Assert {@link UIClient.sendToPropertyInspector} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends sendToPropertyInspector", async () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new UIClient(connection, container);

		// Act.
		await client.sendToPropertyInspector("ABC123", {
			name: "Elgato"
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[SendToPropertyInspector]>({
			event: "sendToPropertyInspector",
			context: "ABC123",
			payload: {
				name: "Elgato"
			}
		});
	});
});
