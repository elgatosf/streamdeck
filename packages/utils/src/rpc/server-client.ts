import { type JsonValue } from "../json.js";
import { RpcClient, type RpcClientOptions } from "./client.js";
import type { RpcSender } from "./sender.js";
import { RpcServer } from "./server.js";

/**
 * Create an RPC server-and-client, capable of receiving and sending requests and notifications.
 * @param send Function responsible for sending requests and responses.
 * @param options the options.
 * @returns The RPC server-and-client.
 */
export function createRpcServerClient(send: RpcSender, options?: RpcClientOptions): RpcServerClient {
	const client = new RpcClient(send, options);
	const server = new RpcServer(send);

	return {
		addMethod: server.addMethod.bind(server),
		notify: client.notify.bind(client),
		request: client.request.bind(client),
		async receive(value: JsonValue): Promise<boolean> {
			return (await client.receive(value)) || (await server.receive(value));
		},
	};
}

/**
 * An RPC server-and-client, capable of receiving and sending requests and notifications.
 */
export type RpcServerClient = Pick<RpcClient, "notify" | "request"> &
	Pick<RpcServer, "addMethod"> & {
		/**
		 * Attempts to process the specified value as a request or response.
		 * @param value Value to process.
		 * @returns `true` when the value was successfully processed; otherwise `false`.
		 */
		receive(value: JsonValue): Promise<boolean>;
	};
