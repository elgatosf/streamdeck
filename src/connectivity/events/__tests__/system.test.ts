/* eslint-disable @typescript-eslint/no-unused-vars */
import { DidReceiveDeepLink } from "..";
import { Expect, TypesAreEqual } from "../../../../tests/utils";

describe("system event types", () => {
	/**
	 * Asserts {@link DidReceiveDeepLink} has the correct type structure.
	 */
	it("didReceiveDeepLink", () => {
		type test = Expect<
			TypesAreEqual<
				DidReceiveDeepLink,
				{
					readonly event: "didReceiveDeepLink";
					readonly payload: {
						readonly url: string;
					};
				}
			>
		>;
	});
});
