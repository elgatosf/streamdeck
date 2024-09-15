import type { WillAppear } from "../../api";
import { Enumerable } from "../../common/enumerable";
import type { JsonObject } from "../../common/json";
import { connection } from "../connection";
import type { DeviceCollection } from "../devices";
import { type ActionContext } from "./action";
import { DialAction } from "./dial";
import { KeyAction } from "./key";
import { MultiActionKey } from "./multi";

const __actions = new Map<string, DialAction | KeyAction | MultiActionKey>();
let __devices: DeviceCollection | undefined;

// Adds the action to the store.
connection.prependListener("willAppear", (ev) => {
	if (__devices === undefined) {
		throw new Error("Action store has not been initialized");
	}

	const context: ActionContext = {
		device: __devices.getDeviceById(ev.device)!,
		id: ev.context,
		manifestId: ev.action
	};

	__actions.set(ev.context, create(ev, context));
});

// Remove the action from the store.
connection.prependListener("willDisappear", (ev) => __actions.delete(ev.context));

/**
 * Creates a new action from the event information, using the context.
 * @param ev Source appearance event.
 * @param context Context of the action.
 * @returns The new action.
 */
function create(ev: WillAppear<JsonObject>, context: ActionContext): DialAction | KeyAction | MultiActionKey {
	// Dial.
	if (ev.payload.controller === "Encoder") {
		return new DialAction({
			...context,
			coordinates: Object.freeze(ev.payload.coordinates)
		});
	}

	// Multi-action key
	if (ev.payload.isInMultiAction) {
		return new MultiActionKey(context);
	}

	// Key action.
	return new KeyAction({
		...context,
		coordinates: Object.freeze(ev.payload.coordinates)
	});
}

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
export class ActionStore extends Enumerable<DialAction | KeyAction | MultiActionKey> {
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
	public getActionById(id: string): DialAction | KeyAction | MultiActionKey | undefined {
		return __actions.get(id);
	}
}

/**
 * Action store containing visible actions.
 */
export const actionStore = new ActionStore();
