import { validateStreamDeckPluginManifest } from "@tests";

describe.each(["7.0" as const])("v%s", (version) => {
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

	test("Node.js is optional", () => {
		const errors = validateStreamDeckPluginManifest(`v${version}.json`, (m) => (m.Nodejs = undefined));
		expect(errors).toHaveLength(0);
	});

	describe("Nodejs.Version", () => {
		/**
		 * Asserts Nodejs.Version can be 20.
		 */
		it("can be 20", () => {
			const errors = validateStreamDeckPluginManifest(`v${version}.json`, (m) => (m.Nodejs!.Version = "20"));
			expect(errors).toHaveLength(0);
		});

		/**
		 * Asserts Nodejs.Version can be 24.
		 */
		it("cannot be 24", () => {
			const errors = validateStreamDeckPluginManifest(`v${version}.json`, (m) => (m.Nodejs!.Version = "24"));
			expect(errors).toHaveError({
				keyword: "const",
				instancePath: "/Nodejs/Version",
				params: {
					allowedValue: "20"
				}
			});
		});
	});
});

describe("SupportedInKeyLogicActions", () => {
	/**
	 * Asserts Actions[].SupportedInKeyLogicActions is available in Stream Deck 7.0.
	 */
	it("is supported in 7.0", () => {
		const errors = validateStreamDeckPluginManifest(`v7.0.json`, (m) => (m.Actions[0].SupportedInKeyLogicActions = true));
		expect(errors).toHaveLength(0);
	});

	/**
	 * Asserts Actions[].SupportedInKeyLogicActions is not available in Stream Deck 6.9.
	 */
	it("is not supported in 6.9", () => {
		const errors = validateStreamDeckPluginManifest(`v6.9.json`, (m) => (m.Actions[0].SupportedInKeyLogicActions = true));
		expect(errors).toHaveError({
			keyword: "additionalProperties",
			instancePath: "/Actions/0",
			params: {
				additionalProperty: "SupportedInKeyLogicActions"
			}
		});
	});
});
