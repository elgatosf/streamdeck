import streamDeck from "@elgato/streamdeck";

// console.error(...)
streamDeck.logger.error("Failures or exceptions");

// console.warn(...)
streamDeck.logger.warn("Recoverable errors");

// console.log(...);
streamDeck.logger.info("Hello world");
streamDeck.logger.debug("Debugging information");
streamDeck.logger.trace("Detailed messages");

streamDeck.connect();
