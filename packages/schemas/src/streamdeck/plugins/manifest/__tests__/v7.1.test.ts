import { validateStreamDeckPluginManifest } from "@tests";

describe.each(["7.1" as const, "7.2" as const, "7.3" as const, "7.4" as const])("v%s", (version) => {
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
		it("can be 24", () => {
			const errors = validateStreamDeckPluginManifest(`v${version}.json`, (m) => (m.Nodejs!.Version = "24"));
			expect(errors).toHaveLength(0);
		});

		/**
		 * Asserts Node.js version cannot be 21.
		 */
		it("cannot be 21", () => {
			const errors = validateStreamDeckPluginManifest(`v${version}.json`, (m) => {
				// @ts-expect-error Check invalid value
				m.Nodejs!.Version = "21";
			});

			expect(errors).toHaveError({
				keyword: "enum",
				instancePath: "/Nodejs/Version",
				params: {
					allowedValues: ["20", "24"]
				}
			});
		});
	});
});
