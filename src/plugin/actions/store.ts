import { Enumerable } from "../../common/enumerable";
import type { DialAction } from "./dial";
import type { KeyAction } from "./key";

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
	 * Adds the action to the store.
	 * @param action The action.
	 */
	public set(action: DialAction | KeyAction): void {
		__items.set(action.id, action);
	}

	/**
	 * Deletes the action from the store.
	 * @param action The action's identifier.
	 */
	public delete(id: string): void {
		__items.delete(id);
	}
}

/**
 * Singleton instance of the action store.
 */
export const actionStore = new ActionStore();
