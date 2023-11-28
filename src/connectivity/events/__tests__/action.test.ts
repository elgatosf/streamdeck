/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Coordinates, State, WillAppear, WillDisappear } from "..";
import { Expect, TypesAreEqual } from "../../../../tests/utils";
import { Settings } from "../../__mocks__/events";

describe("Controller", () => {
	/**
	 * Asserts the values associated with {@link Controller} match Stream Deck values.
	 */
	it("should match Stream Deck payload values", () => {
		expect(Controller.Encoder).toBe("Encoder");
		expect(Controller.Keypad).toBe("Keypad");
	});
});

describe("action event types", () => {
	/**
	 * Asserts {@link WillAppear} has the correct type structure.
	 */
	it("willAppear", () => {
		type test = Expect<
			TypesAreEqual<
				WillAppear<Settings>,
				| {
						readonly action: string;
						readonly event: "willAppear";
						readonly context: string;
						readonly device: string;
						readonly payload: {
							readonly isInMultiAction: false;
							readonly controller: Controller;
							readonly coordinates: Coordinates;
							settings: Settings;
							readonly state?: State;
						};
				  }
				| {
						readonly action: string;
						readonly event: "willAppear";
						readonly context: string;
						readonly device: string;
						readonly payload: {
							readonly isInMultiAction: true;
							readonly controller: Controller.Keypad;
							settings: Settings;
							readonly state?: State;
						};
				  }
			>
		>;
	});

	/**
	 * Asserts {@link WillDisappear} has the correct type structure.
	 */
	it("willDisappear", () => {
		type test = Expect<
			TypesAreEqual<
				WillDisappear<Settings>,
				| {
						readonly action: string;
						readonly event: "willDisappear";
						readonly context: string;
						readonly device: string;
						readonly payload: {
							readonly isInMultiAction: false;
							readonly controller: Controller;
							readonly coordinates: Coordinates;
							settings: Settings;
							readonly state?: State;
						};
				  }
				| {
						readonly action: string;
						readonly event: "willDisappear";
						readonly context: string;
						readonly device: string;
						readonly payload: {
							readonly isInMultiAction: true;
							readonly controller: Controller.Keypad;
							settings: Settings;
							readonly state?: State;
						};
				  }
			>
		>;
	});
});
