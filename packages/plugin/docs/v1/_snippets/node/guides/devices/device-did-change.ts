import streamDeck, { type DeviceDidChangeEvent } from "@elgato/streamdeck";

streamDeck.devices.onDeviceDidChange((ev: DeviceDidChangeEvent) => {
	const { id, isConnected, name, size, type } = ev.device;

	streamDeck.logger.info(name);
});
