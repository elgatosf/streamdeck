import { connection } from "./connection";

/**
 * Opens the specified `url` in the user's default browser.
 * @param url URL to open.
 * @returns `Promise` resolved when the request to open the `url` has been sent to Stream Deck.
 */
export function openUrl(url: string): Promise<void> {
	return connection.send({
		event: "openUrl",
		payload: {
			url,
		},
	});
}
