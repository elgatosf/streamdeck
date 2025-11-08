import { describe, expect, it, vi } from "vitest";

import type {
	DialDown,
	DialRotate,
	DialUp,
	DidReceivePropertyInspectorMessage,
	DidReceiveSettings,
	KeyDown,
	KeyUp,
	PropertyInspectorDidAppear,
	PropertyInspectorDidDisappear,
	TitleParametersDidChange,
	TouchTap,
	WillAppear,
	WillDisappear,
} from "../../../api";
import { Settings } from "../../../api/__mocks__/events";
import type { Enumerable } from "../../../common/enumerable";
import { JsonObject } from "../../../common/json";
import { connection } from "../../connection";
import {
	type DialDownEvent,
	type DialRotateEvent,
	type DialUpEvent,
	type DidReceiveSettingsEvent,
	type KeyDownEvent,
	type KeyUpEvent,
	type PropertyInspectorDidAppearEvent,
	type PropertyInspectorDidDisappearEvent,
	type SendToPluginEvent,
	type TitleParametersDidChangeEvent,
	type TouchTapEvent,
	type WillAppearEvent,
	type WillDisappearEvent,
} from "../../events";
import type { UIController } from "../../ui";
import { ActionContext } from "../context";
import { DialAction } from "../dial";
import { KeyAction } from "../key";
import { actionService, type ActionService } from "../service";
import { SingletonAction } from "../singleton-action";
import { actionStore } from "../store";

vi.mock("../store");
vi.mock("../../devices/store");
vi.mock("../../connection");
vi.mock("../../logging");
vi.mock("../../manifest");

describe("actions", () => {
	describe("event emitters", () => {
		/**
		 * Asserts {@link ActionService.onDialDown} is invoked when `dialDown` is emitted.
		 */
		it("receives onDialDown", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: "com.elgato.test.dial",
				context: "dial123",
				device: "device123",
				event: "dialDown",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0,
					},
					settings: {
						name: "Hello world",
					},
				},
			} satisfies DialDown<Settings>;

			// Act (emit).
			const disposable = actionService.onDialDown(listener);
			connection.emit("dialDown", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialDownEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				payload: ev.payload,
				type: "dialDown",
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionService.onDialRotate} is invoked when `dialRotate` is emitted.
		 */
		it("receives onDialRotate", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: "com.elgato.test.dial",
				context: "dial123",
				device: "device123",
				event: "dialRotate",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0,
					},
					pressed: false,
					settings: {
						name: "Hello world",
					},
					ticks: 1,
				},
			} satisfies DialRotate<Settings>;

			// Act (emit).
			const disposable = actionService.onDialRotate(listener);
			connection.emit("dialRotate", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialRotateEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				payload: ev.payload,
				type: "dialRotate",
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionService.onDialUp} is invoked when `dialUp` is emitted.
		 */
		it("receives onDialUp", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: "com.elgato.test.dial",
				context: "dial123",
				device: "device123",
				event: "dialUp",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0,
					},
					settings: {
						name: "Hello world",
					},
				},
			} satisfies DialUp<Settings>;

			// Act (emit).
			const disposable = actionService.onDialUp(listener);
			connection.emit("dialUp", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialUpEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				payload: ev.payload,
				type: "dialUp",
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionService.onKeyDown} is invoked when `keyDown` is emitted.
		 */
		it("receives onKeyDown", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: "com.elgato.test.key",
				context: "key123",
				device: "device123",
				event: "keyDown",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 2,
						row: 0,
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world",
					},
				},
			} satisfies KeyDown<Settings>;

			// Act (emit).
			const disposable = actionService.onKeyDown(listener);
			connection.emit("keyDown", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[KeyDownEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				payload: ev.payload,
				type: "keyDown",
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionService.onKeyUp} is invoked when `keyUp` is emitted.
		 */
		it("receives onKeyUp", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: "com.elgato.test.key",
				context: "key123",
				device: "device123",
				event: "keyUp",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 2,
						row: 0,
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world",
					},
				},
			} satisfies KeyUp<Settings>;

			// Act (emit).
			const disposable = actionService.onKeyUp(listener);
			connection.emit("keyUp", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[KeyUpEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				payload: ev.payload,
				type: "keyUp",
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionService.onTitleParametersDidChange} is invoked when `titleParametersDidChange` is emitted.
		 */
		it("receives onTitleParametersDidChange", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: "com.elgato.test.key",
				context: "key123",
				device: "device123",
				event: "titleParametersDidChange",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 2,
						row: 0,
					},
					settings: {
						name: "Hello world",
					},
					title: "Title goes here...",
					titleParameters: {
						fontFamily: "Arial",
						fontSize: 13,
						fontStyle: "Bold",
						fontUnderline: false,
						showTitle: true,
						titleAlignment: "bottom",
						titleColor: "white",
					},
				},
			} satisfies TitleParametersDidChange<Settings>;

			// Act (emit).
			const disposable = actionService.onTitleParametersDidChange(listener);
			connection.emit("titleParametersDidChange", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[TitleParametersDidChangeEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				payload: ev.payload,
				type: "titleParametersDidChange",
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionService.onTouchTap} is invoked when `touchTap` is emitted.
		 */
		it("receives onTouchTap", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: "com.elgato.test.dial",
				context: "dial123",
				device: "device123",
				event: "touchTap",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0,
					},
					settings: {
						name: "Hello world",
					},
					hold: false,
					tapPos: [13, 13],
				},
			} satisfies TouchTap<Settings>;

			// Act (emit).
			const disposable = actionService.onTouchTap(listener);
			connection.emit("touchTap", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[TouchTapEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				payload: ev.payload,
				type: "touchTap",
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionService.onWillAppear} is invoked when `willAppear` is emitted.
		 */
		it("receives onWillAppear", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: "com.elgato.test.key",
				context: "key123",
				device: "device123",
				event: "willAppear",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0,
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world",
					},
				},
			} satisfies WillAppear<Settings>;

			// Act (emit).
			const disposable = actionService.onWillAppear(listener);
			connection.emit("willAppear", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[WillAppearEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				payload: ev.payload,
				type: "willAppear",
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link ActionService.onWillDisappear} is invoked when `willDisappear` is emitted.
		 */
		it("receives onWillDisappear", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: "com.elgato.test.key",
				context: "context123",
				device: "device123",
				event: "willDisappear",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0,
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world",
					},
				},
			} satisfies WillDisappear<Settings>;

			// Act (emit).
			const disposable = actionService.onWillDisappear(listener);
			connection.emit("willDisappear", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[WillDisappearEvent<Settings>]>({
				action: new ActionContext(ev),
				payload: ev.payload,
				type: "willDisappear",
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});
	});

	describe("registering an action", () => {
		const keyManifestId = "com.elgato.test.key";
		const dialManifestId = "com.elgato.test.dial";
		const actions = vi.fn() as unknown as Enumerable<DialAction<JsonObject> | KeyAction<JsonObject>>;

		/**
		 * Asserts {@link ActionService.registerAction} validates the manifest identifier is not undefined.
		 */
		it("validates the manifestId is not undefined", () => {
			// Arrange.
			const action: SingletonAction = {
				manifestId: undefined,
				actions,
			};

			// Act, assert.
			expect(() => actionService.registerAction(action)).toThrow("The action's manifestId cannot be undefined.");
		});

		/**
		 * Asserts {@link ActionService.registerAction} validates the manifest identifier exists within the manifest.
		 */
		it("validates when action does not exist in manifest", () => {
			// Arrange.
			const action: SingletonAction = {
				actions,
				manifestId: "com.elgato.action-service.__one",
			};

			// Act, assert.
			expect(() => actionService.registerAction(action)).toThrow("com.elgato.action-service.__one");
		});

		/**
		 * Asserts {@link ActionService.registerAction} ignores undefined handlers.
		 */
		it("ignore undefined handlers", () => {
			// Arrange.
			const spyOnAddListener = vi.spyOn(connection, "addListener");
			const spyOnDisposableOn = vi.spyOn(connection, "disposableOn");
			const spyOnOn = vi.spyOn(connection, "on");
			const spyOnOnce = vi.spyOn(connection, "once");
			const spyOnPrependListener = vi.spyOn(connection, "prependListener");
			const spyOnPrependOnceListener = vi.spyOn(connection, "prependOnceListener");

			// Act.
			actionService.registerAction({
				actions,
				manifestId: keyManifestId,
			});

			// Assert.
			expect(spyOnAddListener).not.toHaveBeenCalled();
			expect(spyOnDisposableOn).not.toHaveBeenCalled();
			expect(spyOnOn).not.toHaveBeenCalled();
			expect(spyOnOnce).not.toHaveBeenCalled();
			expect(spyOnPrependListener).not.toHaveBeenCalled();
			expect(spyOnPrependOnceListener).not.toHaveBeenCalled();
		});

		/**
		 * Asserts {@link ActionService.onDialDown} is routed to the action when `dialDown` is emitted.
		 */
		it("routes onDialDown", () => {
			// Arrange.
			const listener = vi.fn();

			const ev = {
				action: dialManifestId,
				context: "dial123",
				device: "device123",
				event: "dialDown",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0,
					},
					settings: {
						name: "Hello world",
					},
				},
			} satisfies DialDown<Settings>;

			// Act.
			actionService.registerAction({
				actions,
				manifestId: ev.action,
				onDialDown: listener,
			});

			connection.emit("dialDown", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialDownEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				payload: ev.payload,
				type: "dialDown",
			});
		});

		/**
		 * Asserts {@link ActionService.onDialRotate} is routed to the action when `dialRotate` is emitted.
		 */
		it("routes onDialRotate", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: dialManifestId,
				context: "dial123",
				device: "device123",
				event: "dialRotate",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0,
					},
					pressed: false,
					settings: {
						name: "Hello world",
					},
					ticks: 1,
				},
			} satisfies DialRotate<Settings>;

			// Act.
			actionService.registerAction({
				actions,
				manifestId: ev.action,
				onDialRotate: listener,
			});

			connection.emit("dialRotate", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialRotateEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				payload: ev.payload,
				type: "dialRotate",
			});
		});

		/**
		 * Asserts {@link ActionService.onDialUp} is routed to the action when `dialUp` is emitted.
		 */
		it("routes onDialUp", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: dialManifestId,
				context: "dial123",
				device: "device123",
				event: "dialUp",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0,
					},
					settings: {
						name: "Hello world",
					},
				},
			} satisfies DialUp<Settings>;

			// Act.
			actionService.registerAction({
				actions,
				manifestId: ev.action,
				onDialUp: listener,
			});

			connection.emit("dialUp", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialUpEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				payload: ev.payload,
				type: "dialUp",
			});
		});

		/**
		 * Asserts {@link UIController.sendToPlugin} is routed to the action when `sendToPlugin` is emitted.
		 */
		it("routes sendToPlugin", () => {
			// Arrange
			const listener = vi.fn();
			const ev = {
				action: keyManifestId,
				context: "key123",
				event: "sendToPlugin",
				payload: {
					name: "Hello world",
				},
			} satisfies DidReceivePropertyInspectorMessage<Settings>;

			// Act.
			actionService.registerAction({
				actions,
				manifestId: ev.action,
				onSendToPlugin: listener,
			});

			connection.emit("sendToPlugin", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[SendToPluginEvent<Settings, Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				payload: {
					name: "Hello world",
				},
				type: "sendToPlugin",
			});
		});

		/**
		 * Asserts {@link ActionService.onDidReceiveSettings} is routed to the action when `didReceiveGlobalSettings` is emitted.
		 */
		it("routes onDidReceiveGlobalSettings", () => {
			// Arrange
			const listener = vi.fn();
			const ev = {
				action: keyManifestId,
				context: "key123",
				device: "device123",
				event: "didReceiveSettings",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0,
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world",
					},
				},
			} satisfies DidReceiveSettings<Settings>;

			// Act.
			actionService.registerAction({
				actions,
				manifestId: ev.action,
				onDidReceiveSettings: listener,
			});

			connection.emit("didReceiveSettings", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DidReceiveSettingsEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				payload: ev.payload,
				type: "didReceiveSettings",
			});
		});

		/**
		 * Asserts {@link ActionService.onKeyDown} is routed to the action when `keyDown` is emitted.
		 */
		it("routes onKeyDown", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: keyManifestId,
				context: "key123",
				device: "device123",
				event: "keyDown",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 2,
						row: 0,
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world",
					},
				},
			} satisfies KeyDown<Settings>;

			// Act.
			actionService.registerAction({
				actions,
				manifestId: ev.action,
				onKeyDown: listener,
			});

			connection.emit("keyDown", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[KeyDownEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				payload: ev.payload,
				type: "keyDown",
			});
		});

		/**
		 * Asserts {@link ActionService.onKeyUp} is routed to the action when `keyUp` is emitted.
		 */
		it("routes onKeyUp", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: keyManifestId,
				context: "key123",
				device: "device123",
				event: "keyUp",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 2,
						row: 0,
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world",
					},
				},
			} satisfies KeyUp<Settings>;

			// Act.
			actionService.registerAction({
				actions,
				manifestId: ev.action,
				onKeyUp: listener,
			});

			connection.emit("keyUp", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[KeyUpEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				payload: ev.payload,
				type: "keyUp",
			});
		});

		/**
		 * Asserts {@link UIController.onPropertyInspectorDidAppear} is routed to the action when `propertyInspectorDidAppear` is emitted.
		 */
		it("routes onPropertyInspectorDidAppear", () => {
			// Arrange
			const listener = vi.fn();
			const ev = {
				action: keyManifestId,
				context: "key123",
				device: "device123",
				event: "propertyInspectorDidAppear",
			} satisfies PropertyInspectorDidAppear;

			// Act.
			actionService.registerAction({
				actions,
				manifestId: ev.action,
				onPropertyInspectorDidAppear: listener,
			});

			connection.emit("propertyInspectorDidAppear", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidAppearEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				type: "propertyInspectorDidAppear",
			});
		});

		/**
		 * Asserts {@link UIController.onPropertyInspectorDidDisappear} is routed to the action when `propertyInspectorDidDisappear` is emitted.
		 */
		it("routes onPropertyInspectorDidDisappear", () => {
			// Arrange
			const listener = vi.fn();
			const ev = {
				action: keyManifestId,
				context: "key123",
				device: "device123",
				event: "propertyInspectorDidDisappear",
			} satisfies PropertyInspectorDidDisappear;

			// Act (emit).
			actionService.registerAction({
				actions,
				manifestId: ev.action,
				onPropertyInspectorDidDisappear: listener,
			});

			connection.emit("propertyInspectorDidDisappear", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidDisappearEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				type: "propertyInspectorDidDisappear",
			});
		});

		/**
		 * Asserts {@link ActionService.onTitleParametersDidChange} is routed to the action when `titleParametersDidChange` is emitted.
		 */
		it("routes onTitleParametersDidChange", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: keyManifestId,
				context: "key123",
				device: "device123",
				event: "titleParametersDidChange",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 2,
						row: 0,
					},
					settings: {
						name: "Hello world",
					},
					title: "Title goes here...",
					titleParameters: {
						fontFamily: "Arial",
						fontSize: 13,
						fontStyle: "Bold",
						fontUnderline: false,
						showTitle: true,
						titleAlignment: "bottom",
						titleColor: "white",
					},
				},
			} satisfies TitleParametersDidChange<Settings>;

			// Act.
			actionService.registerAction({
				actions,
				manifestId: ev.action,
				onTitleParametersDidChange: listener,
			});

			connection.emit("titleParametersDidChange", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[TitleParametersDidChangeEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				payload: ev.payload,
				type: "titleParametersDidChange",
			});
		});

		/**
		 * Asserts {@link ActionService.onTouchTap} is routed to the action when `touchTap` is emitted.
		 */
		it("routes onTouchTap", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: dialManifestId,
				context: "dial123",
				device: "device123",
				event: "touchTap",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0,
					},
					settings: {
						name: "Hello world",
					},
					hold: false,
					tapPos: [13, 13],
				},
			} satisfies TouchTap<Settings>;

			// Act.
			actionService.registerAction({
				actions,
				manifestId: ev.action,
				onTouchTap: listener,
			});

			connection.emit("touchTap", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[TouchTapEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				payload: ev.payload,
				type: "touchTap",
			});
		});

		/**
		 * Asserts {@link ActionService.onWillAppear} is routed to the action when `willAppear` is emitted.
		 */
		it("routes onWillAppear", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: keyManifestId,
				context: "key123",
				device: "device123",
				event: "willAppear",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0,
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world",
					},
				},
			} satisfies WillAppear<Settings>;

			// Act.
			actionService.registerAction({
				actions,
				manifestId: ev.action,
				onWillAppear: listener,
			});

			connection.emit("willAppear", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[WillAppearEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				payload: ev.payload,
				type: "willAppear",
			});
		});

		/**
		 * Asserts {@link ActionService.onWillDisappear} is routed to the action when `willDisappear` is emitted.
		 */
		it("routes onWillDisappear", () => {
			// Arrange.
			const listener = vi.fn();
			const ev = {
				action: keyManifestId,
				context: "key123",
				device: "device123",
				event: "willDisappear",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0,
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world",
					},
				},
			} satisfies WillDisappear<Settings>;

			// Act.
			actionService.registerAction({
				actions,
				manifestId: ev.action,
				onWillDisappear: listener,
			});

			connection.emit("willDisappear", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[WillDisappearEvent<Settings>]>({
				action: new ActionContext(ev),
				payload: ev.payload,
				type: "willDisappear",
			});
		});
	});
});
