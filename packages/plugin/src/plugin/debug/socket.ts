import { withResolvers, type JsonValue } from "@elgato/utils";
import type { RpcSender } from "@elgato/utils/rpc";
import WebSocket, { WebSocketServer, type RawData } from "ws";

import { connection } from "../connection.js";
import { logger } from "../logging/index.js";

/**
 * Hosts the internal debug adapter over a localhost websocket.
 */
class DebugSocket {
	/**
	 * Offset applied to the Stream Deck websocket port to derive the debug websocket port.
	 */
	static readonly #debugPortOffset = 1000;

	/**
	 * Logger scoped to the debug websocket transport.
	 */
	readonly #logger = logger.createScope("DebugSocket");

	/**
	 * RPC host bound to the websocket transport.
	 */
	#rpcHost: DebugSocketRpcHost | undefined;

	/**
	 * Underlying websocket server.
	 */
	#server: WebSocketServer | undefined;

	/**
	 * Currently connected debug client.
	 */
	#client: WebSocket | undefined;

	/**
	 * Promise representing startup of the websocket server.
	 */
	#startPromise: Promise<void> | undefined;

	/**
	 * Starts the debug websocket server.
	 * @param rpcHost RPC host bound to the websocket transport.
	 * @returns A promise resolved when the websocket server is listening.
	 */
	public async start(rpcHost: DebugSocketRpcHost): Promise<void> {
		this.#rpcHost = rpcHost;

		if (this.#startPromise) {
			return this.#startPromise;
		}

		this.#startPromise = this.#listen();

		try {
			await this.#startPromise;
		} catch (err) {
			this.#startPromise = undefined;
			throw err;
		}
	}

	/**
	 * Stops the debug websocket server.
	 * @returns A promise resolved when the websocket server is closed.
	 */
	public async stop(): Promise<void> {
		this.#client?.close();
		this.#client = undefined;

		const server = this.#server;
		this.#server = undefined;
		this.#startPromise = undefined;

		if (server) {
			const closed = withResolvers<void>();
			server.close((err) => {
				if (err) {
					closed.reject(err);
					return;
				}

				closed.resolve();
			});

			await closed.promise;
		}
	}

	/**
	 * Port used by the debug websocket server.
	 * @returns Plugin-specific debug websocket port.
	 */
	get #port(): number {
		const port = Number(connection.registrationParameters.port);
		if (!Number.isInteger(port) || port < 0) {
			throw new Error(`Invalid Stream Deck connection port: ${connection.registrationParameters.port}`);
		}

		return port + DebugSocket.#debugPortOffset;
	}

	/**
	 * Begins listening for debug websocket connections.
	 * @returns A promise resolved after the server is listening.
	 */
	async #listen(): Promise<void> {
		if (!this.#rpcHost) {
			throw new Error("Debug websocket started without an RPC host");
		}

		this.#rpcHost.attachRpc(async (message) => {
			await this.#send(message);
		});

		const server = new WebSocketServer({
			host: "127.0.0.1",
			port: this.#port,
		});

		this.#server = server;
		server.on("connection", (socket) => this.#handleConnection(socket));
		server.on("error", (err) => {
			this.#logger.error("Failed to host debug websocket", err);
		});

		const listening = withResolvers<void>();
		server.once("listening", () => listening.resolve());
		server.once("error", (err) => listening.reject(err));
		await listening.promise;

		const address = server.address();
		if (!address || typeof address === "string") {
			throw new Error("Debug websocket did not expose a TCP address");
		}

		this.#logger.debug(`Debug websocket listening on ws://127.0.0.1:${address.port}`);
	}

	/**
	 * Handles a newly connected debug client.
	 * @param socket Connected websocket client.
	 */
	#handleConnection(socket: WebSocket): void {
		if (this.#client && this.#client !== socket && this.#client.readyState === WebSocket.OPEN) {
			this.#client.close(1000, "Replaced by a new debug client");
		}

		this.#client = socket;
		socket.on("close", () => {
			if (this.#client === socket) {
				this.#client = undefined;
			}
		});
		socket.on("error", (err) => {
			this.#logger.error("Debug websocket client error", err);
		});
		socket.on("message", (data) => {
			void this.#handleMessage(data);
		});
	}

	/**
	 * Handles a message sent by the connected debug client.
	 * @param data Raw websocket message.
	 */
	async #handleMessage(data: RawData): Promise<void> {
		try {
			const handled = await this.#rpcHost?.receive(JSON.parse(data.toString())) ?? false;
			if (!handled) {
				this.#logger.warn(`Unhandled debug RPC message: ${data.toString()}`);
			}
		} catch (err) {
			this.#logger.error(`Failed to process debug websocket message: ${data.toString()}`, err);
		}
	}

	/**
	 * Sends a JSON-RPC payload to the active websocket client.
	 * @param message Message to send.
	 * @returns A promise resolved when the message is written.
	 */
	async #send(message: unknown): Promise<void> {
		const client = this.#client;
		if (!client || client.readyState !== WebSocket.OPEN) {
			return;
		}

		const sent = withResolvers<void>();
		client.send(JSON.stringify(message), (err) => {
			if (err) {
				sent.reject(err);
				return;
			}

			sent.resolve();
		});

		await sent.promise;
	}
}

/**
 * Singleton debug websocket transport.
 */
export const debugSocket = new DebugSocket();

/**
 * Minimal RPC host interface required by the debug websocket transport.
 */
type DebugSocketRpcHost = {
	/**
	 * Attaches the websocket transport to the RPC host.
	 * @param send Sender used for outbound JSON-RPC messages.
	 */
	attachRpc(send: RpcSender): void;

	/**
	 * Attempts to process a JSON-RPC payload received from the websocket client.
	 * @param value Received JSON value.
	 * @returns `true` when the value was handled by the RPC host.
	 */
	receive(value: JsonValue): Promise<boolean>;
};