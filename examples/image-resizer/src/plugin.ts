import streamDeck from "@elgato/streamdeck";

import { ResizeImage } from "./actions/resize-image";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded.
streamDeck.logger.setLevel("trace");

// Register the resize image action.
streamDeck.actions.registerAction(new ResizeImage());

// Finally, connect to the Stream Deck.
streamDeck.connect();
