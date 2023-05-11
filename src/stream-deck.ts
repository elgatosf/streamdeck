import EventEmitter from "events";
import WebSocket from "ws";

import { EventsReceived } from "./events-received";
import { RegistrationParameters } from "./registration";

export class StreamDeck {
	private readonly connection: WebSocket;
	private readonly eventEmitter = new EventEmitter();

	constructor(private readonly params = new RegistrationParameters(process.argv)) {
		this.connection = new WebSocket(`ws://localhost:${params.port}`);
		this.connection.onmessage = this.propagateMessage.bind(this);
		this.connection.onopen = () => {
			// todo, do we emit ready?
			JSON.stringify({
				event: params.event,
				uuid: params.pluginUUID
			});
		};
	}

	public get info() {
		return this.params.info;
	}

	public get pluginUUID() {
		return this.params.pluginUUID;
	}

	public on<TEvent extends EventsReceived["event"], TEventArgs = Extract<EventsReceived, { event: TEvent }>>(event: TEvent, listener: (data: TEventArgs) => void) {
		this.eventEmitter.addListener(event, listener);
	}

	private propagateMessage(event: WebSocket.MessageEvent) {
		if (typeof event === "string") {
			const message = JSON.parse(event);
			if (message.event) {
				this.eventEmitter.emit(message.event);
			}
		}
	}
}

export default new StreamDeck();
