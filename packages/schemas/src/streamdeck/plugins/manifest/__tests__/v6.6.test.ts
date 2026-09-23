import { validateStreamDeckPluginManifest } from "@tests";

describe.each(["6.6" as const, "6.7" as const, "6.8" as const])("v%s", (version) => {
	/**
	 * Asserts the full manifest.
	 */
	test("full manifest", () => {
		// Arrange, act, assert.
		const errors = validateStreamDeckPluginManifest(`v${version}.json`);
		expect(errors).toHaveLength(0);
	});

	/**
	 * Asserts more than 2 states are allowed.
	 */
	test("Actions[].States[] allow more than 2 items", () => {
		// Arrange, act, assert.
		const errors = validateStreamDeckPluginManifest(`v${version}.json`, (m) => {
			m.Actions[0].States.push({ Image: "imgs/two" });
			m.Actions[0].States.push({ Image: "imgs/three" });
			m.Actions[0].States.push({ Image: "imgs/four" });
		});
		expect(errors).toHaveLength(0);
	});

	describe(`v${version} feature compatibility`, () => {
		/**
		 * Asserts `Actions[].OS` is not valid for a v6.5 manifest.
		 */
		test("Actions[].OS is valid", () => {
			// Arrange, act, assert.
			const errors = validateStreamDeckPluginManifest("Actions[].OS.json", (m) => (m.Software.MinimumVersion = version));
			expect(errors).toHaveLength(0);
		});

		/**
		 * Asserts `Profiles[].AutoInstall` is not valid for a v6.5 manifest.
		 */
		test("Profiles[].AutoInstall is valid", () => {
			// Arrange, act, assert.
			const errors = validateStreamDeckPluginManifest("Profiles[].AutoInstall.json", (m) => (m.Software.MinimumVersion = version));
			expect(errors).toHaveLength(0);
		});
	});

	describe("SDKVersion", () => {
		/**
		 * Asserts the `SDKVersion` can be `2`.
		 */
		it("can be 2", () => {
			const errors = validateStreamDeckPluginManifest(`v${version}.json`, (m) => {
				m.SDKVersion = 2;
			});

			expect(errors).toHaveLength(0);
		});

		/**
		 * Asserts the `SDKVersion` cannot be `3`.
		 */
		it("cannot be 3", () => {
			const errors = validateStreamDeckPluginManifest(`v${version}.json`, (m) => {
				m.Software.MinimumVersion = version;
				m.SDKVersion = 3;
			});

			expect(errors).toHaveError({
				keyword: "const",
				instancePath: "/SDKVersion",
				params: {
					allowedValue: 2
				}
			});
		});
	});

	/**
	 * Asserts the SupportURL is invalid.
	 */
	test("SupportURL is invalid", () => {
		// Arrange, act.
		const errors = validateStreamDeckPluginManifest("v6.9.json", (m) => (m.Software.MinimumVersion = "6.8"));

		// Assert.
		expect(errors).toHaveError({
			keyword: "additionalProperties",
			instancePath: "/Actions/0",
			params: {
				additionalProperty: "SupportURL"
			}
		});

		expect(errors).toHaveError({
			keyword: "additionalProperties",
			instancePath: "",
			params: {
				additionalProperty: "SupportURL"
			}
		});
	});
});
