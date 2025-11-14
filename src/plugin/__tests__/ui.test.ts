import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { Settings } from "../../api/__mocks__/events.js";
import {
	DeviceType,
	type DidReceivePropertyInspectorMessage,
	type PropertyInspectorDidAppear,
	type PropertyInspectorDidDisappear,
	type SendToPropertyInspector,
} from "../../api/index.js";
import { KeyAction } from "../actions/key.js";
import { actionStore } from "../actions/store.js";
import { connection } from "../connection.js";
import { Device } from "../devices/device.js";
import { deviceStore } from "../devices/store.js";
import {
	type PropertyInspectorDidAppearEvent,
	type PropertyInspectorDidDisappearEvent,
	SendToPluginEvent,
} from "../events/index.js";
import { ui } from "../ui.js";

vi.mock("../connection.js");
vi.mock("../actions/store.js");
vi.mock("../logging/index.js");
vi.mock("../manifest.js");

describe("UIController", () => {
	// Add a mock device.
	beforeAll(() => {
		deviceStore.set(
			new Device(
				"device123",
				{
					name: "Device One",
					size: {
						columns: 5,
						rows: 3,
					},
					type: DeviceType.StreamDeckXL,
				},
				true,
			),
		);
	});

	/**
	 * Asserts {@link ui.onDidAppear} is invoked when `propertyInspectorDidAppear` is emitted.
	 */
	it("receives onDidAppear", () => {
		// Arrange
		const listener = vi.fn();
		const ev = {
			action: "com.elgato.test.one",
			context: "key123", // Mocked in actionStore.
			device: "device123",
			event: "propertyInspectorDidAppear",
		} satisfies PropertyInspectorDidAppear;

		// Act (emit).
		const disposable = ui.onDidAppear(listener);
		connection.emit("propertyInspectorDidAppear", ev);

		// Assert (emit).
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidAppearEvent<Settings>]>({
			action: actionStore.getActionById(ev.context)!,
			type: "propertyInspectorDidAppear",
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
		const listener = vi.fn();
		const ev = {
			action: "com.elgato.test.one",
			context: "key123", // Mocked in actionStore.
			device: "device123",
			event: "propertyInspectorDidDisappear",
		} satisfies PropertyInspectorDidDisappear;

		// Act (emit).
		const disposable = ui.onDidDisappear(listener);
		connection.emit("propertyInspectorDidDisappear", ev);

		// Assert (emit).
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidDisappearEvent<Settings>]>({
			action: actionStore.getActionById(ev.context)!,
			type: "propertyInspectorDidDisappear",
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
	it("receives onSendToPlugin", () => {
		// Arrange
		const listener = vi.fn();
		const ev = {
			action: "com.elgato.test.one",
			context: "key123", // Mocked in actionStore.
			event: "sendToPlugin",
			payload: {
				name: "Hello world",
			},
		} satisfies DidReceivePropertyInspectorMessage<Settings>;

		// Act (emit).
		const disposable = ui.onSendToPlugin(listener);
		connection.emit("sendToPlugin", ev);

		// Assert (emit).
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[SendToPluginEvent<Settings, Settings>]>({
			action: actionStore.getActionById(ev.context)!,
			payload: {
				name: "Hello world",
			},
			type: "sendToPlugin",
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit(ev.event, ev as any);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts the UI can be sent payloads.
	 */
	it("sends sendToPropertyInspector", async () => {
		// Arrange.
		connection.emit("propertyInspectorDidAppear", {
			action: "action",
			context: "context",
			device: "device",
			event: "propertyInspectorDidAppear",
		});

		// Act.
		await ui.sendToPropertyInspector("Hello world");

		// Assert
		expect(connection.send).toHaveBeenLastCalledWith<[SendToPropertyInspector]>({
			context: "context",
			event: "sendToPropertyInspector",
			payload: "Hello world",
		});
	});

	describe("action", () => {
		beforeEach(() => {
			// Resets the event stack counter.
			const context = {
				action: "__reset__",
				context: "__reset__",
				device: "__reset__",
			};

			connection.emit("propertyInspectorDidAppear", { event: "propertyInspectorDidAppear", ...context });
			connection.emit("propertyInspectorDidDisappear", { event: "propertyInspectorDidDisappear", ...context });
		});

		/**
		 * Asserts the current action is set when the connection emits `propertyInspectorDidAppear`.
		 */
		it("sets on propertyInspectorDidAppear", () => {
			// Arrange.
			connection.emit("propertyInspectorDidAppear", {
				action: "com.elgato.test.one",
				context: "key123",
				device: "dev123",
				event: "propertyInspectorDidAppear",
			});

			// Act.
			const current = ui.action;

			// Assert.
			expect(current).toBeInstanceOf(KeyAction);
			expect(current).not.toBeUndefined();
			expect(current).toEqual(actionStore.getActionById("key123"));
		});

		/**
		 * Asserts the current action is overwritten when the connection emits `propertyInspectorDidAppear`.
		 */
		it("overwrites on propertyInspectorDidAppear", () => {
			// Arrange.
			connection.emit("propertyInspectorDidAppear", {
				action: "com.elgato.test.one",
				context: "__first__",
				device: "dev123",
				event: "propertyInspectorDidAppear",
			});

			connection.emit("propertyInspectorDidAppear", {
				action: "com.elgato.test.one",
				context: "key123",
				device: "dev123",
				event: "propertyInspectorDidAppear",
			});

			// Act.
			const action = ui.action;

			// Assert.
			expect(action).toBeInstanceOf(KeyAction);
			expect(action).not.toBeUndefined();
			expect(action).toEqual(actionStore.getActionById("key123"));
		});

		/**
		 * Asserts the current action is unset when the connection emits `propertyInspectorDidDisappear`
		 * for the current UI.
		 */
		it("clears matching PI", () => {
			// Arrange.
			const action = actionStore.getActionById("key123")!;
			const context = {
				action: action.manifestId,
				context: action.id,
				device: action.device.id,
			};

			connection.emit("propertyInspectorDidAppear", {
				...context,
				event: "propertyInspectorDidAppear",
			});

			expect(ui.action).not.toBeUndefined();
			connection.emit("propertyInspectorDidDisappear", {
				...context,
				event: "propertyInspectorDidDisappear",
			});

			// Act, assert.
			expect(ui.action).toBeUndefined();
		});

		/**
		 * Asserts the current action is not cleared when the connection emits `propertyInspectorDidDisappear`
		 * when the stack count is greater than zero.
		 */
		it("does not clear matching PI with debounce", () => {
			// Arrange.
			const action = actionStore.getActionById("key123")!;
			const context = {
				action: action.manifestId,
				context: action.id,
				device: action.device.id,
			};

			connection.emit("propertyInspectorDidAppear", {
				...context,
				event: "propertyInspectorDidAppear",
			});

			// Show twice (mock event race)
			connection.emit("propertyInspectorDidAppear", {
				...context,
				event: "propertyInspectorDidAppear",
			});

			expect(ui.action).not.toBeUndefined();
			connection.emit("propertyInspectorDidDisappear", {
				...context,
				event: "propertyInspectorDidDisappear",
			});

			// Act, assert.
			expect(ui.action).not.toBeUndefined();

			// Act, assert.
			connection.emit("propertyInspectorDidDisappear", {
				...context,
				event: "propertyInspectorDidDisappear",
			});
			expect(ui.action).toBeUndefined();
		});

		/**
		 * Asserts the current action is not cleared when the connection emits `propertyInspectorDidDisappear`
		 * for a UI that is not the current.
		 */
		it("does not clear non-matching PI", () => {
			// Arrange.
			connection.emit("propertyInspectorDidAppear", {
				action: "com.elgato.test.one",
				context: "key123",
				device: "dev123",
				event: "propertyInspectorDidAppear",
			});

			expect(ui.action).not.toBeUndefined();
			connection.emit("propertyInspectorDidDisappear", {
				action: "com.elgato.test.one",
				context: "dial123", // Mocked in actionStore
				device: "dev123",
				event: "propertyInspectorDidDisappear",
			});

			// Act, assert.
			expect(ui.action).not.toBeUndefined();
		});
	});
});
