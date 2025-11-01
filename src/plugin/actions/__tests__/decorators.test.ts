import { describe, expect, it } from "vitest";

import { action } from "../decorators";
import { SingletonAction } from "../singleton-action";

describe("action decorator", () => {
	it("sets the manifestId on untyped action", () => {
		// Arrange.
		@action({ UUID: "com.elgato.test.sample" })
		class SampleAction extends SingletonAction {
			/** @inheritdoc */
			public onWillAppear(): void {
				/* do something cool */
			}
		}

		// Act.
		const sample = new SampleAction();

		// Assert.
		expect(sample.manifestId).toBe("com.elgato.test.sample");
	});

	it("sets the manifestId on typed action", () => {
		// Arrange.
		@action({ UUID: "com.elgato.test.sample" })
		class SampleAction extends SingletonAction<Settings> {
			/** @inheritdoc */
			public onWillAppear(): void {
				/* do something cool */
			}
		}

		// Act.
		const sample = new SampleAction();

		// Assert.
		expect(sample.manifestId).toBe("com.elgato.test.sample");
	});
});

/**
 * Mock settings.
 */
type Settings = {
	name: string;
};
