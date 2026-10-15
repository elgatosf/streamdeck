import streamDeck, { DeviceDidDisconnectEvent } from "@elgato/streamdeck";

streamDeck.devices.onDeviceDidDisconnect((ev: DeviceDidDisconnectEvent) => {
	const { id, isConnected, name, size, type } = ev.device;

	streamDeck.logger.info(name);
});
