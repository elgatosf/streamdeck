import fs, { Dirent } from "node:fs";
import path from "node:path";

import { getMockedLogger } from "../../tests/__mocks__/logging";
import type { Manifest } from "../api/manifest";
import { I18nProvider } from "../i18n";
import type { Logger } from "../logging";

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

	const mockedManifest = {
		greeting: "This should never be used",
		manifestOnly: "Manifest"
	} as unknown as Manifest;

	beforeEach(() => jest.spyOn(process, "cwd").mockReturnValue(mockedCwd));
	afterEach(() => jest.restoreAllMocks());

	/**
	 * Asserts {@link I18nProvider} uses a scoped {@link Logger}.
	 */
	it("Creates a scoped logger", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValueOnce([] as unknown[] as Dirent[]);
		jest.spyOn(fs, "readFileSync").mockImplementation(() => "{}");

		const { logger } = getMockedLogger();
		const createScopeSpy = jest.spyOn(logger, "createScope");

		// Act.
		new I18nProvider("en", mockedManifest, logger);

		// Assert.
		expect(createScopeSpy).toHaveBeenCalledTimes(1);
		expect(createScopeSpy).toHaveBeenCalledWith("I18nProvider");
	});

	/**
	 * Asserts {@link I18nProvider} only reads from known languages.
	 */
	it("Only reads recognized languages", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValueOnce(["de.json", "en.json", "es.json", "fr.json", "ja.json", "zh_CN.json", "other.json"] as unknown[] as Dirent[]);
		const readFileSyncSpy = jest.spyOn(fs, "readFileSync").mockImplementation(() => "{}");

		const { logger } = getMockedLogger();

		// Act.
		new I18nProvider("en", mockedManifest, logger);

		// Assert.
		expect(readFileSyncSpy).toHaveBeenCalledTimes(6);

		const opts = { flag: "r" };
		expect(readFileSyncSpy).toHaveBeenCalledWith("de.json", opts);
		expect(readFileSyncSpy).toHaveBeenCalledWith("en.json", opts);
		expect(readFileSyncSpy).toHaveBeenCalledWith("es.json", opts);
		expect(readFileSyncSpy).toHaveBeenCalledWith("fr.json", opts);
		expect(readFileSyncSpy).toHaveBeenCalledWith("ja.json", opts);
		expect(readFileSyncSpy).toHaveBeenCalledWith("zh_CN.json", opts);
		expect(readFileSyncSpy).not.toHaveBeenCalledWith("other.json", opts);
		expect(readFileSyncSpy).not.toHaveBeenCalledWith(path.join(process.cwd(), "manifest.json"), opts);
	});

	/**
	 * Asserts {@link I18nProvider} merges the manifest (resources) into the custom English resources.
	 */
	it("Merges manifest into English", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue(["de.json", "en.json", "fr.json"] as unknown[] as Dirent[]);
		jest.spyOn(fs, "readFileSync").mockImplementation((path) => JSON.stringify(mockedResources.get(path as string)));

		const { logger } = getMockedLogger();
		const i18n = new I18nProvider("en", mockedManifest, logger);

		// Act.
		const greeting = i18n.translate("greeting");
		const manifestOnly = i18n.translate("manifestOnly");

		// Assert.
		expect(greeting).toBe("Hello world");
		expect(manifestOnly).toBe("Manifest");
	});

	/**
	 * Asserts {@link I18nProvider} correctly resorts to default language.
	 */
	it("Falls back to the default language", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue(["de.json", "en.json", "fr.json"] as unknown[] as Dirent[]);
		jest.spyOn(fs, "readFileSync").mockImplementation((path) => JSON.stringify(mockedResources.get(path as string)));

		const { logger } = getMockedLogger();
		const i18n = new I18nProvider("de", mockedManifest, logger);

		// Act.
		const greeting = i18n.translate("greeting");
		const englishOnly = i18n.translate("englishOnly");
		const manifestOnly = i18n.translate("manifestOnly");

		// Assert.
		expect(greeting).toBe("Hello welt");
		expect(englishOnly).toBe("English");
		expect(manifestOnly).toBe("Manifest");
	});

	/**
	 * Asserts {@link I18nProvider} returns an empty string when the resource could not be found in either the current resource, or the default.
	 */
	it("Returns empty string for unknown key (logMissingKey: true)", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue([]);
		jest.spyOn(fs, "readFileSync").mockReturnValue("{}");

		const { logger, scopedLogger } = getMockedLogger();
		const i18n = new I18nProvider("en", mockedManifest, logger);

		// Act.
		i18n.logMissingKey = true;
		const result = i18n.translate("hello");

		// Assert.
		expect(result).toBe("");
		expect(scopedLogger.warn).toHaveBeenCalledTimes(1);
		expect(scopedLogger.warn).toHaveBeenCalledWith("Missing translation: hello");
	});

	/**
	 * Asserts {@link I18nProvider} returns an empty string when the resource could not be found in either the current resource, or the default.
	 */
	it("Returns empty string for unknown key (logMissingKey: false)", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue([]);
		jest.spyOn(fs, "readFileSync").mockReturnValue("{}");

		const { logger, scopedLogger } = getMockedLogger();
		const i18n = new I18nProvider("en", mockedManifest, logger);

		// Act.
		i18n.logMissingKey = false;
		const result = i18n.translate("hello");

		// Assert.
		expect(result).toBe("");
		expect(scopedLogger.warn).toHaveBeenCalledTimes(0);
	});

	/**
	 * Asserts {@link I18nProvider} logs to the scoped-logger when a resource file could not be parsed.
	 */
	it("Logs when a resource file could not be parsed.", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue(["en.json"] as unknown[] as Dirent[]);
		jest.spyOn(fs, "readFileSync").mockReturnValue("{INVALID}");
		const { logger, scopedLogger } = getMockedLogger();

		// Act.
		new I18nProvider("en", mockedManifest, logger);

		// Assert.
		expect(scopedLogger.error).toHaveBeenCalledTimes(1);
		expect(scopedLogger.error).toHaveBeenCalledWith("Failed to load translations from en.json", expect.any(Error));
	});

	/**
	 * Asserts {@link I18nProvider} is capable of reading from nested properties.
	 */
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

		const { logger } = getMockedLogger();
		const i18n = new I18nProvider("en", mockedManifest, logger);

		// Act.
		const result = i18n.translate("parent.child");

		// Assert.
		expect(result).toBe("Hello world");
	});
});
