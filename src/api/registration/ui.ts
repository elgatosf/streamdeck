import type { ActionIdentifier, Coordinates, DeviceIdentifier } from "../events";

/**
 * Connects to the Stream Deck, enabling the UI to interact with the plugin, and access the Stream Deck API.
 * @param port Port to be used when connecting to Stream Deck.
 * @param uuid Identifies the UI; this must be provided when establishing the connection with Stream Deck.
 * @param event Name of the event that identifies the registration procedure; this must be provided when establishing the connection with Stream Deck.
 * @param info Information about the Stream Deck application and operating system.
 * @param actionInfo Information about the action the UI is associated with.
 */
export type ConnectElgatoStreamDeckSocketFn = (port: string, uuid: string, event: string, info: string, actionInfo: string) => Promise<void> | void;

/**
 * Information about the action associated with the UI.
 */
export type ActionInfo<T = unknown> = ActionIdentifier &
	DeviceIdentifier & {
		/**
		 * Additional information about the action and event that occurred.
		 */
		readonly payload: {
			/**
			 * Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
			 * or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
			 *
			 * NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.
			 */
			readonly controller: T;

			/**
			 * Coordinates that identify the location of an action.
			 */
			readonly coordinates: Coordinates;

			/**
			 * Settings associated with the action instance.
			 */
			settings: T;
		};
	};
