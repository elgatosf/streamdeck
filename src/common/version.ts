/**
 * Provides information for a version, as parsed from a string denoted as a collection of numbers separated by a period, for example `1.45.2`, `4.0.2.13098`. Parsing is opinionated
 * and strings should strictly conform to the format `{major}[.{minor}[.{patch}[.{build}]]]`; version numbers that form the version are optional, and when `undefined` will default to
 * 0, for example the `minor`, `patch`, or `build` number may be omitted. **NB** This implementation should be considered fit-for-purpose, and should be used sparing.
 */
export class Version {
	/**
	 * Build version number.
	 */
	public readonly build: number;

	/**
	 * Major version number.
	 */
	public readonly major: number;

	/**
	 * Minor version number.
	 */
	public readonly minor: number;

	/**
	 * Patch version number.
	 */
	public readonly patch: number;

	/**
	 * Initializes a new instance of the {@link Version} class.
	 * @param value Value to parse the version from.
	 */
	constructor(value: string) {
		const result = value.match(/^(0|[1-9]\d*)(?:\.(0|[1-9]\d*))?(?:\.(0|[1-9]\d*))?(?:\.(0|[1-9]\d*))?$/);
		if (result === null) {
			throw new Error(`Invalid format; expected "{major}[.{minor}[.{patch}[.{build}]]]" but was "${value}"`);
		}

		[, this.major, this.minor, this.patch, this.build] = [...result.map<number>((value) => parseInt(value) || 0)];
	}

	/**
	 * Compares this instance to the {@link other} {@link Version}.
	 * @param other The {@link Version} to compare to.
	 * @returns `-1` when this instance is less than the {@link other}, `1` when this instance is greater than {@link other}, otherwise `0`.
	 */
	public compareTo(other: VersionInfo): number {
		const segments = ({ major, minor, build, patch }: VersionInfo): number[] => [major, minor, build, patch];

		const thisSegments = segments(this);
		const otherSegments = segments(other);

		for (let i = 0; i < 4; i++) {
			if (thisSegments[i] < otherSegments[i]) {
				return -1;
			} else if (thisSegments[i] > otherSegments[i]) {
				return 1;
			}
		}

		return 0;
	}

	/** @inheritdoc */
	public toString(): string {
		return `${this.major}.${this.minor}`;
	}
}

/**
 * Numerical version values associated with a {@link Version}.
 */
type VersionInfo = Pick<Version, "build" | "major" | "minor" | "patch">;
