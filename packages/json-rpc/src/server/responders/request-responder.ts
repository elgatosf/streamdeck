import type * as JsonRpc from "../../json-rpc/index.js";
import type { Responder } from "../responder.js";

/**
 * Response handler for a request received from a client.
 */
export class RequestResponder implements Responder {
	/**
	 * Request identifier.
	 */
	#id: JsonRpc.Id;

	/**
	 * Determines whether a response has been sent.
	 */
	#responded = false;

	/**
	 * Stream responsible for sending the response.
	 */
	#sendingStream: WritableStream<JsonRpc.Response>;

	/**
	 * Initializes a new instance of the {@link RequestResponder}.
	 * @param id Request identifier.
	 * @param sendingStream Stream responsible for sending the response.
	 */
	constructor(id: JsonRpc.Id, sendingStream: WritableStream<JsonRpc.Response>) {
		this.#id = id;
		this.#sendingStream = sendingStream;
	}

	/**
	 * @inheritdoc
	 */
	public get canRespond(): boolean {
		return !this.#responded;
	}

	/**
	 * @inheritdoc
	 */
	public async error(error: JsonRpc.Error): Promise<void> {
		await this.#send({
			jsonrpc: "2.0",
			id: this.#id,
			error,
		});
	}

	/**
	 * @inheritdoc
	 */
	public async success(result: JsonRpc.Result): Promise<void> {
		await this.#send({
			jsonrpc: "2.0",
			id: this.#id,
			result,
		});
	}

	/**
	 * Send the response to the client.
	 * @param res Response to send.
	 */
	async #send(res: JsonRpc.Response): Promise<void> {
		if (this.#responded) {
			throw new Error("Cannot send response as one has already been sent.");
		}

		const writer = this.#sendingStream.getWriter();
		try {
			await writer.write(res);
			this.#responded = true;
		} finally {
			writer.releaseLock();
		}
	}
}
