import type streamDeck from "../";
import type { Coordinates, DidReceiveSettings, SetImage, SetTitle } from "../../api";
import type { JsonObject, JsonValue } from "../../common/json";
import type { KeyOf } from "../../common/utils";
import { connection } from "../connection";
import type { Device } from "../devices";
import type { DialAction } from "./dial";
import type { KeyAction } from "./key";
import type { MultiActionKey } from "./multi";
import type { SingletonAction } from "./singleton-action";

/**
 * Provides a contextualized instance of an {@link Action}, allowing for direct communication with the Stream Deck.
 * @template T The type of settings associated with the action.
 */
export abstract class Action<T extends JsonObject = JsonObject> implements ActionContext {
	/**
	 * The action context.
	 */
	readonly #context: ActionContext;

	/**
	 * Initializes a new instance of the {@see Action} class.
	 * @param context Action context.
	 */
	constructor(context: ActionContext) {
		this.#context = context;
	}

	/**
	 * @inheritdoc
	 */
	public get device(): Device {
		return this.#context.device;
	}

	/**
	 * @inheritdoc
	 */
	public get id(): string {
		return this.#context.id;
	}

	/**
	 * @inheritdoc
	 */
	public get manifestId(): string {
		return this.#context.manifestId;
	}

	/**
	 * Underlying type of the action.
	 * @returns The type.
	 */
	protected abstract get type(): ActionType;

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
	 * Determines whether this instance is a dial action.
	 * @returns `true` when this instance is a dial; otherwise `false`.
	 */
	public isDial(): this is DialAction {
		return this.type === "Dial";
	}

	/**
	 * Determines whether this instance is a key action.
	 * @returns `true` when this instance is a key; otherwise `false`.
	 */
	public isKey(): this is KeyAction {
		return this.type === "Key";
	}

	/**
	 * Determines whether this instance is a multi-action key.
	 * @returns `true` when this instance is a multi-action key; otherwise `false`.
	 */
	public isMultiActionKey(): this is MultiActionKey {
		return this.type === "MultiActionKey";
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

/**
 * Action type, for example dial or key.
 */
export type ActionType = "Dial" | "Key" | "MultiActionKey";

/**
 * Provides context information for an instance of an action.
 */
export type ActionContext = {
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
 * Provides context information for an instance of an action, with coordinates.
 */
export type CoordinatedActionContext = ActionContext & {
	/**
	 * Coordinates of the action, on the Stream Deck device.
	 * @returns Coordinates.
	 */
	get coordinates(): Readonly<Coordinates>;
};
