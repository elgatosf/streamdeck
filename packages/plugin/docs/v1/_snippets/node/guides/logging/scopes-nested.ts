import streamDeck from "@elgato/streamdeck";

const scopedLogger = streamDeck.logger.createScope("Main");
scopedLogger.info("Hello world");

const nestedLogger = scopedLogger.createScope("Nested");
nestedLogger.info("Test");

streamDeck.connect();
