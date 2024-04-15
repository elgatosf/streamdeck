import fs, { Dirent } from "node:fs";
import path from "node:path";
import { LogLevel, Logger } from "../../common/logging";
import { I18nProvider } from "../i18n";
import { logger } from "../logging";

jest.mock("../logging");

describe("I18nProvider", () => {
	/**
	 * Defines a set of mock resources.
	 */
	type MockTranslations = {
		Localization: {
			greeting?: string;
			manifestOnly?: string;
			englishOnly?: string;
			frenchOnly?: string;
			germanOnly?: string;
		};
	};

	const mockedCwd = "c:\\temp";
	const mockedResources = new Map<string, MockTranslations>();
	mockedResources.set("de.json", { Localization: { greeting: "Hello welt", germanOnly: "German" } });
	mockedResources.set("en.json", { Localization: { greeting: "Hello world", englishOnly: "English" } });
	mockedResources.set("fr.json", { Localization: { greeting: "Bonjour le monde", frenchOnly: "French" } });

	let scopedLogger!: Logger;

	beforeEach(() => {
		scopedLogger = new Logger({
			isDebugMode: false,
			level: LogLevel.TRACE,
			target: { write: jest.fn }
		});

		jest.spyOn(logger, "createScope").mockReturnValue(scopedLogger);
		jest.spyOn(process, "cwd").mockReturnValue(mockedCwd);
	});

	afterEach(() => jest.resetAllMocks());

	/**
	 * Asserts {@link I18nProvider} uses a scoped {@link Logger}.
	 */
	it("creates a scoped logger", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValueOnce([] as unknown[] as Dirent[]);
		jest.spyOn(fs, "readFileSync").mockImplementation(() => "{}");

		const createScopeSpy = jest.spyOn(logger, "createScope");

		// Act.
		new I18nProvider("en", logger);

		// Assert.
		expect(createScopeSpy).toHaveBeenCalledTimes(1);
		expect(createScopeSpy).toHaveBeenCalledWith("I18nProvider");
	});

	/**
	 * Asserts {@link I18nProvider} only reads from known languages.
	 */
	it("only reads recognized languages", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValueOnce(["de.json", "en.json", "es.json", "fr.json", "ja.json", "zh_CN.json", "other.json"] as unknown[] as Dirent[]);
		const readFileSyncSpy = jest.spyOn(fs, "readFileSync").mockImplementation(() => "{}");

		// Act.
		const i18n = new I18nProvider("en", logger);
		i18n.translate("test");

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
	 * Asserts {@link I18nProvider} correctly resorts to default language.
	 */
	it("falls back to the default language", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue(["de.json", "en.json", "fr.json"] as unknown[] as Dirent[]);
		jest.spyOn(fs, "readFileSync").mockImplementation((path) => JSON.stringify(mockedResources.get(path as string)));

		const i18n = new I18nProvider("de", logger);

		// Act.
		const greeting = i18n.translate("greeting");
		const englishOnly = i18n.translate("englishOnly");

		// Assert.
		expect(greeting).toBe("Hello welt");
		expect(englishOnly).toBe("English");
	});

	/**
	 * Asserts {@link I18nProvider} returns the key when the resource could not be found in either the current resource, or the default.
	 */
	it("returns the key for an unknown resource (logMissingKey: true)", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue([]);
		jest.spyOn(fs, "readFileSync").mockReturnValue("{}");
		const spyOnWarn = jest.spyOn(scopedLogger, "warn");

		const i18n = new I18nProvider("en", logger);

		// Act.
		i18n.logMissingKey = true;
		const result = i18n.translate("hello");

		// Assert.
		expect(result).toBe("hello");
		expect(spyOnWarn).toHaveBeenCalledTimes(1);
		expect(spyOnWarn).toHaveBeenCalledWith("Missing translation: hello");
	});

	/**
	 * Asserts {@link I18nProvider} returns the key when the resource could not be found in either the current resource, or the default.
	 */
	it("returns the key for an unknown resource (logMissingKey: false)", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue([]);
		jest.spyOn(fs, "readFileSync").mockReturnValue("{}");
		const spyOnWarn = jest.spyOn(scopedLogger, "warn");

		const i18n = new I18nProvider("en", logger);

		// Act.
		i18n.logMissingKey = false;
		const result = i18n.translate("hello");

		// Assert.
		expect(result).toBe("hello");
		expect(spyOnWarn).toHaveBeenCalledTimes(0);
	});

	/**
	 * Asserts {@link I18nProvider} logs to the scoped-logger when a resource file could not be parsed.
	 */
	it("logs when a resource file could not be parsed.", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue(["en.json"] as unknown[] as Dirent[]);
		jest.spyOn(fs, "readFileSync").mockReturnValue("{INVALID}");
		const spyOnError = jest.spyOn(scopedLogger, "error");

		// Act.
		const i18n = new I18nProvider("en", logger);
		i18n.translate("test");

		// Assert.
		expect(spyOnError).toHaveBeenCalledTimes(1);
		expect(spyOnError).toHaveBeenCalledWith("Failed to load translations from en.json", expect.any(Error));
	});

	/**
	 * Asserts {@link I18nProvider} is capable of reading from nested properties.
	 */
	it("translates nested properties", () => {
		// Arrange.
		jest.spyOn(fs, "readdirSync").mockReturnValue(["en.json"] as unknown[] as Dirent[]);
		jest.spyOn(fs, "readFileSync").mockReturnValue(
			JSON.stringify({
				Localization: {
					parent: {
						child: "Hello world"
					}
				}
			})
		);

		const i18n = new I18nProvider("en", logger);

		// Act.
		const result = i18n.translate("parent.child");

		// Assert.
		expect(result).toBe("Hello world");
	});
});
