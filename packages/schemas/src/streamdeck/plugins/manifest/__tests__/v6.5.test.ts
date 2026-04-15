import { validateStreamDeckPluginManifest } from "@tests";

const VERSION = "6.5";

describe("v6.5", () => {
	/**
	 * Asserts a valid v6.5 manifest.
	 */
	test("full manifest", () => {
		// Arrange, act, assert.
		const errors = validateStreamDeckPluginManifest("v6.5.json");
		expect(errors).toHaveLength(0);
	});

	describe("v6.6 features", () => {
		/**
		 * Asserts `Actions[].OS` is not valid for a v6.5 manifest.
		 */
		test("Actions[].OS is not valid in v6.5", () => {
			// Arrange, act, assert.
			const errors = validateStreamDeckPluginManifest("Actions[].OS.json", (m) => (m.Software.MinimumVersion = VERSION));
			expect(errors).toHaveError({
				instancePath: "/Actions/0",
				keyword: "additionalProperties",
				params: {
					additionalProperty: "OS"
				}
			});
		});

		/**
		 * Asserts `Profiles[].AutoInstall` is not valid for a v6.5 manifest.
		 */
		test("Profiles[].AutoInstall is not valid in v6.5", () => {
			// Arrange, act, assert.
			const errors = validateStreamDeckPluginManifest("Profiles[].AutoInstall.json", (m) => (m.Software.MinimumVersion = VERSION));
			expect(errors).toHaveError({
				instancePath: "/Profiles/0",
				keyword: "additionalProperties",
				params: {
					additionalProperty: "AutoInstall"
				}
			});
		});
	});
});
