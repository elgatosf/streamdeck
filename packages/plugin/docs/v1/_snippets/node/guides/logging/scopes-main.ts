import streamDeck from "@elgato/streamdeck";

const scopedLogger = streamDeck.logger.createScope("Main");
scopedLogger.info("Hello world");

streamDeck.connect();
