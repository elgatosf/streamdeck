import fs from "node:fs";
import path from "node:path";

import { manifest as mockManifest } from "../__mocks__/manifest";
import { getManifest } from "../manifest";

jest.mock("../common/logging");

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
		const json = JSON.stringify(mockManifest);
		jest.spyOn(fs, "existsSync").mockReturnValue(true);
		jest.spyOn(fs, "readFileSync").mockReturnValueOnce(json);

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
});
