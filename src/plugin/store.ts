import { ActionIdentifier } from "../api";
import { Enumerable } from "../common/enumerable";
import { DialAction } from "./actions/dial";
import { KeyAction } from "./actions/key";
import { KeyInMultiAction } from "./actions/multi";
import { connection } from "./connection";
import type { Device } from "./devices";

const actions = new Map<ActionIdentifier, DialAction | KeyAction | KeyInMultiAction>();
const devices = new Map<string, Device>();

// Add actions appearing.
connection.prependListener("willAppear", (ev) => {
	const context: ActionIdentifier = {
		action: ev.action,
		context: ev.context
	};

	if (ev.payload.controller === "Encoder") {
		actions.set(context, new DialAction(context));
	} else if (ev.payload.isInMultiAction) {
		actions.set(context, new KeyInMultiAction(context));
	} else {
		actions.set(context, new KeyAction(context));
	}
});

// Remove actions disappearing.
connection.prependListener("willDisappear", (ev) => actions.delete(ev));

// Add the devices based on the registration parameters.
connection.once("connected", (info) => {
	info.devices.forEach((dev) => {
		devices.set(dev.id, {
			...dev,
			isConnected: false
		});
	});
});

// Set newly connected devices.
connection.on("deviceDidConnect", ({ device: id, deviceInfo }) => {
	devices.set(
		id,
		Object.assign<Device | object, Device>(devices.get(id) || {}, {
			id,
			isConnected: true,
			...deviceInfo
		})
	);
});

// Updated disconnected devices.
connection.on("deviceDidDisconnect", ({ device: id }) => {
	const device = devices.get(id);
	if (device !== undefined) {
		device.isConnected = false;
	}
});

export default {
	actions: Enumerable.from(actions),
	devices: Enumerable.from(devices)
};
