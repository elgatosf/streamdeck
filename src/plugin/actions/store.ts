import type { Controller, JsonObject } from "..";
import type { WillAppear, WillDisappear } from "../../api";
import { Enumerable } from "../../common/enumerable";
import { connection } from "../connection";
import type { Device, DeviceCollection } from "../devices";
import { DialAction } from "./dial";
import { KeyAction } from "./key";

const __actions = new Map<string, DialAction | KeyAction>();
let __devices: DeviceCollection | undefined;

// Adds the action to the store.
connection.prependListener("willAppear", (ev) => {
	const context = createContext(ev);
	const action = ev.payload.controller === "Encoder" ? new DialAction(context, ev) : new KeyAction(context, ev);

	__actions.set(ev.context, action);
});

// Remove the action from the store.
connection.prependListener("willDisappear", (ev) => __actions.delete(ev.context));

/**
 * Initializes the action store, allowing for actions to be associated with devices.
 * @param devices Collection of devices.
 */
export function initializeStore(devices: DeviceCollection): void {
	if (__devices !== undefined) {
		throw new Error("Action store has already been initialized");
	}

	__devices = devices;
}

/**
 * Provides a store of visible actions.
 */
export class ActionStore extends Enumerable<DialAction | KeyAction> {
	/**
	 * Initializes a new instance of the {@link ActionStore} class.
	 */
	constructor() {
		super(__actions);
	}

	/**
	 * Gets the action with the specified identifier.
	 * @param id Identifier of action to search for.
	 * @returns The action, when present; otherwise `undefined`.
	 */
	public getActionById(id: string): DialAction | KeyAction | undefined {
		return __actions.get(id);
	}
}

/**
 * Action store containing visible actions.
 */
export const actionStore = new ActionStore();

/**
 * Provides context information for an instance of an action.
 */
export type ActionContext = {
	/**
	 * Type of the action.
	 * - `Keypad` is a key.
	 * - `Encoder` is a dial and portion of the touch strip.
	 *
	 * @returns Controller type.
	 */
	get controller(): Controller;

	/**
	 * Stream Deck device the action is positioned on.
	 * @returns Stream Deck device.
	 */
	get device(): Device;

	/**
	 * Action instance identifier.
	 * @returns Identifier.
	 */
	get id(): string;

	/**
	 * Manifest identifier (UUID) for this action type.
	 * @returns Manifest identifier.
	 */
	get manifestId(): string;
};

/**
 * Creates a new {@link ActionContext} from the specified source event.
 * @param source Event source of the action.
 * @returns The action context.
 */
export function createContext(source: WillAppear<JsonObject> | WillDisappear<JsonObject>): ActionContext {
	if (__devices === undefined) {
		throw new Error("Action store must be initialized before creating an action's context");
	}

	return {
		controller: source.payload.controller,
		device: __devices.getDeviceById(source.device)!,
		id: source.context,
		manifestId: source.action
	};
}
