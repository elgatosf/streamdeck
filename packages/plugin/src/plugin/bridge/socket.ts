import { type JsonValue } from "@elgato/utils";
import type { RpcSender } from "@elgato/utils/rpc";
import { rm } from "node:fs/promises";
import { createServer, type Server, type Socket } from "node:net";
import { platform } from "node:os";

import { logger } from "../logging/index.js";
import { getPipePath } from "./pipe-path.js";

/**
 * Hosts the bridge adapter over a named pipe (Windows) or Unix domain socket
 * (macOS/Linux) whose path is derived from the plugin UUID, so the VS Code extension can
 * discover and connect to it without any port handshake.
 */
class BridgeSocket {
	/**
	 * Connected VS Code client.
	 */
	#client: Socket | undefined;

	/**
	 * Path the server is currently listening on.
	 */
	#path: string | undefined;

	/**
	 * RPC host bound to the socket transport.
	 */
	#rpcHost: SocketRpcHost | undefined;

	/**
	 * Underlying socket server.
	 */
	#server: Server | undefined;

	/**
	 * Starts the bridge socket server on the UUID-derived path so the VS Code extension can connect.
	 * @param rpcHost RPC host bound to the socket transport.
	 * @param uuid Plugin UUID used to derive the pipe path.
	 */
	public async start(rpcHost: SocketRpcHost, uuid: string): Promise<void> {
		if (this.#server) {
			return;
		}

		this.#rpcHost = rpcHost;
		rpcHost.attachRpc((message) => this.#send(message));

		const path = getPipePath(uuid);
		this.#path = path;

		// A Unix domain socket leaves a file behind if the previous process crashed; remove any
		// stale socket before listening to avoid EADDRINUSE. Windows named pipes self-clean.
		if (platform() !== "win32") {
			await rm(path, { force: true });
		}

		const server = createServer((socket) => this.#onConnection(socket));
		this.#server = server;
		await new Promise<void>((resolve, reject) => {
			server.once("listening", () => resolve());
			server.once("error", (err) => reject(err));
			server.listen(path);
		});

		logger.debug(`Bridge socket listening on ${path}`);
	}

	/**
	 * Stops the bridge socket server and removes its socket file.
	 */
	public async stop(): Promise<void> {
		this.#client?.destroy();
		this.#client = undefined;

		const server = this.#server;
		const path = this.#path;
		this.#server = undefined;
		this.#path = undefined;
		if (server) {
			await new Promise<void>((resolve) => server.close(() => resolve()));
			if (path && platform() !== "win32") {
				await rm(path, { force: true });
			}
		}
	}

	/**
	 * Binds a newly connected VS Code client.
	 * @param socket Connected socket.
	 */
	#onConnection(socket: Socket): void {
		this.#client?.destroy();
		this.#client = socket;

		let buffer = "";
		socket.setEncoding("utf-8");
		socket.on("data", (chunk: string) => {
			buffer += chunk;
			let newline = buffer.indexOf("\n");
			while (newline !== -1) {
				const line = buffer.slice(0, newline);
				buffer = buffer.slice(newline + 1);
				if (line.length > 0) {
					void this.#onMessage(line);
				}

				newline = buffer.indexOf("\n");
			}
		});
		socket.on("close", () => {
			if (this.#client === socket) {
				this.#client = undefined;
			}
		});
		socket.on("error", () => {
			if (this.#client === socket) {
				this.#client = undefined;
			}
		});
	}

	/**
	 * Forwards a JSON-RPC message from the client to the RPC host.
	 * @param line Newline-delimited JSON message.
	 */
	async #onMessage(line: string): Promise<void> {
		await this.#rpcHost?.receive(JSON.parse(line));
	}

	/**
	 * Sends a JSON-RPC message to the connected client.
	 * @param message Message to send.
	 */
	async #send(message: unknown): Promise<void> {
		if (this.#client && !this.#client.destroyed) {
			this.#client.write(`${JSON.stringify(message)}\n`);
		}
	}
}

/**
 * Singleton bridge socket transport.
 */
export const socket = new BridgeSocket();

/**
 * Minimal RPC host interface required by the bridge socket transport.
 */
type SocketRpcHost = {
	/**
	 * Attaches the socket transport to the RPC host.
	 * @param send Sender used for outbound JSON-RPC messages.
	 */
	attachRpc(send: RpcSender): void;

	/**
	 * Attempts to process a JSON-RPC payload received from the socket client.
	 * @param value Received JSON value.
	 * @returns `true` when the value was handled by the RPC host.
	 */
	receive(value: JsonValue): Promise<boolean>;
};
