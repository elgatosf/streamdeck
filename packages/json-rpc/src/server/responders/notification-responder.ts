import type { Responder } from "../responder.js";

const noop = Promise.resolve();

/**
 * Response handler for a notification received from a client.
 */
export class NotificationResponder implements Responder {
	/**
	 * @inheritdoc
	 */
	public get canRespond(): boolean {
		return false;
	}

	/**
	 * @inheritdoc
	 */
	public error(): Promise<void> {
		return noop;
	}

	/**
	 * @inheritdoc
	 */
	public success(): Promise<void> {
		return noop;
	}
}
