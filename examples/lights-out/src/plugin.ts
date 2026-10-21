import streamDeck from "@elgato/streamdeck";

import { GamePiece } from "./actions/gamePiece";
import { Reset } from "./actions/reset";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded.
streamDeck.logger.setLevel("trace");

// Register the game actions.
const gamePiece = new GamePiece();
streamDeck.actions.registerAction(gamePiece);
streamDeck.actions.registerAction(new Reset(gamePiece));

// Finally, connect to the Stream Deck.
streamDeck.connect();
