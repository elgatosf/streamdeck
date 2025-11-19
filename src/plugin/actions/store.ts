import { Enumerable } from "../../common/enumerable.js";
import type { DialAction } from "./dial.js";
import type { KeyAction } from "./key.js";

const __items = new Map<string, DialAction | KeyAction>();

/**
 * Provides a read-only store of Stream Deck devices.
 */
export class ReadOnlyActionStore extends Enumerable<DialAction | KeyAction> {
	/**
	 * Initializes a new instance of the {@link ReadOnlyActionStore}.
	 */
	constructor() {
		super(__items);
	}

	/**
	 * Gets the action with the specified identifier.
	 * @param id Identifier of action to search for.
	 * @returns The action, when present; otherwise `undefined`.
	 */
	public getActionById(id: string): DialAction | KeyAction | undefined {
		return __items.get(id);
	}
}

/**
 * Provides a store of Stream Deck actions.
 */
class ActionStore extends ReadOnlyActionStore {
	/**
	 * Deletes the action from the store.
	 * @param id The action's identifier.
	 */
	public delete(id: string): void {
		__items.delete(id);
	}

	/**
	 * Adds the action to the store.
	 * @param action The action.
	 */
	public set(action: DialAction | KeyAction): void {
		__items.set(action.id, action);
	}
}

/**
 * Singleton instance of the action store.
 */
export const actionStore = new ActionStore();
