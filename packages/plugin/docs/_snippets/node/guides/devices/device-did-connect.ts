import streamDeck, { DeviceDidConnectEvent } from "@elgato/streamdeck";

streamDeck.devices.onDeviceDidConnect((ev: DeviceDidConnectEvent) => {
	const { id, isConnected, name, size, type } = ev.device;

	streamDeck.logger.info(name);
});
