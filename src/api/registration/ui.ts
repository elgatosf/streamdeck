import type { JsonObject } from "../../common/json";
import type { ActionIdentifier, DeviceIdentifier } from "../events";
import type { MultiActionPayload, SingleActionPayload } from "../events/action";

/**
 * Connects to the Stream Deck, enabling the UI to interact with the plugin, and access the Stream Deck API.
 * @param port Port to be used when connecting to Stream Deck.
 * @param uuid Identifies the UI; this must be provided when establishing the connection with Stream Deck.
 * @param event Name of the event that identifies the registration procedure; this must be provided when establishing the connection with Stream Deck.
 * @param info Information about the Stream Deck application and operating system.
 * @param actionInfo Information about the action the UI is associated with.
 */
export type ConnectElgatoStreamDeckSocketFn = (
	port: string,
	uuid: string,
	event: string,
	info: string,
	actionInfo: string,
) => Promise<void> | void;

/**
 * Information about the action associated with the UI.
 * @template TSettings Settings associated with the action.
 */
export type ActionInfo<TSettings extends JsonObject = JsonObject> = ActionIdentifier &
	DeviceIdentifier & {
		/**
		 * Additional information about the action and event that occurred.
		 */
		readonly payload: MultiActionPayload<TSettings> | SingleActionPayload<TSettings>;
	};
