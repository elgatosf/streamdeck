import { vi } from "vitest";

import { DeviceType } from "../../../api/device";
import { type Device } from "../device";

export const deviceStore = {
	getDeviceById: vi.fn().mockImplementation((id: string) => {
		return {
			actions: Array.from([]).values(),
			id,
			name: "Device One",
			size: {
				columns: 5,
				rows: 3,
			},
			type: DeviceType.StreamDeckXL,
			isConnected: true,
		} satisfies {
			// Public properties only.
			[K in keyof Device]: Device[K];
		};
	}),
};
