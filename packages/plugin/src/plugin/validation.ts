import { Version } from "./common/version.js";
import { getSDKVersion, getSoftwareMinimumVersion } from "./manifest.js";

/**
 * Validates the `SDKVersion` within the manifest fulfils the minimum required version for the specified
 * feature; when the version is not fulfilled, an error is thrown with the feature formatted into the message.
 * @param minimumVersion Minimum required SDKVersion.
 * @param feature Feature that requires the version.
 */
export function requiresSDKVersion(minimumVersion: number, feature: string): never | void {
	const sdkVersion = getSDKVersion();
	if (sdkVersion !== null && minimumVersion > sdkVersion) {
		throw new Error(
			`[ERR_NOT_SUPPORTED]: ${feature} requires manifest SDK version ${minimumVersion} or higher, but found version ${sdkVersion}; please update the "SDKVersion" in the plugin's manifest to ${minimumVersion} or higher.`,
		);
	}
}

/**
 * Validates the {@link streamDeckVersion} and manifest's `Software.MinimumVersion` are at least the {@link minimumVersion};
 * when the version is not fulfilled, an error is thrown with the {@link feature} formatted into the message.
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
	}

	const softwareMinimumVersion = getSoftwareMinimumVersion();
	if (softwareMinimumVersion !== null && softwareMinimumVersion.compareTo(required) === -1) {
		throw new Error(
			`[ERR_NOT_SUPPORTED]: ${feature} requires Stream Deck version ${required.major}.${required.minor} or higher; please update the "Software.MinimumVersion" in the plugin's manifest to "${required.major}.${required.minor}" or higher.`,
		);
	}
}
