import type { DidReceivePropertyInspectorMessage, PropertyInspectorDidAppear, PropertyInspectorDidDisappear } from "../../../api";
import { Settings } from "../../../api/__mocks__/events";
import { Action } from "../../actions/action";
import { connection } from "../../connection";
import { DidReceivePropertyInspectorMessageEvent, PropertyInspectorDidAppearEvent, type PropertyInspectorDidDisappearEvent } from "../../events";
import { ui } from "../controller";
import { PropertyInspector } from "../property-inspector";
import * as RouterModule from "../router";

jest.mock("../router");
jest.mock("../../connection");
jest.mock("../../logging");
jest.mock("../../manifest");

describe("UIController", () => {
	/**
	 * Asserts {@link ui.current} gets the current property inspector.
	 */
	it("gets current", () => {
		// Arrange.
		const pi = new PropertyInspector(RouterModule.router, {
			action: "com.elgato.test.one",
			context: "abc123",
			device: "dev123"
		});

		const spyOnGetCurrentUI = jest.spyOn(RouterModule, "getCurrentUI").mockReturnValue(pi);

		// Act.
		const current = ui.current;

		// Assert.
		expect(spyOnGetCurrentUI).toHaveBeenCalledTimes(1);
		expect(current).toBe(pi);
	});

	/**
	 * Asserts {@link ui.onDidAppear} is invoked when `propertyInspectorDidAppear` is emitted.
	 */
	it("receives onDidAppear", () => {
		// Arrange
		const listener = jest.fn();
		const ev = {
			action: "com.elgato.test.one",
			context: "context123",
			device: "device123",
			event: "propertyInspectorDidAppear"
		} satisfies PropertyInspectorDidAppear;

		// Act (emit).
		const disposable = ui.onDidAppear(listener);
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
	 * Asserts {@link ui.onDidDisappear} is invoked when `propertyInspectorDidDisappear` is emitted.
	 */
	it("receives onDidDisappear", () => {
		// Arrange
		const listener = jest.fn();
		const ev = {
			action: "com.elgato.test.one",
			context: "context123",
			device: "device123",
			event: "propertyInspectorDidDisappear"
		} satisfies PropertyInspectorDidDisappear;

		// Act (emit).
		const disposable = ui.onDidDisappear(listener);
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
	 * Asserts {@link ui.onMessage} is invoked when `sendToPlugin` is emitted for an unknown route.
	 */
	it("receives onMessage", () => {
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
		const disposable = ui.onMessage(listener);
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

	/**
	 * Asserts {@link ui.registerRoute} registers the route with the router.
	 */
	it("registerRoute", () => {
		// Arrange.
		const spyOnRoute = jest.spyOn(RouterModule.router, "route");
		const handler = jest.fn();
		const options = {
			filter: () => true
		};

		// Act.
		ui.registerRoute("/register", handler, options);

		// Assert.
		expect(spyOnRoute).toHaveBeenCalledTimes(1);
		expect(spyOnRoute).toHaveBeenCalledWith("/register", handler, options);
	});
});
