import { onDialDown, onDialRotate, onDialUp, onKeyDown, onKeyUp, onTitleParametersDidChange, onTouchTap, onWillAppear, onWillDisappear, registerAction } from "..";
import {
	DeviceType,
	type DialAction,
	type DialDownEvent,
	type DialRotateEvent,
	type DialUpEvent,
	type DidReceiveSettingsEvent,
	type KeyAction,
	type KeyDownEvent,
	type KeyUpEvent,
	type PropertyInspectorDidAppearEvent,
	type PropertyInspectorDidDisappearEvent,
	type SendToPluginEvent,
	type SingletonAction,
	type TitleParametersDidChangeEvent,
	type TouchTapEvent,
	type WillAppearEvent,
	type WillDisappearEvent
} from "../..";
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
	WillDisappear
} from "../../../api";
import { Settings } from "../../../api/__mocks__/events";
import { connection } from "../../connection";
import { devices } from "../../devices";
import { Device } from "../../devices/device";
import { getManifest } from "../../manifest";
import type { onDidReceiveSettings } from "../../settings";
import type { UIController } from "../../ui";
import { actionStore } from "../store";

jest.mock("../store");
jest.mock("../../devices");
jest.mock("../../connection");
jest.mock("../../logging");
jest.mock("../../manifest");

describe("actions", () => {
	const device = new Device(
		"device123",
		{
			name: "Device 1",
			size: {
				columns: 5,
				rows: 3
			},
			type: DeviceType.StreamDeck
		},
		false
	);

	beforeAll(() => {
		jest.spyOn(devices, "getDeviceById").mockReturnValue(device);
	});

	describe("event emitters", () => {
		/**
		 * Asserts {@link onDialDown} is invoked when `dialDown` is emitted.
		 */
		it("receives onDialDown", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: "com.elgato.test.one",
				context: "dial123", // Mocked in actionStore
				device: "device123",
				event: "dialDown",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0
					},
					settings: {
						name: "Hello world"
					}
				}
			} satisfies DialDown<Settings>;

			// Act (emit).
			const disposable = onDialDown(listener);
			connection.emit("dialDown", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialDownEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "dialDown"
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link onDialRotate} is invoked when `dialRotate` is emitted.
		 */
		it("receives onDialRotate", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: "com.elgato.test.one",
				context: "dial123", // Mocked in actionStore
				device: "device123",
				event: "dialRotate",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0
					},
					pressed: false,
					settings: {
						name: "Hello world"
					},
					ticks: 1
				}
			} satisfies DialRotate<Settings>;

			// Act (emit).
			const disposable = onDialRotate(listener);
			connection.emit("dialRotate", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialRotateEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "dialRotate"
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link onDialUp} is invoked when `dialUp` is emitted.
		 */
		it("receives onDialUp", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: "com.elgato.test.one",
				context: "dial123", // Mocked in actionStore
				device: "device123",
				event: "dialUp",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0
					},
					settings: {
						name: "Hello world"
					}
				}
			} satisfies DialUp<Settings>;

			// Act (emit).
			const disposable = onDialUp(listener);
			connection.emit("dialUp", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialUpEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "dialUp"
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link onKeyDown} is invoked when `keyDown` is emitted.
		 */
		it("receives onKeyDown", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: "com.elgato.test.one",
				context: "key123", // Mocked in actionStore
				device: "device123",
				event: "keyDown",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 2,
						row: 0
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world"
					}
				}
			} satisfies KeyDown<Settings>;

			// Act (emit).
			const disposable = onKeyDown(listener);
			connection.emit("keyDown", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[KeyDownEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "keyDown"
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link onKeyUp} is invoked when `keyUp` is emitted.
		 */
		it("receives onKeyUp", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: "com.elgato.test.one",
				context: "key123", // Mocked in actionStore
				device: "device123",
				event: "keyUp",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 2,
						row: 0
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world"
					}
				}
			} satisfies KeyUp<Settings>;

			// Act (emit).
			const disposable = onKeyUp(listener);
			connection.emit("keyUp", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[KeyUpEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "keyUp"
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link onTitleParametersDidChange} is invoked when `titleParametersDidChange` is emitted.
		 */
		it("receives onTitleParametersDidChange", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: "com.elgato.test.one",
				context: "key123", // Mocked in actionStore
				device: "device123",
				event: "titleParametersDidChange",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 2,
						row: 0
					},
					settings: {
						name: "Hello world"
					},
					title: "Title goes here...",
					titleParameters: {
						fontFamily: "Arial",
						fontSize: 13,
						fontStyle: "Bold",
						fontUnderline: false,
						showTitle: true,
						titleAlignment: "bottom",
						titleColor: "white"
					}
				}
			} satisfies TitleParametersDidChange<Settings>;

			// Act (emit).
			const disposable = onTitleParametersDidChange(listener);
			connection.emit("titleParametersDidChange", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[TitleParametersDidChangeEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "titleParametersDidChange"
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link onTouchTap} is invoked when `touchTap` is emitted.
		 */
		it("receives onTouchTap", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: "com.elgato.test.one",
				context: "dial123", // Mocked in actionStore
				device: "device123",
				event: "touchTap",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0
					},
					settings: {
						name: "Hello world"
					},
					hold: false,
					tapPos: [13, 13]
				}
			} satisfies TouchTap<Settings>;

			// Act (emit).
			const disposable = onTouchTap(listener);
			connection.emit("touchTap", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[TouchTapEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "touchTap"
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link onWillAppear} is invoked when `willAppear` is emitted.
		 */
		it("receives onWillAppear", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: "com.elgato.test.one",
				context: "key123", // Mocked in actionStore.
				device: "device123",
				event: "willAppear",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world"
					}
				}
			} satisfies WillAppear<Settings>;

			// Act (emit).
			const disposable = onWillAppear(listener);
			connection.emit("willAppear", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[WillAppearEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "willAppear"
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link onWillDisappear} is invoked when `willDisappear` is emitted.
		 */
		it("receives onWillDisappear", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: "com.elgato.test.one",
				context: "context123",
				device: "device123",
				event: "willDisappear",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world"
					}
				}
			} satisfies WillDisappear<Settings>;

			// Act (emit).
			const disposable = onWillDisappear(listener);
			connection.emit("willDisappear", ev);
			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[WillDisappearEvent<Settings>]>({
				action: {
					device,
					id: ev.context,
					manifestId: ev.action
				},
				deviceId: ev.device,
				payload: ev.payload,
				type: "willDisappear"
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});
	});

	describe("registering an action", () => {
		const manifestId = getManifest().Actions[0].UUID;
		// 	afterEach(() => jest.clearAllMocks());
		/**
		 * Asserts {@link registerAction} validates the manifest identifier is not undefined.
		 */
		it("validates the manifestId is not undefined", () => {
			// Arrange.
			const action: SingletonAction = {
				manifestId: undefined
			};

			// Act, assert.
			expect(() => registerAction(action)).toThrow("The action's manifestId cannot be undefined.");
		});

		/**
		 * Asserts {@link registerAction} validates the manifest identifier exists within the manifest.
		 */
		it("validates when action does not exist in manifest", () => {
			// Arrange.
			const action: SingletonAction = {
				manifestId: "com.elgato.action-service.__one"
			};

			// Act, assert.
			expect(() => registerAction(action)).toThrow("com.elgato.action-service.__one");
		});

		/**
		 * Asserts {@link registerAction} ignores undefined handlers.
		 */
		it("ignore undefined handlers", () => {
			// Arrange.
			const spyOnAddListener = jest.spyOn(connection, "addListener");
			const spyOnDisposableOn = jest.spyOn(connection, "disposableOn");
			const spyOnOn = jest.spyOn(connection, "on");
			const spyOnOnce = jest.spyOn(connection, "once");
			const spyOnPrependListener = jest.spyOn(connection, "prependListener");
			const spyOnPrependOnceListener = jest.spyOn(connection, "prependOnceListener");

			// Act.
			registerAction({ manifestId });

			// Assert.
			expect(spyOnAddListener).not.toHaveBeenCalled();
			expect(spyOnDisposableOn).not.toHaveBeenCalled();
			expect(spyOnOn).not.toHaveBeenCalled();
			expect(spyOnOnce).not.toHaveBeenCalled();
			expect(spyOnPrependListener).not.toHaveBeenCalled();
			expect(spyOnPrependOnceListener).not.toHaveBeenCalled();
		});

		/**
		 * Asserts {@link onDialDown} is routed to the action when `dialDown` is emitted.
		 */
		it("routes onDialDown", () => {
			// Arrange.
			const listener = jest.fn().mockImplementation(() => console.log("Hello from the other side"));
			const ev = {
				action: manifestId,
				context: "dial123", // Mocked in actionStore.
				device: "device123",
				event: "dialDown",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0
					},
					settings: {
						name: "Hello world"
					}
				}
			} satisfies DialDown<Settings>;

			// Act.
			registerAction({
				manifestId,
				onDialDown: listener
			});

			console.log("Foo");
			connection.emit("dialDown", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialDownEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "dialDown"
			});
		});

		/**
		 * Asserts {@link onDialRotate} is routed to the action when `dialRotate` is emitted.
		 */
		it("routes onDialRotate", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: manifestId,
				context: "dial123", // Mocked in actionStore
				device: "device123",
				event: "dialRotate",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0
					},
					pressed: false,
					settings: {
						name: "Hello world"
					},
					ticks: 1
				}
			} satisfies DialRotate<Settings>;

			// Act.
			registerAction({
				manifestId,
				onDialRotate: listener
			});

			connection.emit("dialRotate", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialRotateEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "dialRotate"
			});
		});

		/**
		 * Asserts {@link onDialUp} is routed to the action when `dialUp` is emitted.
		 */
		it("routes onDialUp", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: manifestId,
				context: "dial123", // Mocked in actionStore
				device: "device123",
				event: "dialUp",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0
					},
					settings: {
						name: "Hello world"
					}
				}
			} satisfies DialUp<Settings>;

			// Act.
			registerAction({
				manifestId,
				onDialUp: listener
			});

			connection.emit("dialUp", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DialUpEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "dialUp"
			});
		});

		/**
		 * Asserts {@link UIController.sendToPlugin} is routed to the action when `sendToPlugin` is emitted.
		 */
		it("routes sendToPlugin", () => {
			// Arrange
			const listener = jest.fn();
			const ev = {
				action: manifestId,
				context: "key123", // Mocked in actionStore
				event: "sendToPlugin",
				payload: {
					name: "Hello world"
				}
			} satisfies DidReceivePropertyInspectorMessage<Settings>;

			// Act.
			registerAction({
				manifestId,
				onSendToPlugin: listener
			});

			connection.emit("sendToPlugin", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[SendToPluginEvent<Settings, Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				payload: {
					name: "Hello world"
				},
				type: "sendToPlugin"
			});
		});

		/**
		 * Asserts {@link onDidReceiveSettings} is routed to the action when `didReceiveGlobalSettings` is emitted.
		 */
		it("routes onDidReceiveGlobalSettings", () => {
			// Arrange
			const listener = jest.fn();
			const ev = {
				action: manifestId,
				context: "key123", // Mocked in actionStore
				device: "device123",
				event: "didReceiveSettings",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world"
					}
				}
			} satisfies DidReceiveSettings<Settings>;

			// Act.
			registerAction({
				manifestId,
				onDidReceiveSettings: listener
			});

			connection.emit("didReceiveSettings", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DidReceiveSettingsEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "didReceiveSettings"
			});
		});

		/**
		 * Asserts {@link onKeyDown} is routed to the action when `keyDown` is emitted.
		 */
		it("routes onKeyDown", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: manifestId,
				context: "key123", // Mocked in actionStore
				device: "device123",
				event: "keyDown",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 2,
						row: 0
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world"
					}
				}
			} satisfies KeyDown<Settings>;

			// Act.
			registerAction({
				manifestId,
				onKeyDown: listener
			});

			connection.emit("keyDown", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[KeyDownEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "keyDown"
			});
		});

		/**
		 * Asserts {@link onKeyUp} is routed to the action when `keyUp` is emitted.
		 */
		it("routes onKeyUp", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: manifestId,
				context: "key123", // Mocked in actionStore
				device: "device123",
				event: "keyUp",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 2,
						row: 0
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world"
					}
				}
			} satisfies KeyUp<Settings>;

			// Act.
			registerAction({
				manifestId,
				onKeyUp: listener
			});

			connection.emit("keyUp", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[KeyUpEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "keyUp"
			});
		});

		/**
		 * Asserts {@link UIController.onPropertyInspectorDidAppear} is routed to the action when `propertyInspectorDidAppear` is emitted.
		 */
		it("routes onPropertyInspectorDidAppear", () => {
			// Arrange
			const listener = jest.fn();
			const ev = {
				action: manifestId,
				context: "key123", // Mocked in actionStore
				device: "device123",
				event: "propertyInspectorDidAppear"
			} satisfies PropertyInspectorDidAppear;

			// Act.
			registerAction({
				manifestId,
				onPropertyInspectorDidAppear: listener
			});

			connection.emit("propertyInspectorDidAppear", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidAppearEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				deviceId: ev.device,
				type: "propertyInspectorDidAppear"
			});
		});

		/**
		 * Asserts {@link UIController.onPropertyInspectorDidDisappear} is routed to the action when `propertyInspectorDidDisappear` is emitted.
		 */
		it("routes onPropertyInspectorDidDisappear", () => {
			// Arrange
			const listener = jest.fn();
			const ev = {
				action: manifestId,
				context: "key123", // Mocked in actionStore
				device: "device123",
				event: "propertyInspectorDidDisappear"
			} satisfies PropertyInspectorDidDisappear;

			// Act (emit).
			registerAction({
				manifestId,
				onPropertyInspectorDidDisappear: listener
			});

			connection.emit("propertyInspectorDidDisappear", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidDisappearEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				deviceId: ev.device,
				type: "propertyInspectorDidDisappear"
			});
		});

		/**
		 * Asserts {@link onTitleParametersDidChange} is routed to the action when `titleParametersDidChange` is emitted.
		 */
		it("routes onTitleParametersDidChange", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: manifestId,
				context: "key123", // Mocked in actionStore
				device: "device123",
				event: "titleParametersDidChange",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 2,
						row: 0
					},
					settings: {
						name: "Hello world"
					},
					title: "Title goes here...",
					titleParameters: {
						fontFamily: "Arial",
						fontSize: 13,
						fontStyle: "Bold",
						fontUnderline: false,
						showTitle: true,
						titleAlignment: "bottom",
						titleColor: "white"
					}
				}
			} satisfies TitleParametersDidChange<Settings>;

			// Act.
			registerAction({
				manifestId,
				onTitleParametersDidChange: listener
			});

			connection.emit("titleParametersDidChange", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[TitleParametersDidChangeEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "titleParametersDidChange"
			});
		});

		/**
		 * Asserts {@link onTouchTap} is routed to the action when `touchTap` is emitted.
		 */
		it("routes onTouchTap", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: manifestId,
				context: "dial123", // Mocked in actionStore
				device: "device123",
				event: "touchTap",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0
					},
					settings: {
						name: "Hello world"
					},
					hold: false,
					tapPos: [13, 13]
				}
			} satisfies TouchTap<Settings>;

			// Act.
			registerAction({
				manifestId,
				onTouchTap: listener
			});

			connection.emit("touchTap", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[TouchTapEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as DialAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "touchTap"
			});
		});

		/**
		 * Asserts {@link onWillAppear} is routed to the action when `willAppear` is emitted.
		 */
		it("routes onWillAppear", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: manifestId,
				context: "key123", // Mocked in actionStore
				device: "device123",
				event: "willAppear",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world"
					}
				}
			} satisfies WillAppear<Settings>;

			// Act.
			registerAction({
				manifestId,
				onWillAppear: listener
			});

			connection.emit("willAppear", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[WillAppearEvent<Settings>]>({
				action: actionStore.getActionById(ev.context) as KeyAction,
				deviceId: ev.device,
				payload: ev.payload,
				type: "willAppear"
			});
		});

		/**
		 * Asserts {@link onWillDisappear} is routed to the action when `willDisappear` is emitted.
		 */
		it("routes onWillDisappear", () => {
			// Arrange.
			const listener = jest.fn();
			const ev = {
				action: manifestId,
				context: "key123", // Mocked in actionStore
				device: "device123",
				event: "willDisappear",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 2,
						row: 0
					},
					isInMultiAction: false,
					settings: {
						name: "Hello world"
					}
				}
			} satisfies WillDisappear<Settings>;

			// Act.
			registerAction({
				manifestId,
				onWillDisappear: listener
			});

			connection.emit("willDisappear", ev);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[WillDisappearEvent<Settings>]>({
				action: {
					device,
					id: ev.context,
					manifestId: ev.action
				},
				deviceId: ev.device,
				payload: ev.payload,
				type: "willDisappear"
			});
		});
	});
});
