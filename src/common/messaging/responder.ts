import type { JsonValue } from "../json";
import type { OutboundMessageProxy } from "./gateway";
import type { RawMessageRequest, RawMessageResponse, StatusCode } from "./message";

/**
 * Message responder responsible for responding to a request.
 */
export class MessageResponder {
	/**
	 * Indicates whether a response has already been sent in relation to the response.
	 */
	private _responded = false;

	/**
	 * Initializes a new instance of the {@link MessageResponder} class.
	 * @param request The request the response is associated with.
	 * @param proxy Proxy responsible for forwarding the response to the client.
	 */
	constructor(
		private readonly request: RawMessageRequest,
		private readonly proxy: OutboundMessageProxy
	) {}

	/**
	 * Indicates whether a response can be sent.
	 * @returns `true` when a response has not yet been set.
	 */
	public get canRespond(): boolean {
		return !this._responded;
	}

	/**
	 * Sends a failure response with a status code of `500`.
	 * @param body Optional response body.
	 * @returns Promise fulfilled once the response has been sent.
	 */
	public fail(body?: JsonValue): Promise<void> {
		return this.send(500, body);
	}

	/**
	 * Sends the {@link body} as a response with the {@link status}
	 * @param status Response status.
	 * @param body Optional response body.
	 * @returns Promise fulfilled once the response has been sent.
	 */
	public async send(status: StatusCode, body?: JsonValue): Promise<void> {
		if (this.canRespond) {
			await this.proxy({
				__type: "response",
				id: this.request.id,
				path: this.request.path,
				body,
				status
			} satisfies RawMessageResponse);

			this._responded = true;
		}
	}

	/**
	 * Sends a success response with a status code of `200`.
	 * @param body Optional response body.
	 * @returns Promise fulfilled once the response has been sent.
	 */
	public success(body?: JsonValue): Promise<void> {
		return this.send(200, body);
	}
}
