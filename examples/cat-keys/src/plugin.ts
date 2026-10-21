import streamDeck from '@elgato/streamdeck';

import { RandomCat } from './actions/random-cat';

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded.
streamDeck.logger.setLevel('trace');

// Register the random cat action.
streamDeck.actions.registerAction(new RandomCat());

// Finally, connect to the Stream Deck.
streamDeck.connect();
