import type { DidReceivePropertyInspectorMessage, PropertyInspectorDidAppear, PropertyInspectorDidDisappear } from "../../api";
import { Settings } from "../../api/__mocks__/events";
import { Action } from "../actions/action";
import { connection } from "../connection";
import { DidReceivePropertyInspectorMessageEvent, PropertyInspectorDidAppearEvent, type PropertyInspectorDidDisappearEvent } from "../events";
import { onDidReceivePropertyInspectorMessage, onPropertyInspectorDidAppear, onPropertyInspectorDidDisappear } from "../ui";

jest.mock("../connection");
jest.mock("../logging");
jest.mock("../manifest");

describe("ui", () => {
	/**
	 * Asserts {@link onPropertyInspectorDidAppear} is invoked when `propertyInspectorDidAppear` is emitted.
	 */
	it("receives onPropertyInspectorDidAppear", () => {
		// Arrange
		const listener = jest.fn();
		const ev = {
			action: "com.elgato.test.one",
			context: "context123",
			device: "device123",
			event: "propertyInspectorDidAppear"
		} satisfies PropertyInspectorDidAppear;

		// Act (emit).
		const disposable = onPropertyInspectorDidAppear(listener);
		connection.emit("propertyInspectorDidAppear", ev);

		// Assert (emit).
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidAppearEvent<Settings>]>({
			action: new Action(ev),
			deviceId: ev.device,
			type: "propertyInspectorDidAppear"
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit(ev.event, ev as any);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link onPropertyInspectorDidDisappear} is invoked when `propertyInspectorDidDisappear` is emitted.
	 */
	it("receives onPropertyInspectorDidDisappear", () => {
		// Arrange
		const listener = jest.fn();
		const ev = {
			action: "com.elgato.test.one",
			context: "context123",
			device: "device123",
			event: "propertyInspectorDidDisappear"
		} satisfies PropertyInspectorDidDisappear;

		// Act (emit).
		const disposable = onPropertyInspectorDidDisappear(listener);
		connection.emit("propertyInspectorDidDisappear", ev);

		// Assert (emit).
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidDisappearEvent<Settings>]>({
			action: new Action(ev),
			deviceId: ev.device,
			type: "propertyInspectorDidDisappear"
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit(ev.event, ev as any);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link onDidReceivePropertyInspectorMessage} is invoked when `sendToPlugin` is emitted for an unknown route.
	 */
	it("receives onDidReceivePropertyInspectorMessage", () => {
		// Arrange
		const listener = jest.fn();
		const ev = {
			action: "com.elgato.test.one",
			context: "context123",
			event: "sendToPlugin",
			payload: {
				name: "Hello world"
			}
		} satisfies DidReceivePropertyInspectorMessage<Settings>;

		// Act (emit).
		const disposable = onDidReceivePropertyInspectorMessage(listener);
		connection.emit("sendToPlugin", ev);

		// Assert (emit).
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceivePropertyInspectorMessageEvent<Settings, Settings>]>({
			action: new Action(ev),
			payload: {
				name: "Hello world"
			},
			type: "sendToPlugin"
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit(ev.event, ev as any);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
