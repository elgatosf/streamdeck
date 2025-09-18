import { Version } from "./common/version";
import { getSoftwareMinimumVersion } from "./manifest";

/**
 * Validates the {@link streamDeckVersion} and manifest's `Software.MinimumVersion` are at least the {@link minimumVersion}; when the version is not fulfilled, an error is thrown with the
 * {@link feature} formatted into the message.
 * @param minimumVersion Minimum required version.
 * @param streamDeckVersion Actual application version.
 * @param feature Feature that requires the version.
 */
export function requiresVersion(minimumVersion: number, streamDeckVersion: Version, feature: string): never | void {
	const required = {
		major: Math.floor(minimumVersion),
		minor: Number(minimumVersion.toString().split(".").at(1) ?? 0), // Account for JavaScript's floating point precision.
		patch: 0,
		build: 0,
	};

	if (streamDeckVersion.compareTo(required) === -1) {
		throw new Error(
			`[ERR_NOT_SUPPORTED]: ${feature} requires Stream Deck version ${required.major}.${required.minor} or higher, but current version is ${streamDeckVersion.major}.${streamDeckVersion.minor}; please update Stream Deck and the "Software.MinimumVersion" in the plugin's manifest to "${required.major}.${required.minor}" or higher.`,
		);
	} else if (getSoftwareMinimumVersion().compareTo(required) === -1) {
		throw new Error(
			`[ERR_NOT_SUPPORTED]: ${feature} requires Stream Deck version ${required.major}.${required.minor} or higher; please update the "Software.MinimumVersion" in the plugin's manifest to "${required.major}.${required.minor}" or higher.`,
		);
	}
}
