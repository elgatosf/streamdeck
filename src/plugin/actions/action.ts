import type streamDeck from "../";
import type { ActionIdentifier, DidReceiveSettings, SetImage, SetTitle } from "../../api";
import type { JsonObject, JsonValue } from "../../common/json";
import type { KeyOf } from "../../common/utils";
import { connection } from "../connection";
import { ActionContext } from "./context";
import type { SingletonAction } from "./singleton-action";

/**
 * Provides a contextualized instance of an {@link Action}, allowing for direct communication with the Stream Deck.
 * @template T The type of settings associated with the action.
 */
export class Action<T extends JsonObject = JsonObject> extends ActionContext {
	/**
	 * Initializes a new instance of the {@see Action} class.
	 * @param source Source of the action.
	 */
	constructor(source: ActionIdentifier) {
		super(source);
	}

	/**
	 * Gets the settings associated this action instance.
	 * @template U The type of settings associated with the action.
	 * @returns Promise containing the action instance's settings.
	 */
	public getSettings<U extends JsonObject = T>(): Promise<U> {
		return new Promise((resolve) => {
			const callback = (ev: DidReceiveSettings<U>): void => {
				if (ev.context == this.id) {
					resolve(ev.payload.settings);
					connection.removeListener("didReceiveSettings", callback);
				}
			};

			connection.on("didReceiveSettings", callback);
			connection.send({
				event: "getSettings",
				context: this.id
			});
		});
	}

	/**
	 * Sends the {@link payload} to the property inspector. The plugin can also receive information from the property inspector via {@link streamDeck.ui.onSendToPlugin} and {@link SingletonAction.onSendToPlugin}
	 * allowing for bi-directional communication.
	 * @deprecated Consider using {@link streamDeck.ui.current.fetch} to send requests to the property inspector.
	 * @param payload Payload to send to the property inspector.
	 * @returns `Promise` resolved when {@link payload} has been sent to the property inspector.
	 */
	public sendToPropertyInspector(payload: JsonValue): Promise<void> {
		return connection.send({
			event: "sendToPropertyInspector",
			context: this.id,
			payload
		});
	}

	/**
	 * Sets the {@link settings} associated with this action instance. Use in conjunction with {@link Action.getSettings}.
	 * @param settings Settings to persist.
	 * @returns `Promise` resolved when the {@link settings} are sent to Stream Deck.
	 */
	public setSettings<U extends JsonObject = T>(settings: U): Promise<void> {
		return connection.send({
			event: "setSettings",
			context: this.id,
			payload: settings
		});
	}
}

/**
 * Options that define how to render an image associated with an action.
 */
export type ImageOptions = Omit<KeyOf<SetImage, "payload">, "image">;

/**
 * Options that define how to render a title associated with an action.
 */
export type TitleOptions = Omit<KeyOf<SetTitle, "payload">, "title">;
