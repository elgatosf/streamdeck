import streamDeck from "@elgato/streamdeck";

streamDeck.i18n.translate("More info");
// Output: "More info"

streamDeck.i18n.translate("More info", "de");
// Output: "Weitere Informationen"

streamDeck.i18n.translate("More info", "es");
// Output: "More info", es.json is not defined
