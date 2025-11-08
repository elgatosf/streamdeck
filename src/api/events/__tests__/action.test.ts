/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it } from "vitest";

import { Coordinates, type State, WillAppear, WillDisappear } from "..";
import { Expect, TypesAreEqual } from "../../../../tests/utils";
import { Settings } from "../../__mocks__/events";

describe("action event types", () => {
	/**
	 * Asserts {@link WillAppear} has the correct type structure.
	 */
	it("willAppear", () => {
		type test = Expect<
			TypesAreEqual<
				WillAppear<Settings>,
				{
					readonly action: string;
					readonly event: "willAppear";
					readonly context: string;
					readonly device: string;
					readonly payload:
						| {
								readonly isInMultiAction: false;
								readonly controller: "Encoder" | "Keypad";
								readonly coordinates: Coordinates;
								settings: Settings;
								readonly state?: State;
						  }
						| {
								readonly isInMultiAction: true;
								readonly controller: "Keypad";
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
				{
					readonly action: string;
					readonly event: "willDisappear";
					readonly context: string;
					readonly device: string;
					readonly payload:
						| {
								readonly isInMultiAction: false;
								readonly controller: "Encoder" | "Keypad";
								readonly coordinates: Coordinates;
								settings: Settings;
								readonly state?: State;
						  }
						| {
								readonly isInMultiAction: true;
								readonly controller: "Keypad";
								settings: Settings;
								readonly state?: State;
						  };
				}
			>
		>;
	});
});
