import fs from "node:fs";
import path from "node:path";

import type { Manifest } from "../../api";
import { manifest as mockManifest } from "../__mocks__/manifest";

describe("manifest", () => {
	let getManifest: typeof import("../manifest").getManifest;
	let getSoftwareMinimumVersion: typeof import("../manifest").getSoftwareMinimumVersion;

	beforeEach(async () => ({ getManifest, getSoftwareMinimumVersion } = await require("../manifest")));
	afterEach(() => jest.resetModules());

	describe("getManifest", () => {
		it("Errors when file does not exist", () => {
			// Arrange.
			const existsSync = jest.spyOn(fs, "existsSync").mockReturnValueOnce(false);
			jest.spyOn(process, "cwd").mockReturnValueOnce("test");

			// Act, assert.
			expect(getManifest).toThrowError("Failed to read manifest.json as the file does not exist.");
			expect(existsSync).toHaveBeenCalled();
			expect(existsSync).toHaveBeenCalledWith(path.join("test", "manifest.json"));
		});

		it("Parses the manifest file", () => {
			// Arrange.
			jest.spyOn(fs, "existsSync").mockReturnValue(true);
			jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify(mockManifest));

			// Act.
			const manifest = getManifest();

			// Assert.
			expect(manifest).toEqual(mockManifest);
		});

		it("Errors when the manifest cannot be parsed", () => {
			// Arrange.
			jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
			jest.spyOn(fs, "readFileSync").mockReturnValueOnce("_");

			// Act, assert.
			expect(getManifest).toThrowError("Unexpected token '_', \"_\" is not valid JSON");
		});

		it("Caches the result", () => {
			// Arrange.
			jest.spyOn(fs, "existsSync").mockReturnValue(true);
			const readSpy = jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify(mockManifest));

			// Act.
			const manifestOne = getManifest();
			const manifestTwo = getManifest();

			// Assert.
			expect(manifestOne).toEqual(manifestTwo);
			expect(readSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe("getSoftwareMinimumVersion", () => {
		it("Reads the minimum version from the manifest", () => {
			// Arrange.
			jest.spyOn(fs, "existsSync").mockReturnValue(true);
			const readSpy = jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
				JSON.stringify({
					Software: {
						MinimumVersion: "6.5",
					},
				} satisfies Pick<Manifest, "Software">),
			);

			// Act.
			const version = getSoftwareMinimumVersion();

			// Assert.
			expect(version.major).toEqual(6);
			expect(version.minor).toEqual(5);
			expect(readSpy).toBeCalledTimes(1);
		});

		it("Caches the result", () => {
			// Arrange.
			jest.spyOn(fs, "existsSync").mockReturnValue(true);
			const readSpy = jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify(mockManifest));

			// Act.
			const versionOne = getSoftwareMinimumVersion();
			const versionTwo = getSoftwareMinimumVersion();

			// Assert.
			expect(versionOne).toEqual(versionTwo);
			expect(readSpy).toHaveBeenCalledTimes(1);
		});
	});
});
