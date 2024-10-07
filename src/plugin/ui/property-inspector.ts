import type streamDeck from "../";
import type { ActionIdentifier, DeviceIdentifier } from "../../api";
import type { JsonValue } from "../../common/json";
import {
	type MessageGateway,
	type MessageRequestOptions,
	type MessageResponse,
	PUBLIC_PATH_PREFIX,
} from "../../common/messaging";
import type { Action } from "../actions/action";
import type { DialAction } from "../actions/dial";
import type { KeyAction } from "../actions/key";
import type { SingletonAction } from "../actions/singleton-action";
import { actionStore } from "../actions/store";
import { connection } from "../connection";

/**
 * Property inspector providing information about its context, and functions for sending and fetching messages.
 */
export class PropertyInspector implements Pick<MessageGateway<Action>, "fetch"> {
	/**
	 * Action associated with the property inspector
	 */
	public readonly action: DialAction | KeyAction;

	/**
	 * Initializes a new instance of the {@link PropertyInspector} class.
	 * @param router Router responsible for fetching requests.
	 * @param source Source the property inspector is associated with.
	 */
	constructor(
		private readonly router: MessageGateway<Action>,
		source: ActionIdentifier & DeviceIdentifier,
	) {
		this.action = actionStore.getActionById(source.context)!;
	}

	/**
	 * Sends a fetch request to the property inspector; the property inspector can listen for requests by registering routes.
	 * @template T The type of the response body.
	 * @param request The request being sent to the property inspector.
	 * @returns The response.
	 * @example
	 * // Within the property inspector, setup the route.
	 * streamDeck.plugin.registerRoute("/show-dialog", () => {
	 *   showDialog();
	 * });
	 *
	 * // Within the plugin, send a fetch request to the current property inspector.
	 * streamDeck.ui.current.fetch({
	 *   path: "/show-dialog"
	 * });
	 */
	public async fetch<T extends JsonValue = JsonValue>(request: MessageRequestOptions): Promise<MessageResponse<T>>;
	/**
	 * Sends a fetch request to the property inspector; the property inspector can listen for requests by registering routes.
	 * @template T The type of the response body.
	 * @param path Path of the request being sent to the property inspector.
	 * @param body Optional body sent with the request.
	 * @returns The response.
	 * @example
	 * // Within the property inspector, setup the route.
	 * streamDeck.plugin.registerRoute("/show-dialog", () => {
	 *   showDialog();
	 * });
	 *
	 * // Within the plugin, send a fetch request to the current property inspector.
	 * streamDeck.ui.current.fetch("/show-dialog");
	 */
	public async fetch<T extends JsonValue = JsonValue>(path: string, body?: JsonValue): Promise<MessageResponse<T>>;
	/**
	 * Sends a fetch request to the property inspector; the property inspector can listen for requests by registering routes.
	 * @template T The type of the response body.
	 * @param requestOrPath The request, or the path of the request.
	 * @param bodyOrUndefined Request body, or moot when constructing the request with {@link MessageRequestOptions}.
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(
		requestOrPath: MessageRequestOptions | string,
		bodyOrUndefined?: JsonValue,
	): Promise<MessageResponse<T>> {
		if (typeof requestOrPath === "string") {
			return this.router.fetch(`${PUBLIC_PATH_PREFIX}${requestOrPath}`, bodyOrUndefined);
		} else {
			return this.router.fetch({
				...requestOrPath,
				path: `${PUBLIC_PATH_PREFIX}${requestOrPath.path}`,
			});
		}
	}

	/**
	 * Sends the {@link payload} to the property inspector. The plugin can also receive information from the property inspector via {@link streamDeck.ui.onSendToPlugin} and {@link SingletonAction.onSendToPlugin}
	 * allowing for bi-directional communication.
	 * @template T The type of the payload received from the property inspector.
	 * @param payload Payload to send to the property inspector.
	 * @returns `Promise` resolved when {@link payload} has been sent to the property inspector.
	 */
	public sendToPropertyInspector(payload: JsonValue): Promise<void> {
		return connection.send({
			event: "sendToPropertyInspector",
			context: this.action.id,
			payload,
		});
	}
}
