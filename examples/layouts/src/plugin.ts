import streamDeck from '@elgato/streamdeck';

import { BuiltInLayout } from './actions/built-in-layout';
import { CustomLayout } from './actions/custom-layout';
import { Feedback } from './actions/feedback';

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel('trace');

// Register the actions.
streamDeck.actions.registerAction(new BuiltInLayout());
streamDeck.actions.registerAction(new CustomLayout());
streamDeck.actions.registerAction(new Feedback());

// Finally, connect to the Stream Deck.
streamDeck.connect();
