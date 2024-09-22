import type { WillAppear, WillDisappear } from "../../../api";
import type { JsonObject } from "../../../common/json";
import { DialAction } from "../dial";
import { KeyAction } from "../key";
import type { ActionContext } from "../store";

const { ActionStore, initializeStore: __initializeStore } = jest.requireActual<typeof import("../store")>("../store");

// Mock key.
const key = new KeyAction(
	{
		id: "key123",
		manifestId: "com.elgato.test.key",
		device: undefined!,
		controller: "Keypad"
	},
	{
		controller: "Keypad",
		coordinates: {
			column: 1,
			row: 1
		},
		isInMultiAction: false,
		settings: {}
	}
);

// Mock dial.
const dial = new DialAction(
	{
		id: "dial123",
		manifestId: "com.elgato.test.dial",
		device: undefined!,
		controller: "Encoder"
	},
	{
		controller: "Encoder",
		coordinates: {
			column: 1,
			row: 1
		},
		isInMultiAction: false,
		settings: {}
	}
);

export const actionStore = {
	getActionById: jest.fn().mockImplementation((id) => {
		if (id === key.id) {
			return key;
		} else if (id === dial.id) {
			return dial;
		}

		return undefined;
	})
};

// @ts-expect-error Underlying store is not used, but still registers on the connection.
__initializeStore({
	getDeviceById: jest.fn()
});

export const initializeStore = jest.fn();
export { ActionStore };

export const createContext = jest.fn().mockImplementation((source: WillAppear<JsonObject> | WillDisappear<JsonObject>) => {
	return {
		controller: source.payload.controller,
		device: undefined!,
		id: source.context,
		manifestId: source.action
	} satisfies ActionContext;
});
