import streamDeck from "@elgato/streamdeck";

import { NewString } from "./actions/newString";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

// Register the increment action.
streamDeck.actions.registerAction(new NewString());

// Finally, connect to the Stream Deck.
streamDeck.connect();
