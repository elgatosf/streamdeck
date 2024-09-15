import type streamDeck from "../";
import type { DidReceivePropertyInspectorMessage } from "../../api";
import type { IDisposable } from "../../common/disposable";
import type { JsonObject, JsonValue } from "../../common/json";
import { PUBLIC_PATH_PREFIX, type RouteConfiguration } from "../../common/messaging";
import { Action } from "../actions/action";
import { actionStore } from "../actions/store";
import { connection } from "../connection";
import { ActionWithoutPayloadEvent, SendToPluginEvent, type PropertyInspectorDidAppearEvent, type PropertyInspectorDidDisappearEvent } from "../events";
import { type MessageHandler } from "./message";
import { type PropertyInspector } from "./property-inspector";
import { getCurrentUI, router } from "./router";

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
	 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. See also {@link UIController.onDidDisappear}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDidAppear<T extends JsonObject = JsonObject>(listener: (ev: PropertyInspectorDidAppearEvent<T>) => void): IDisposable {
		return connection.disposableOn("propertyInspectorDidAppear", (ev) => {
			const action = actionStore.getActionById(ev.context);
			if (action) {
				listener(new ActionWithoutPayloadEvent(action, ev));
			}
		});
	}

	/**
	 * Occurs when the property inspector associated with the action becomes destroyed, i.e. the user unselected the action in the Stream Deck application. See also {@link UIController.onDidAppear}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDidDisappear<T extends JsonObject = JsonObject>(listener: (ev: PropertyInspectorDidDisappearEvent<T>) => void): IDisposable {
		return connection.disposableOn("propertyInspectorDidDisappear", (ev) => {
			const action = actionStore.getActionById(ev.context);
			if (action) {
				listener(new ActionWithoutPayloadEvent(action, ev));
			}
		});
	}

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using {@link UIController.current.sendMessage}
	 * or {@link Action.sendToPropertyInspector}.
	 * @deprecated Consider using {@link streamDeck.ui.registerRoute} to receive requests from the property inspector.
	 * @template TPayload The type of the payload received from the property inspector.
	 * @template TSettings The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onSendToPlugin<TPayload extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject>(
		listener: (ev: SendToPluginEvent<TPayload, TSettings>) => void
	): IDisposable {
		return router.disposableOn("unhandledMessage", (ev) => {
			const action = actionStore.getActionById(ev.context);
			if (action) {
				listener(new SendToPluginEvent<TPayload, TSettings>(action, ev as DidReceivePropertyInspectorMessage<TPayload>));
			}
		});
	}

	/**
	 * Registers the function as a route, exposing it to the property inspector via `streamDeck.plugin.fetch(path)`.
	 * @template TBody The type of the request body.
	 * @template TSettings The type of the action's settings.
	 * @param path Path that identifies the route.
	 * @param handler Handler to be invoked when a matching request is received.
	 * @param options Optional routing configuration.
	 * @returns Disposable capable of removing the route handler.
	 * @example
	 * streamDeck.ui.registerRoute("/toggle-light", async (req, res) => {
	 *   await lightService.toggle(req.body.lightId);
	 *   res.success();
	 * });
	 */
	public registerRoute<TBody extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject>(
		path: string,
		handler: MessageHandler<TBody, TSettings>,
		options?: RouteConfiguration<Action>
	): IDisposable {
		return router.route(`${PUBLIC_PATH_PREFIX}${path}`, handler, options);
	}
}

export const ui = new UIController();
export { type UIController };
