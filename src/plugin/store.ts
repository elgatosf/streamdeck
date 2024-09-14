import { type WillAppear, type WillDisappear } from "../api";
import { Enumerable } from "../common/enumerable";
import type { JsonObject } from "../common/json";
import type { ActionContext } from "./actions/action";
import { DialAction } from "./actions/dial";
import { KeyAction } from "./actions/key";
import { KeyInMultiAction } from "./actions/multi";
import { connection } from "./connection";
import type { Device } from "./devices";

const actions = new Map<string, DialAction | KeyAction | KeyInMultiAction>();
const devices = new Map<string, Device>();

const keyOfAction = (ev: WillAppear<JsonObject> | WillDisappear<JsonObject>) => `${ev.action}_${ev.device}_${ev.context}`;

// Add actions appearing.
connection.prependListener("willAppear", (ev) => {
	const key = keyOfAction(ev);
	const context: ActionContext = {
		id: ev.context,
		manifestId: ev.action,
		device: devices.get(ev.device)!
	};

	if (ev.payload.controller === "Encoder") {
		actions.set(key, new DialAction({ ...context, coordinates: Object.freeze(ev.payload.coordinates) }));
	} else if (ev.payload.isInMultiAction) {
		actions.set(key, new KeyInMultiAction(context));
	} else {
		actions.set(key, new KeyAction({ ...context, coordinates: Object.freeze(ev.payload.coordinates) }));
	}
});

// Remove actions disappearing.
connection.prependListener("willDisappear", (ev) => actions.delete(keyOfAction(ev)));

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
	actions: new Enumerable(actions),
	devices: new Enumerable(devices)
};
