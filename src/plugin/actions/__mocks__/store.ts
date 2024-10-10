import { DeviceType } from "../../../api/device";
import type { Device } from "../../devices";
import { deviceStore } from "../../devices/store";

const { ReadOnlyActionStore } = jest.requireActual("../store");
const { KeyAction } = jest.requireActual("../key");
const { DialAction } = jest.requireActual("../dial");

jest.mock("../../devices/store");

jest.spyOn(deviceStore, "getDeviceById").mockReturnValue({
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
	set: jest.fn(),
	delete: jest.fn(),
	getActionById: jest.fn().mockImplementation((id: string) => {
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
				settings: {},
			},
		});
	}),
};

export { ReadOnlyActionStore };
