import { vi } from "vitest";

const { ReadOnlyActionStore } = await vi.importActual<typeof import("../store.js")>("../store");
const { KeyAction } = await vi.importActual<typeof import("../key.js")>("../key");
const { DialAction } = await vi.importActual<typeof import("../dial.js")>("../dial");

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
