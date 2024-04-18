import fs from "node:fs";
import path from "node:path";
import { fileSystemLocaleProvider } from "../i18n";
import { logger } from "../logging";

jest.mock("../logging");

describe("I18nProvider", () => {
	const mockedCwd = "c:\\temp";

	beforeEach(() => jest.spyOn(process, "cwd").mockReturnValue(mockedCwd));
	afterEach(() => jest.resetAllMocks());

	/**
	 * Assert {@link fileSystemLocaleProvider} parses translation files.
	 */
	it("reads from the language JSON file", () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(true);
		const spyOnReadFileSync = jest.spyOn(fs, "readFileSync").mockReturnValue(
			JSON.stringify({
				Localization: {
					Hello: "Hello world"
				}
			})
		);

		// Act.
		const translations = fileSystemLocaleProvider("de");

		// Assert.
		expect(translations).toEqual({ Hello: "Hello world" });
		expect(spyOnReadFileSync).toHaveBeenCalledTimes(1);
		expect(spyOnReadFileSync).toHaveBeenCalledWith(path.join(mockedCwd, "de.json"), { flag: "r" });
	});

	/**
	 * Assert {@link fileSystemLocaleProvider} returns null when the translation file does not exist.
	 */
	it("returns null when the file is not found", () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(false);
		const spyOnReadFileSync = jest.spyOn(fs, "readFileSync");

		// Act.
		const translations = fileSystemLocaleProvider("en");

		// Assert.
		expect(translations).toBeNull();
		expect(spyOnReadFileSync).toHaveBeenCalledTimes(0);
	});

	/**
	 * Assert {@link fileSystemLocaleProvider} returns null, and logs an error, when the contents of the file are not JSON.
	 */
	it("logs an error when the contents are not JSON", () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(true);
		const spyOnReadFileSync = jest.spyOn(fs, "readFileSync").mockReturnValue(`{"value":invalid}`);
		const spyOnLogError = jest.spyOn(logger, "error");

		// Act.
		const translations = fileSystemLocaleProvider("es");

		// Assert.
		expect(translations).toBeNull();
		expect(spyOnReadFileSync).toHaveBeenCalledTimes(1);
		expect(spyOnLogError).toHaveBeenCalledTimes(1);
		expect(spyOnLogError).toHaveBeenCalledWith(`Failed to load translations from ${path.join(mockedCwd, "es.json")}`, expect.any(SyntaxError));
	});

	/**
	 * Assert {@link fileSystemLocaleProvider} returns null, and logs an error, when the contents of the file are not the expected structure.
	 */
	it("logs an error when the structure is incorrect", () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(true);
		const spyOnReadFileSync = jest.spyOn(fs, "readFileSync").mockReturnValue(`{"NotLocalization":"Incorrect format"}`);
		const spyOnLogError = jest.spyOn(logger, "error");

		// Act.
		const translations = fileSystemLocaleProvider("ja");

		// Assert.
		expect(translations).toBeNull();
		expect(spyOnReadFileSync).toHaveBeenCalledTimes(1);
		expect(spyOnLogError).toHaveBeenCalledTimes(1);
		expect(spyOnLogError).toHaveBeenCalledWith(`Failed to load translations from ${path.join(mockedCwd, "ja.json")}`, expect.any(TypeError));
	});
});
