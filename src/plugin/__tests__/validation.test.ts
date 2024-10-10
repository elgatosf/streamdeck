import { Version } from "../common/version";
import * as ManifestModule from "../manifest";
import { requiresVersion } from "../validation";

jest.mock("../manifest");
/**
 * Provides assertions for {@link requiresVersion}.
 */
describe("requiresVersion", () => {
	describe("validates application version", () => {
		beforeEach(() => jest.spyOn(ManifestModule, "getSoftwareMinimumVersion").mockReturnValue(new Version("6.5")));

		it("handles same versions", () => {
			// Arrange, act, assert.
			const appVersion = new Version("6.5.0.123");
			expect(() => requiresVersion(6.5, appVersion, "Test")).not.toThrow();
		});

		it("handles newer versions", () => {
			// Arrange, act, assert.
			const appVersion = new Version("99.0.0.0");
			expect(() => requiresVersion(6.5, appVersion, "Test")).not.toThrow();
		});

		it("throws older version", () => {
			// Arrange, act, assert.
			const appVersion = new Version("1.0.0.0");
			expect(() => requiresVersion(99, appVersion, "Test")).toThrow(
				`[ERR_NOT_SUPPORTED]: Test requires Stream Deck version 99.0 or higher, but current version is 1.0; please update Stream Deck and the "Software.MinimumVersion" in the plugin's manifest to "99.0" or higher.`,
			);
		});
	});

	describe("validates Software.MinimumVersion defined within the manifest", () => {
		const appVersion = new Version("99.0");

		it("handles same versions", () => {
			// Arrange, act, assert.
			jest.spyOn(ManifestModule, "getSoftwareMinimumVersion").mockReturnValue(new Version("6.5"));
			expect(() => requiresVersion(6.5, appVersion, "Test")).not.toThrow();
		});

		it("handles newer versions", () => {
			jest.spyOn(ManifestModule, "getSoftwareMinimumVersion").mockReturnValue(new Version("99.0"));
			expect(() => requiresVersion(6.5, appVersion, "Test")).not.toThrow();
		});

		it("throws older version", () => {
			// Arrange, act, assert.
			jest.spyOn(ManifestModule, "getSoftwareMinimumVersion").mockReturnValue(new Version("1.0"));
			expect(() => requiresVersion(99, appVersion, "Test")).toThrow(
				`[ERR_NOT_SUPPORTED]: Test requires Stream Deck version 99.0 or higher; please update the "Software.MinimumVersion" in the plugin's manifest to "99.0" or higher.`,
			);
		});
	});
});
