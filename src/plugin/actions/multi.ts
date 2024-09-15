import type { State } from "../../api";
import type { JsonObject } from "../../common/json";
import { connection } from "../connection";
import { Action, type ActionContext, type ActionType } from "./action";

/**
 * Provides a contextualized instance of a key action, within a multi-action.
 * @template T The type of settings associated with the action.
 */
export class MultiActionKey<T extends JsonObject = JsonObject> extends Action<T> {
	/**
	 * Initializes a new instance of the {@see KeyMultiAction} class.
	 * @param context Action context.
	 */
	constructor(context: ActionContext) {
		super(context);
	}

	/**
	 * @inheritdoc
	 */
	protected override get type(): ActionType {
		return "MultiActionKey";
	}

	/**
	 * Sets the current {@link state} of this action instance; only applies to actions that have multiple states defined within the manifest.
	 * @param state State to set; this be either 0, or 1.
	 * @returns `Promise` resolved when the request to set the state of an action instance has been sent to Stream Deck.
	 */
	public setState(state: State): Promise<void> {
		return connection.send({
			event: "setState",
			context: this.id,
			payload: {
				state
			}
		});
	}
}
