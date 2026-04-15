import { validateStreamDeckPluginManifest } from "@tests";

describe.each(["6.9" as const])("v%s", (version) => {
	/**
	 * Asserts the full manifest.
	 */
	test("full manifest", () => {
		// Arrange, act, assert.
		const errors = validateStreamDeckPluginManifest(`v${version}.json`);
		expect(errors).toHaveLength(0);
	});

	describe("SDKVersion", () => {
		/**
		 * Asserts the `SDKVersion` can be `2`.
		 */
		test("can be 2", () => {
			const errors = validateStreamDeckPluginManifest(`v${version}.json`, (m) => (m.SDKVersion = 2));
			expect(errors).toHaveLength(0);
		});

		/**
		 * Asserts the `SDKVersion` can be `3`.
		 */
		test("can be 3", () => {
			const errors = validateStreamDeckPluginManifest(`v${version}.json`, (m) => (m.SDKVersion = 3));
			expect(errors).toHaveLength(0);
		});

		/**
		 * Asserts the `SDKVersion` is within scope.
		 */
		test("cannot be 4", () => {
			const errors = validateStreamDeckPluginManifest(`v${version}.json`, (m) => {
				// @ts-expect-error: To test invalid values
				m.SDKVersion = 4;
			});

			expect(errors).toHaveError({
				keyword: "enum",
				instancePath: "/SDKVersion",
				params: {
					allowedValues: [2, 3]
				}
			});
		});
	});

	test("SupportURL is optional", () => {
		// Arrange, act.
		const errors = validateStreamDeckPluginManifest(`v${version}.json`, (m) => {
			m.Actions[0].SupportURL = undefined;
			m.SupportURL = undefined;
		});

		// Assert.
		expect(errors).toHaveLength(0);
	});
});
