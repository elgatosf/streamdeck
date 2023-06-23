import { EventEmitter } from "node:events";
import WebSocket from "ws";

import logger from "../logger";
import { PromiseCompletionSource } from "../promises";
import { RegistrationParameters } from "../registration";
import { InboundMessages, Message, OutboundMessages } from "./messages";

/**
 * Provides a connection between the plugin and the Stream Deck allowing for messages to be sent and received.
 */
export class StreamDeckConnection {
	/**
	 * Connection between the plugin and the Stream Deck in the form of a promise; once connected to the Stream Deck and the plugin has been registered, the promised is resolved and the connection becomes available.
	 */
	private readonly connection = new PromiseCompletionSource<WebSocket>();

	/**
	 * Event emitter used to propagate events from the Stream Deck to the plugin.
	 */
	private readonly eventEmitter = new EventEmitter();

	/**
	 * Web socket connection used by this instance to establish the connection with the Stream Deck.
	 */
	private ws?: WebSocket;

	/**
	 * Initializes a new instance of the `StreamDeckConnection` class.
	 * @param params Registration parameters used to establish a connection with the Stream Deck; these are automatically supplied as part of the command line arguments when the plugin is ran by the Stream Deck.
	 */
	constructor(public readonly params = new RegistrationParameters(process.argv)) {}

	/**
	 * Establishes a connection with the Stream Deck, allowing for the plugin to send and receive messages.
	 */
	public connect() {
		// Ensure we only establish a single connection.
		if (this.ws !== undefined) {
			return;
		}

		logger.debug("Connecting to Stream Deck.");
		this.ws = new WebSocket(`ws://localhost:${this.params.port}`);
		this.ws.onmessage = this.propagateMessage.bind(this);
		this.ws.onopen = () => {
			if (this.ws) {
				this.ws.send(
					JSON.stringify({
						event: this.params.registerEvent,
						uuid: this.params.pluginUUID
					})
				);

				// Web socket established a connection with the Stream Deck and the plugin was registered.
				this.connection.setResult(this.ws);
				logger.debug("Successfully connected to Stream Deck.");
			}
		};
	}

	/**
	 * Adds the `listener` function to be invoked when Stream Deck emits the event named `eventName`, e.g. "willAppear" when an action becomes visible, "deviceDidDisconnect" when a
	 * device is connected to user's machine, etc.
	 * @param eventName Event to listen for.
	 * @param listener Callback invoked when Stream Deck emits the event.
	 * @returns This instance for chaining.
	 */
	public on<TEvent extends InboundMessages["event"], TEventArgs extends Extract<InboundMessages, Message<TEvent>>>(eventName: TEvent, listener: (data: TEventArgs) => void): this {
		this.eventEmitter.on(eventName, listener);
		return this;
	}

	/**
	 * Adds a **one-time** `listener` function to be invoked when Stream Deck emits the event named `eventName`. The next time `eventName` is triggered, this listener is removed and
	 * then invoked.
	 * @param eventName Event to listen for.
	 * @param listener Callback invoked when Stream Deck emits the event.
	 * @returns This instance for chaining.
	 */
	public once<TEvent extends InboundMessages["event"], TEventArgs extends Extract<InboundMessages, Message<TEvent>>>(eventName: TEvent, listener: (data: TEventArgs) => void): this {
		this.eventEmitter.once(eventName, listener);
		return this;
	}

	/**
	 * Removes the specified `listener` registered against the `eventName`. Inverse of {@link StreamDeckConnection.on}.
	 * @param eventName Name of the event the listener is being removed from.
	 * @param listener Callback to remove.
	 * @returns This instance for chaining.
	 */
	public removeListener<TEvent extends InboundMessages["event"], TEventArgs extends Extract<InboundMessages, Message<TEvent>>>(eventName: TEvent, listener: (data: TEventArgs) => void): this {
		this.eventEmitter.removeListener(eventName, listener);
		return this;
	}

	/**
	 * Sends the messages to the Stream Deck, once the connection has been established and the plugin registered.
	 * @param event Event name where the message will be sent.
	 * @param data Data to send to Stream Deck.
	 * @returns `Promise` resolved when the request is sent to Stream Deck.
	 */
	public async send(event: OutboundMessages, data: object): Promise<void> {
		const connection = await this.connection.promise;
		const message = JSON.stringify({
			event,
			...data
		});

		logger.trace(message);
		connection.send(message);
	}

	/**
	 * Propagates the event emitted by the Stream Deck's web socket connection, to the event emitter used by the plugin.
	 * @param event Event message received from the Stream Deck.
	 */
	private propagateMessage(event: WebSocket.MessageEvent) {
		if (typeof event.data === "string") {
			const message = JSON.parse(event.data);
			if (message.event) {
				logger.trace(event.data);
				this.eventEmitter.emit(message.event, message);
			}
		}
	}
}