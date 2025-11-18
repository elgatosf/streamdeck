import * as fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Manifest } from "../../api/index.js";
import { manifest as mockManifest } from "../__mocks__/manifest.js";

vi.mock("node:fs");

describe("manifest", () => {
	let getManifest: typeof import("../manifest.js").getManifest;
	let getSoftwareMinimumVersion: typeof import("../manifest.js").getSoftwareMinimumVersion;

	beforeEach(async () => ({ getManifest, getSoftwareMinimumVersion } = await import("../manifest.js")));
	afterEach(() => vi.resetModules());

	describe("getManifest", () => {
		it("errors when file does not exist", () => {
			// Arrange.
			vi.spyOn(process, "cwd").mockReturnValueOnce("test");

			// Act, assert.
			expect(getManifest).toThrowError("Failed to read manifest.json as the file does not exist.");
			expect(fs.existsSync).toHaveBeenCalled();
			expect(fs.existsSync).toHaveBeenCalledWith(path.join("test", "manifest.json"));
		});

		it("parses the manifest file", () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValue(true);
			vi.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify(mockManifest));

			// Act.
			const manifest = getManifest();

			// Assert.
			expect(manifest).toEqual(mockManifest);
		});

		it("returns null when the manifest cannot be parsed", () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValueOnce(true);
			vi.spyOn(fs, "readFileSync").mockReturnValueOnce("_");

			// Act, assert.
			expect(getManifest()).toEqual(null);
		});

		it("caches the result", () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValue(true);
			const readSpy = vi.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify(mockManifest));

			// Act.
			const manifestOne = getManifest();
			const manifestTwo = getManifest();

			// Assert.
			expect(manifestOne).toEqual(manifestTwo);
			expect(readSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe("getSoftwareMinimumVersion", () => {
		it("reads the minimum version from the manifest", () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValue(true);
			const readSpy = vi.spyOn(fs, "readFileSync").mockReturnValueOnce(
				JSON.stringify({
					Software: {
						MinimumVersion: "6.5",
					},
				} satisfies Pick<Manifest, "Software">),
			);

			// Act.
			const version = getSoftwareMinimumVersion();

			// Assert.
			expect(version!.major).toEqual(6);
			expect(version!.minor).toEqual(5);
			expect(readSpy).toBeCalledTimes(1);
		});

		it("returns null when the manifest cannot be read", () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValue(true);
			vi.spyOn(fs, "readFileSync").mockReturnValueOnce("_");

			// Act, assert.
			expect(getSoftwareMinimumVersion()).toEqual(null);
		});

		it("caches the result", () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValue(true);
			const readSpy = vi.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify(mockManifest));

			// Act.
			const versionOne = getSoftwareMinimumVersion();
			const versionTwo = getSoftwareMinimumVersion();

			// Assert.
			expect(versionOne).toEqual(versionTwo);
			expect(readSpy).toHaveBeenCalledTimes(1);
		});
	});
});
