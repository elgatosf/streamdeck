import streamDeck from "@elgato/streamdeck";

streamDeck.logger.error("Failures or exceptions");
streamDeck.logger.warn("Recoverable errors");
streamDeck.logger.info("Hello world");
streamDeck.logger.debug("Debugging information");
streamDeck.logger.trace("Detailed messages");

streamDeck.connect();
