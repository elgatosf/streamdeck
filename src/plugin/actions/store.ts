import { Enumerable } from "../../common/enumerable";
import { connection } from "../connection";
import { initializeStore } from "../devices/store";
import { DialAction } from "./dial";
import { KeyAction } from "./key";

const __actions = new Map<string, DialAction | KeyAction>();

// Adds the action to the store.
connection.prependListener("willAppear", (ev) => {
	const action = ev.payload.controller === "Encoder" ? new DialAction(ev) : new KeyAction(ev);
	__actions.set(ev.context, action);
});

// Remove the action from the store.
connection.prependListener("willDisappear", (ev) => __actions.delete(ev.context));

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
 * Store of visible Stream Deck actions.
 */
export const actionStore = new ActionStore();

initializeStore(actionStore);
