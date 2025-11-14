import { vi } from "vitest";

import { DeviceType } from "../../../api/device.js";
import type { Device } from "../../devices/index.js";
import { deviceStore } from "../../devices/store.js";

const { ReadOnlyActionStore } = await vi.importActual<typeof import("../store.js")>("../store");
const { KeyAction } = await vi.importActual<typeof import("../key.js")>("../key");
const { DialAction } = await vi.importActual<typeof import("../dial.js")>("../dial");

vi.mock("../../devices/store.js");

vi.spyOn(deviceStore, "getDeviceById").mockReturnValue({
	id: "device123",
	isConnected: true,
	name: "Device 1",
	size: {
		columns: 5,
		rows: 3,
	},
	type: DeviceType.StreamDeck,
} as unknown as Device);

export const actionStore = {
	set: vi.fn(),
	delete: vi.fn(),
	getActionById: vi.fn().mockImplementation((id: string) => {
		if (id === "dial123") {
			return new DialAction({
				action: "com.elgato.test.dial",
				context: id,
				device: "device123",
				event: "willAppear",
				payload: {
					controller: "Encoder",
					coordinates: {
						column: 1,
						row: 2,
					},
					isInMultiAction: false,
					resources: {},
					settings: {},
				},
			});
		}

		return new KeyAction({
			action: "com.elgato.test.key",
			context: id,
			device: "device123",
			event: "willAppear",
			payload: {
				controller: "Keypad",
				coordinates: {
					column: 1,
					row: 2,
				},
				isInMultiAction: false,
				resources: {},
				settings: {},
			},
		});
	}),
};

export { ReadOnlyActionStore };
