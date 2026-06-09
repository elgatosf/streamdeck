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
		this.#rpcHost = rpcHost;
		if (this.#server) {
			if (this.#client) {
				this.#attachRpc(this.#client);
			}

			return;
		}

		const path = getPipePath(uuid);

		// A Unix domain socket leaves a file behind if the previous process crashed; remove any
		// stale socket before listening to avoid EADDRINUSE. Windows named pipes self-clean.
		if (platform() !== "win32") {
			await rm(path, { force: true });
		}

		const server = createServer((socket) => this.#onConnection(socket));
		await new Promise<void>((resolve, reject) => {
			server.once("listening", () => resolve());
			server.once("error", (err) => reject(err));
			server.listen(path);
		});

		this.#server = server;
		this.#path = path;
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
		this.#attachRpc(socket);

		let buffer = "";
		socket.setEncoding("utf-8");
		socket.on("data", async (chunk: string) => {
			buffer += chunk;
			let newline = buffer.indexOf("\n");
			while (newline !== -1) {
				const line = buffer.slice(0, newline);
				buffer = buffer.slice(newline + 1);
				if (line.length > 0) {
					await this.#onMessage(socket, line);
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
	 * Attaches the RPC host to a socket-specific sender.
	 * @param socket Socket used by the RPC sender.
	 */
	#attachRpc(socket: Socket): void {
		this.#rpcHost?.attachRpc((message) => this.#send(socket, message));
	}

	/**
	 * Forwards a JSON-RPC message from the client to the RPC host.
	 * @param socket Socket that received the message.
	 * @param line Newline-delimited JSON message.
	 */
	async #onMessage(socket: Socket, line: string): Promise<void> {
		if (this.#client !== socket) {
			return;
		}

		try {
			await this.#rpcHost?.receive(JSON.parse(line));
		} catch {
			// Ignore malformed or stale bridge messages; reconnect will refresh state.
		}
	}

	/**
	 * Sends a JSON-RPC message to the connected client.
	 * @param socket Socket associated with the RPC exchange.
	 * @param message Message to send.
	 */
	async #send(socket: Socket, message: unknown): Promise<void> {
		if (this.#client === socket && !socket.destroyed) {
			socket.write(`${JSON.stringify(message)}\n`);
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
