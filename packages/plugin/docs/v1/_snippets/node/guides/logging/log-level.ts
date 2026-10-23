import streamDeck, { LogLevel } from "@elgato/streamdeck";

streamDeck.logger.setLevel(LogLevel.WARN);

streamDeck.logger.error("Failures or exceptions");
streamDeck.logger.warn("Recoverable errors");
streamDeck.logger.info("Hello world"); // No output.
streamDeck.logger.debug("Debugging information"); // No output.
streamDeck.logger.trace("Detailed messages"); // No output.

streamDeck.connect();
