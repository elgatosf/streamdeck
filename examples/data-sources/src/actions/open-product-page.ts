import streamDeck, { action, SingletonAction, type KeyDownEvent, type SendToPluginEvent } from "@elgato/streamdeck";
import { JsonValue } from "@elgato/utils";

import type { DataSourcePayload, DataSourceResult } from "../sdpi";

/**
 * An action that demonstrates populating a drop-down with a dynamic data source.
 *
 * After selecting a product within the property inspector, pressing the button will open the product's page.
 */
@action({ UUID: "com.elgato.product-viewer.open-product-page" })
export class OpenProductPage extends SingletonAction<Settings> {
	/**
	 * Opens the selected product's page in the user's default browser.
	 * @param ev Event information.
	 */
	override onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> | void {
		if (ev.payload.settings.product) {
			streamDeck.system.openUrl(ev.payload.settings.product);
		}
	}

	/**
	 * Listen for messages from the property inspector.
	 * @param ev Event information.
	 */
	override onSendToPlugin(ev: SendToPluginEvent<JsonValue, Settings>): Promise<void> | void {
		// Check if the payload is requesting a data source, i.e. the structure is { event: string }
		if (ev.payload instanceof Object && "event" in ev.payload && ev.payload.event === "getProducts") {
			// Send the product ranges to the property inspector.
			streamDeck.ui.sendToPropertyInspector({
				event: "getProducts",
				items: this.#getStreamDeckProducts(),
			} satisfies DataSourcePayload);
		}
	}

	/**
	 * Gets a collection of items to be shown within the drop down in the property inspector. In this
	 * context the items are hardcoded, but this function could make a request to an external source
	 * and return items dynamically.
	 * @returns The product ranges.
	 */
	#getStreamDeckProducts(): DataSourceResult {
		return [
			{
				value: "https://www.elgato.com/uk/en/p/stream-deck-plus",
				label: "Stream Deck +",
			},
			{
				value: "https://www.elgato.com/uk/en/p/stream-deck-mini",
				label: "Stream Deck Mini",
			},
			{
				value: "https://www.elgato.com/uk/en/p/stream-deck",
				label: "Stream Deck MK.2",
			},
			{
				value: "https://www.elgato.com/uk/en/p/stream-deck-neo",
				label: "Stream Deck Neo",
			},
			{
				value: "https://www.elgato.com/uk/en/p/stream-deck-pedal",
				label: "Stream Deck Pedal",
			},
			{
				value: "https://www.elgato.com/uk/en/p/stream-deck-scissor-keys",
				label: "Stream Deck Scissor Keys",
			},
			{
				value: "https://www.elgato.com/uk/en/p/stream-deck-xl",
				label: "Stream Deck XL",
			},
		];
	}
}

type Settings = {
	product?: string;
};
