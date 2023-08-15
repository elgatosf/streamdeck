import fs, { Dirent } from "node:fs";
import path from "node:path";

import { getMockedLogging } from "../../test/mocks/logging";
import { I18nProvider } from "../i18n";

describe("I18nProvider", () => {
	/**
	 * Defines a set of mock resources.
	 */
	type MockTranslations = {
		greeting?: string;
		manifestOnly?: string;
		englishOnly?: string;
		frenchOnly?: string;
		germanOnly?: string;
	};

	const mockedCwd = "c:\\temp";
	const mockedResources = new Map<string, MockTranslations>();
	mockedResources.set("de.json", { greeting: "Hello welt", germanOnly: "German" });
	mockedResources.set("en.json", { greeting: "Hello world", englishOnly: "English" });
	mockedResources.set("fr.json", { greeting: "Bonjour le monde", frenchOnly: "French" });
	mockedResources.set(path.join(mockedCwd, "manifest.json"), { greeting: "This should never be used", manifestOnly: "Manifest" });

	beforeEach(() => jest.spyOn(process, "cwd").mockReturnValue(mockedCwd));

	afterEach(() => jest.resetAllMocks());

	it("Only reads recognized languages", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValueOnce(["de.json", "en.json", "es.json", "fr.json", "ja.json", "zh_CN.json", "other.json"] as unknown[] as Dirent[]);
		const readFileSyncSpy = jest.spyOn(fs, "readFileSync").mockImplementation(() => "{}");

		const { loggerFactory } = getMockedLogging();

		// Act.
		const i18n = new I18nProvider("en", loggerFactory);

		// Assert.
		expect(readFileSyncSpy).toHaveBeenCalledTimes(7);

		const opts = { flag: "r" };
		expect(readFileSyncSpy).toHaveBeenCalledWith("de.json", opts);
		expect(readFileSyncSpy).toHaveBeenCalledWith("en.json", opts);
		expect(readFileSyncSpy).toHaveBeenCalledWith("es.json", opts);
		expect(readFileSyncSpy).toHaveBeenCalledWith("fr.json", opts);
		expect(readFileSyncSpy).toHaveBeenCalledWith("ja.json", opts);
		expect(readFileSyncSpy).toHaveBeenCalledWith("zh_CN.json", opts);
		expect(readFileSyncSpy).not.toHaveBeenCalledWith("other.json", opts);
		expect(readFileSyncSpy).toHaveBeenCalledWith(path.join(process.cwd(), "manifest.json"), opts);
	});

	it("Merges manifest into English", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue(["de.json", "en.json", "fr.json"] as unknown[] as Dirent[]);
		jest.spyOn(fs, "readFileSync").mockImplementation((path) => JSON.stringify(mockedResources.get(path as string)));

		const { loggerFactory } = getMockedLogging();
		const i18n = new I18nProvider("en", loggerFactory);

		// Act.
		const greeting = i18n.translate("greeting");
		const manifestOnly = i18n.translate("manifestOnly");

		// Assert.
		expect(greeting).toBe("Hello world");
		expect(manifestOnly).toBe("Manifest");
	});

	it("Falls back to the default language", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue(["de.json", "en.json", "fr.json"] as unknown[] as Dirent[]);
		jest.spyOn(fs, "readFileSync").mockImplementation((path) => JSON.stringify(mockedResources.get(path as string)));

		const { loggerFactory } = getMockedLogging();
		const i18n = new I18nProvider("de", loggerFactory);

		// Act.
		const greeting = i18n.translate("greeting");
		const englishOnly = i18n.translate("englishOnly");
		const manifestOnly = i18n.translate("manifestOnly");

		// Assert.
		expect(greeting).toBe("Hello welt");
		expect(englishOnly).toBe("English");
		expect(manifestOnly).toBe("Manifest");
	});

	it("Returns empty string for unknown key (logMissingKey: true)", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue([]);
		jest.spyOn(fs, "readFileSync").mockReturnValue("{}");

		const { loggerFactory, logger } = getMockedLogging();
		const i18n = new I18nProvider("en", loggerFactory);

		// Act.
		i18n.logMissingKey = true;
		const result = i18n.translate("hello");

		// Assert.
		expect(result).toBe("");
		expect(logger.warn).toHaveBeenCalledTimes(1);
		expect(logger.warn).toHaveBeenCalledWith("Missing translation: hello");
	});

	it("Returns empty string for unknown key (logMissingKey: false)", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue([]);
		jest.spyOn(fs, "readFileSync").mockReturnValue("{}");

		const { loggerFactory, logger } = getMockedLogging();
		const i18n = new I18nProvider("en", loggerFactory);

		// Act.
		i18n.logMissingKey = false;
		const result = i18n.translate("hello");

		// Assert.
		expect(result).toBe("");
		expect(logger.warn).toHaveBeenCalledTimes(0);
	});

	it("Logs when a resource file could not be parsed.", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue(["en.json"] as unknown[] as Dirent[]);
		jest.spyOn(fs, "readFileSync").mockReturnValue("{INVALID}");
		const { loggerFactory, logger } = getMockedLogging();

		// Act.
		const i18n = new I18nProvider("en", loggerFactory);

		// Assert.
		expect(logger.error).toHaveBeenCalledTimes(2);
		expect(logger.error).toHaveBeenCalledWith("Failed to load translations from en.json", expect.any(Error));
		expect(logger.error).toHaveBeenCalledWith(`Failed to load translations from ${path.join(mockedCwd, "manifest.json")}`, expect.any(Error));
	});

	it("Translates nested properties", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue(["en.json"] as unknown[] as Dirent[]);
		jest.spyOn(fs, "readFileSync").mockReturnValue(
			JSON.stringify({
				parent: {
					child: "Hello world"
				}
			})
		);

		const { loggerFactory } = getMockedLogging();
		const i18n = new I18nProvider("en", loggerFactory);

		// Act.
		const result = i18n.translate("parent.child");

		// Assert.
		expect(result).toBe("Hello world");
	});
});
