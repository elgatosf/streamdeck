import { EventEmitter } from "node:events";
import WebSocket from "ws";

import { InboundEvents, OutboundEvents, StreamDeckEvent } from "./events";
import { PromiseCompletionSource } from "./promises";
import { RegistrationParameters } from "./registration";

/**
 * The main bridge between the plugin and the Stream Deck, providing methods for listening to events emitted from the Stream Deck, and sending messages back.
 */
export class StreamDeck {
	/**
	 * Connection between the plugin and the Stream Deck in the form of a promise; once connected to the Stream Deck and the plugin has been registered, the promised is resolved and the connection becomes available.
	 */
	private readonly connection = new PromiseCompletionSource<WebSocket>();

	/**
	 * Web socket connection used by this instance to establish the connection with the Stream Deck.
	 */
	private readonly ws: WebSocket;

	/**
	 * Event emitter used to propagate events from the Stream Deck to the plugin.
	 */
	private readonly eventEmitter = new EventEmitter();

	/**
	 * Initializes a new instance of the Stream Deck class, used to transmit messages between the Stream Deck and the plugin.
	 * @param params Registration parameters used to establish a connection with the Stream Deck; these are automatically supplied as part of the command line arguments when the plugin is ran by the Stream Deck.
	 */
	constructor(private readonly params = new RegistrationParameters(process.argv)) {
		this.ws = new WebSocket(`ws://localhost:${params.port}`);
		this.ws.onmessage = this.propagateMessage.bind(this);
		this.ws.onopen = () => {
			JSON.stringify({
				event: params.event,
				uuid: params.pluginUUID
			});

			// Web socket established a connection with the Stream Deck and the plugin was registered.
			this.connection.setResult(this.ws);
		};
	}

	/**
	 * Gets the information supplied by Stream Deck during the initial registration procedure of the plugin.
	 * @returns Information about the user's operating system, plugin version, connected devices, etc.
	 */
	public get info() {
		return this.params.info;
	}

	/**
	 * Gets the plugin's unique identifier supplied by Stream Deck. The identifier is transmitted as part of specific messages sent to Stream Deck, e.g. "setGlobalSettings", "getGlobalSettings", and "switchToProfile".
	 * @returns This plugin's unique identifer.
	 */
	public get pluginUUID() {
		return this.params.pluginUUID;
	}

	/**
	 * Registers a listener to be invoked when Stream Deck emits an event, e.g. "willAppear" when an action becomes visible, "deviceDidDisconnect" when a device is connected to user's machine, etc.
	 * @param event Event to listen for.
	 * @param listener Callback invoked when Stream Deck emits the event.
	 */
	public on<TEvent extends InboundEvents["event"], TEventArgs = Extract<InboundEvents, StreamDeckEvent<TEvent>>>(event: TEvent, listener: (data: TEventArgs) => void) {
		this.eventEmitter.addListener(event, listener);
	}

	/**
	 * Sets the settings associated with an instance of an action, as identified by the context. An instance of an action represents a button, dial, pedal, etc.
	 * @param context Unique identifier of the action instance whose settings will be updated.
	 * @param settings Settings to associate with the action instance.
	 * @returns Promise resolved when the settings are sent to Stream Deck.
	 */
	public setSettings(context: string, settings: unknown): Promise<void> {
		return this.send("setSettings", {
			context,
			payload: settings
		});
	}

	//public getSettings?<T = unknown>(context: string): Promise<T>;
	//public setGlobalSettings?(settings: unknown): void;
	//public getGlobalSettings<T = unknown>(): Promise<DidReceiveGlobalSettings<T>> {
	//public openUrl?(url: string): void;
	//public logMessage?(message: string): void;
	//public setTitle(context: string, title: string, target: Target = Target.HardwareAndSoftware, state: 0 | 1 | null = null);
	//public setImage(context: string, image: string, target: Target = Target.HardwareAndSoftware, state: 0 | 1 | null = null);
	//public setFeedback(context: string, feedback: unknown);
	//public setFeedbackLayout(context: string, layout: string);
	//public showAlert(context: string);
	//public showOk(context: string);
	//public setState(context: string, state: 0 | 1 | null = null);
	//public switchToProfile(profileName: string);
	//public sendToPropertyInspector(context: string, payload: unknown);

	/**
	 * Propagates the event emitted by the Stream Deck's web socket connection, to the event emitter used by the plugin.
	 * @param event Event message received from the Stream Deck.
	 */
	private propagateMessage(event: WebSocket.MessageEvent) {
		if (typeof event === "string") {
			const message = JSON.parse(event);
			if (message.event) {
				this.eventEmitter.emit(message.event);
			}
		}
	}

	/**
	 * Sends the messages to the Stream Deck, once the connection has been established and the plugin registered.
	 * @param event Event name where the message will be sent.
	 * @param message Message to send.
	 */
	private async send(event: OutboundEvents, message: object): Promise<void> {
		const connection = await this.connection.promise;
		connection.send(
			JSON.stringify({
				event,
				...message
			})
		);
	}
}

export default new StreamDeck();
