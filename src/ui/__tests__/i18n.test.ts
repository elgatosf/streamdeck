/**
 * @jest-environment jsdom
 */

jest.mock("../logging");

/**
 * Provides assertions for the singleton `i18n`.
 */
describe("i18n", () => {
	afterEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	/**
	 * Asserts the default language is determined from the window's navigator language value.
	 */
	it("should use navigator language as default", async () => {
		// Arrange.
		const mockedXMLHttpRequest = {
			open: jest.fn(),
			send: jest.fn(),
			response: JSON.stringify({ Localization: { Hello: "Hallo Welt" } })
		};

		jest.spyOn(window, "location", "get").mockReturnValue({ href: "file:///c:/temp/com.elgato.test.sdPlugin/ui/pi.html" } as unknown as Location);
		jest.spyOn(window, "XMLHttpRequest").mockImplementation(() => mockedXMLHttpRequest as unknown as XMLHttpRequest);
		jest.spyOn(window.navigator, "language", "get").mockReturnValue("de");

		const { i18n } = (await require("../i18n")) as typeof import("../i18n");

		// Act.
		const result = i18n.translate("Hello");

		// Assert.
		expect(result).toBe("Hallo Welt");
		expect(mockedXMLHttpRequest.open).toHaveBeenCalledTimes(1);
		expect(mockedXMLHttpRequest.open).toHaveBeenCalledWith("GET", "file:///c:/temp/com.elgato.test.sdPlugin/de.json", false);
	});

	/**
	 * Asserts the default language is determined from the window's navigator language value, when the language contains the region.
	 */
	it("should ignore localized navigation language", async () => {
		// Arrange.
		const mockedXMLHttpRequest = {
			open: jest.fn(),
			send: jest.fn(),
			response: JSON.stringify({ Localization: { Hello: "Hello world" } })
		};

		jest.spyOn(window, "location", "get").mockReturnValue({ href: "file:///c:/temp/com.elgato.test.sdPlugin/ui/pi.html" } as unknown as Location);
		jest.spyOn(window, "XMLHttpRequest").mockImplementation(() => mockedXMLHttpRequest as unknown as XMLHttpRequest);
		jest.spyOn(window.navigator, "language", "get").mockReturnValue("en-US");

		const { i18n } = (await require("../i18n")) as typeof import("../i18n");

		// Act.
		const result = i18n.translate("Hello");

		// Assert.
		expect(result).toBe("Hello world");
		expect(mockedXMLHttpRequest.open).toHaveBeenCalledTimes(1);
		expect(mockedXMLHttpRequest.open).toHaveBeenCalledWith("GET", "file:///c:/temp/com.elgato.test.sdPlugin/en.json", false);
	});
});

/**
 * Provides assertions for loading locale translations using `xmlHttpRequestLocaleProviderSync`.
 */
describe("xmlHttpRequestLocaleProviderSync", () => {
	let xmlHttpRequestLocaleProviderSync: typeof import("../i18n").xmlHttpRequestLocaleProviderSync;

	beforeEach(async () => {
		jest.spyOn(window, "location", "get").mockReturnValue({ href: "file:///c:/temp/com.elgato.test.sdPlugin/ui/pi.html" } as unknown as Location);
		({ xmlHttpRequestLocaleProviderSync } = await require("../i18n"));
	});

	afterEach(() => jest.resetAllMocks());

	/**
	 * Assert `xmlHttpRequestLocaleProviderSync` parses translation files.
	 */
	it("reads from the language JSON file", () => {
		// Arrange.
		const mockedXMLHttpRequest = {
			open: jest.fn(),
			send: jest.fn(),
			response: JSON.stringify({
				Localization: {
					Hello: "Hello world"
				}
			})
		};

		jest.spyOn(window, "XMLHttpRequest").mockImplementation(() => mockedXMLHttpRequest as unknown as XMLHttpRequest);

		// Act.
		const translations = xmlHttpRequestLocaleProviderSync("en");

		// Assert.
		expect(translations).toEqual({ Hello: "Hello world" });
		expect(mockedXMLHttpRequest.open).toHaveBeenCalledTimes(1);
		expect(mockedXMLHttpRequest.open).toHaveBeenCalledWith("GET", "file:///c:/temp/com.elgato.test.sdPlugin/en.json", false);
		expect(mockedXMLHttpRequest.send).toHaveBeenCalledTimes(1);
	});

	/**
	 * Assert `xmlHttpRequestLocaleProviderSync` returns null when the translation file does not exist.
	 */
	it("returns null when the file is not found", () => {
		// Arrange.
		const mockedXMLHttpRequest = {
			open: jest.fn(),
			send: jest.fn().mockImplementation(() => {
				throw new DOMException(undefined, "NOT_FOUND_ERR");
			}),
			response: null
		};

		jest.spyOn(window, "XMLHttpRequest").mockImplementation(() => mockedXMLHttpRequest as unknown as XMLHttpRequest);
		const spyOnConsoleWarn = jest.spyOn(console, "warn").mockImplementationOnce(() => {});

		// Act.
		const translations = xmlHttpRequestLocaleProviderSync("de");

		// Assert.
		expect(translations).toBeNull();
		expect(spyOnConsoleWarn).toHaveBeenCalledTimes(1);
		expect(spyOnConsoleWarn).toHaveBeenCalledWith("Missing localization file: de.json");
	});

	/**
	 * Assert `xmlHttpRequestLocaleProviderSync` returns null, and logs an error, when the contents of the file are not JSON.
	 */
	it("logs an error when the contents are not JSON", async () => {
		// Arrange.
		const mockedXMLHttpRequest = {
			open: jest.fn(),
			send: jest.fn(),
			response: `{"value":invalid}`
		};

		jest.spyOn(window, "XMLHttpRequest").mockImplementation(() => mockedXMLHttpRequest as unknown as XMLHttpRequest);
		const { logger } = await require("../logging");
		const spyOnLogError = jest.spyOn(logger, "error");

		// Act.
		const translations = xmlHttpRequestLocaleProviderSync("es");

		// Assert.
		expect(translations).toBeNull();
		expect(spyOnLogError).toHaveBeenCalledTimes(1);
		expect(spyOnLogError).toHaveBeenCalledWith("Failed to load translations from file:///c:/temp/com.elgato.test.sdPlugin/es.json", expect.any(SyntaxError));
	});

	/**
	 * Assert `xmlHttpRequestLocaleProviderSync` returns null, and logs an error, when the contents of the file are not the expected structure.
	 */
	it("logs an error when the structure is incorrect", async () => {
		// Arrange.
		const mockedXMLHttpRequest = {
			open: jest.fn(),
			send: jest.fn(),
			response: `{"NotLocalization":"Incorrect format"}`
		};

		jest.spyOn(window, "XMLHttpRequest").mockImplementation(() => mockedXMLHttpRequest as unknown as XMLHttpRequest);
		const { logger } = await require("../logging");
		const spyOnLogError = jest.spyOn(logger, "error");

		// Act.
		const translations = xmlHttpRequestLocaleProviderSync("ja");

		// Assert.
		expect(translations).toBeNull();
		expect(spyOnLogError).toHaveBeenCalledTimes(1);
		expect(spyOnLogError).toHaveBeenCalledWith(`Failed to load translations from file:///c:/temp/com.elgato.test.sdPlugin/ja.json`, expect.any(TypeError));
	});
});

/**
 * Provides assertions for `cwd()`.
 */
describe("cwd", () => {
	let cwd: typeof import("../i18n").cwd;
	beforeAll(async () => ({ cwd } = await require("../i18n")));

	it("should find folder ending in .sdPlugin", () => {
		// Arrange, act, asset.
		jest.spyOn(window, "location", "get").mockReturnValue({ href: "file:///c:/plugins/com.elgato.test.sdPlugin/pi.html" } as unknown as Location);
		expect(cwd()).toBe("file:///c:/plugins/com.elgato.test.sdPlugin/");
	});

	it("should return the entire path minus the file when .sdPlugin not found", () => {
		// Arrange, act, asset.
		jest.spyOn(window, "location", "get").mockReturnValue({ href: "file:///c:/test/folder/ui/pi.html" } as unknown as Location);
		expect(cwd()).toBe("file:///c:/test/folder/ui/");
	});
});
