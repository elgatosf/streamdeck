import { DialAction } from "../dial";
import { KeyAction } from "../key";

const key = new KeyAction({
	id: "key123",
	manifestId: "com.elgato.test.key",
	coordinates: {
		column: 1,
		row: 1
	},
	device: undefined!
});

const dial = new DialAction({
	id: "dial123",
	manifestId: "com.elgato.test.dial",
	coordinates: {
		column: 1,
		row: 1
	},
	device: undefined!
});

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

export const initializeStore = jest.fn();
