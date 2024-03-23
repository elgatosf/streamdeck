import type { ActionIdentifier, DeviceIdentifier } from "../../api";
import type { JsonValue } from "../../common/json";
import { MessageGateway, type MessageRequestOptions, type MessageResponse } from "../../common/messaging";
import { Action } from "../actions/action";
import { ActionContext } from "../actions/context";
import { connection } from "../connection";

/**
 * Router responsible for communicating with the property inspector.
 */
const router = new MessageGateway<Action>(
	async (payload: JsonValue) => {
		if (currentUI) {
			await currentUI.sendMessage(payload);
			return true;
		}

		return false;
	},
	(source) => new Action(source)
);

export { router };

let currentUI: PropertyInspector | undefined;

connection.on("propertyInspectorDidAppear", (ev) => (currentUI = new PropertyInspector(ev)));
connection.on("propertyInspectorDidDisappear", () => (currentUI = undefined));
connection.on("sendToPlugin", (ev) => router.process(ev));

/**
 * Gets the current property inspector.
 * @returns The property inspector; otherwise `undefined`.
 */
export function getCurrentUI(): PropertyInspector | undefined {
	return currentUI;
}

/**
 * Property inspector providing information about its context, and functions for sending and fetching messages.
 */
export class PropertyInspector extends ActionContext implements Pick<MessageGateway<Action>, "fetch"> {
	/**
	 * Unique identifier of the Stream Deck device this property inspector is associated with.
	 */
	public readonly deviceId: string;

	/**
	 * Initializes a new instance of the {@link PropertyInspector} class.
	 * @param source Source the property inspector is associated with.
	 */
	constructor(source: ActionIdentifier & DeviceIdentifier) {
		super(source);
		this.deviceId = source.device;
	}

	/**
	 * Sends the {@link request} to the server; the server should be listening on {@link MessageGateway.route}.
	 * @param request The request.
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(request: MessageRequestOptions): Promise<MessageResponse<T>>;
	/**
	 * Sends the request to the server; the server should be listening on {@link MessageGateway.route}.
	 * @param path Path of the request.
	 * @param body Optional body sent with the request.
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(path: string, body?: JsonValue): Promise<MessageResponse<T>>;
	/**
	 * Sends the {@link requestOrPath} to the server; the server should be listening on {@link MessageGateway.route}.
	 * @param requestOrPath The request, or the path of the request.
	 * @param bodyOrUndefined Request body, or moot when constructing the request with {@link MessageRequestOptions}.
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(requestOrPath: MessageRequestOptions | string, bodyOrUndefined?: JsonValue): Promise<MessageResponse<T>> {
		return typeof requestOrPath === "string" ? router.fetch(requestOrPath, bodyOrUndefined) : router.fetch(requestOrPath);
	}

	/**
	 * Sends a message to the property inspector.
	 * @param payload Payload to send.
	 * @returns Promise completed when the message was sent.
	 */
	public sendMessage(payload: JsonValue): Promise<void> {
		return connection.send({
			event: "sendToPropertyInspector",
			context: this.id,
			payload
		});
	}
}
