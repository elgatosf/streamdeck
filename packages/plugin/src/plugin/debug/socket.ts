import { type JsonValue } from "@elgato/utils";
import type { RpcSender } from "@elgato/utils/rpc";
import { mkdir, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { dirname, join } from "node:path";
import WebSocket, { WebSocketServer, type RawData } from "ws";

import { logger } from "../logging/index.js";

// The plugin's working directory is its .sdPlugin bundle (see manifest.ts), so the debug file lives alongside the manifest.
const debugFile = join(process.cwd(), ".debug", "vscode-debug.json");

/**
 * Hosts the internal debug adapter over a localhost websocket and writes its port into the
 * plugin bundle so the VS Code extension can discover and connect to it.
 */
class DebugSocket {
	/**
	 * Connected VS Code debug client.
	 */
	#client: WebSocket | undefined;

	/**
	 * RPC host bound to the websocket transport.
	 */
	#rpcHost: DebugSocketRpcHost | undefined;

	/**
	 * Underlying websocket server.
	 */
	#server: WebSocketServer | undefined;

	/**
	 * Starts the debug websocket server and writes its port for the VS Code extension.
	 * @param rpcHost RPC host bound to the websocket transport.
	 */
	public async start(rpcHost: DebugSocketRpcHost): Promise<void> {
		if (this.#server) {
			return;
		}

		this.#rpcHost = rpcHost;
		rpcHost.attachRpc((message) => this.#send(message));

		const server = new WebSocketServer({ host: "127.0.0.1", port: 0 });
		this.#server = server;
		server.on("connection", (socket) => this.#onConnection(socket));
		await new Promise<void>((resolve, reject) => {
			server.once("listening", () => resolve());
			server.once("error", (err) => reject(err));
		});

		const { port } = server.address() as AddressInfo;
		await mkdir(dirname(debugFile), { recursive: true });
		await writeFile(debugFile, JSON.stringify({ port }), "utf-8");
		logger.debug(`Debug websocket listening on 127.0.0.1:${port}`);
	}

	/**
	 * Stops the debug websocket server and removes its port file.
	 */
	public async stop(): Promise<void> {
		this.#client?.close();
		this.#client = undefined;

		const server = this.#server;
		this.#server = undefined;
		if (server) {
			await rm(debugFile, { force: true });
			await new Promise<void>((resolve) => server.close(() => resolve()));
		}
	}

	/**
	 * Binds a newly connected VS Code debug client.
	 * @param socket Connected websocket.
	 */
	#onConnection(socket: WebSocket): void {
		this.#client?.close();
		this.#client = socket;
		socket.on("message", (data) => this.#onMessage(data));
		socket.on("close", () => {
			if (this.#client === socket) {
				this.#client = undefined;
			}
		});
	}

	/**
	 * Forwards a JSON-RPC message from the client to the RPC host.
	 * @param data Raw websocket message.
	 */
	async #onMessage(data: RawData): Promise<void> {
		await this.#rpcHost?.receive(JSON.parse(data.toString()));
	}

	/**
	 * Sends a JSON-RPC message to the connected client.
	 * @param message Message to send.
	 */
	async #send(message: unknown): Promise<void> {
		if (this.#client?.readyState === WebSocket.OPEN) {
			this.#client.send(JSON.stringify(message));
		}
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
