import type { DidReceivePropertyInspectorMessage, PropertyInspectorDidAppear, PropertyInspectorDidDisappear } from "../../api";
import type { IDisposable } from "../../common/disposable";
import type { JsonObject, JsonValue } from "../../common/json";
import type { MessageHandler, RouteConfiguration } from "../../common/messaging";
import { Action } from "../actions/action";
import { connection } from "../connection";
import { ActionWithoutPayloadEvent, DidReceivePropertyInspectorMessageEvent, type PropertyInspectorDidAppearEvent, type PropertyInspectorDidDisappearEvent } from "../events";
import { getCurrentUI, router, type PropertyInspector } from "./routing";

/**
 * Controller responsible for interacting with the property inspector associated with the plugin.
 */
class UIController {
	/**
	 * Gets the current property inspector.
	 * @returns The property inspector; otherwise `undefined`.
	 */
	public get current(): PropertyInspector | undefined {
		return getCurrentUI();
	}

	/**
	 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link UIController.onDidDisappear}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDidAppear<T extends JsonObject = JsonObject>(listener: (ev: PropertyInspectorDidAppearEvent<T>) => void): IDisposable {
		return connection.disposableOn("propertyInspectorDidAppear", (ev) => listener(new ActionWithoutPayloadEvent<PropertyInspectorDidAppear, Action<T>>(new Action<T>(ev), ev)));
	}

	/**
	 * Occurs when the property inspector associated with the action becomes destroyed, i.e. the user unselected the action in the Stream Deck application. Also see {@link UIController.onDidAppear}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDidDisappear<T extends JsonObject = JsonObject>(listener: (ev: PropertyInspectorDidDisappearEvent<T>) => void): IDisposable {
		return connection.disposableOn("propertyInspectorDidDisappear", (ev) =>
			listener(new ActionWithoutPayloadEvent<PropertyInspectorDidDisappear, Action<T>>(new Action<T>(ev), ev))
		);
	}

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using {@link UIController.current.sendMessage}
	 * or {@link Action.sendToPropertyInspector}.
	 * @template TPayload The type of the payload received from the property inspector.
	 * @template TSettings The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onMessage<TPayload extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject>(
		listener: (ev: DidReceivePropertyInspectorMessageEvent<TPayload, TSettings>) => void
	): IDisposable {
		return router.disposableOn("unhandledMessage", (ev) => {
			listener(new DidReceivePropertyInspectorMessageEvent<TPayload, TSettings>(new Action<TSettings>(ev), ev as DidReceivePropertyInspectorMessage<TPayload>));
		});
	}

	/**
	 * Creates a request route, mapping the path to the handler. The property inspector can then send requests to the handler using `streamDeck.plugin.fetch(path)`.
	 * @param path Path that identifies the route.
	 * @param handler Handler to be invoked when a matching request is received.
	 * @param options Optional routing configuration.
	 * @template TBody Body type sent with the request.
	 * @template TSettings Settings type associated with the action.
	 * @example
	 * streamDeck.ui.onRequest("/toggle-light", async (req, res) => {
	 *   await lightService.toggle(req.body.lightId);
	 *   res.success();
	 * });
	 */
	public registerRoute<TBody extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject>(
		path: string,
		handler: MessageHandler<Action<TSettings>, TBody>,
		options?: RouteConfiguration<Action>
	): void {
		router.route(path, handler, options);
	}
}

export const ui = new UIController();
export { type UIController };
