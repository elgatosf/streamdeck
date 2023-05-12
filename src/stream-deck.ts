import { EventEmitter } from "node:events";
import WebSocket from "ws";

import { EventsReceived, StreamDeckEvent } from "./events";
import { RegistrationParameters } from "./registration";

let resolveConnection: (value: StreamDeck) => void;
const connection = new Promise<StreamDeck>((resolve) => (resolveConnection = resolve));

/**
 * The main bridge between the plugin and the Stream Deck, providing methods for listening to events emitted from the Stream Deck, and sending messages back.
 */
export class StreamDeck {
	/**
	 * Underlying connection between the plugin and the Stream Deck.
	 */
	private readonly connection: WebSocket;

	/**
	 * Event emitter used to propagate events from the Stream Deck to the plugin.
	 */
	private readonly eventEmitter = new EventEmitter();

	/**
	 * Initializes a new instance of the Stream Deck class, used to transmit messages between the Stream Deck and the plugin.
	 * @param params Registration parameters used to establish a connection with the Stream Deck; these are automatically supplied as part of the command line arguments when the plugin is ran by the Stream Deck.
	 */
	constructor(private readonly params = new RegistrationParameters(process.argv)) {
		this.connection = new WebSocket(`ws://localhost:${params.port}`);
		this.connection.onmessage = this.propagateMessage.bind(this);
		this.connection.onopen = () => {
			JSON.stringify({
				event: params.event,
				uuid: params.pluginUUID
			});

			resolveConnection(this);
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
	public on<TEvent extends EventsReceived["event"], TEventArgs = Extract<EventsReceived, StreamDeckEvent<TEvent>>>(event: TEvent, listener: (data: TEventArgs) => void) {
		this.eventEmitter.addListener(event, listener);
	}

	//public setSettings(context: string, settings: unknown);
	//public getSettings?<T = unknown>(context: string): Promise<T>;
	//public setGlobalSettings?(settings: unknown): void;
	//public getGlobalSettings?<T = unknown>(): Promise<T>;
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
}

export default await connection;
