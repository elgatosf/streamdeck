import streamDeck from "@elgato/streamdeck";

import { LogKeyPressAction } from "./actions/log-key-press";

streamDeck.actions.registerAction(new LogKeyPressAction());
streamDeck.connect();
