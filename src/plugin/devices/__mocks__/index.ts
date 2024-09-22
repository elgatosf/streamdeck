import { DeviceType } from "../../../api/device";
import { type Device } from "../device";

export const deviceService = {
	getDeviceById: jest.fn().mockImplementation((deviceId: string) => {
		return {
			actions: Array.from([]).values(),
			id: "DEV1",
			name: "Device One",
			size: {
				columns: 5,
				rows: 3
			},
			type: DeviceType.StreamDeckXL,
			isConnected: true
		} satisfies {
			// Public properties only.
			[K in keyof Device]: Device[K];
		};
	})
};
