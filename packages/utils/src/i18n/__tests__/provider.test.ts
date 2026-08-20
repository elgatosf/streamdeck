import { describe, expect, it, vi } from "vitest";

import { I18nProvider, type Language } from "../index.js";

type Languages = Language<"de" | "en_US" | "es">;

describe("I18nProvider", () => {
	/**
	 * Asserts {@link I18nProvider} does not load locales unless they are requested.
	 */
	it("lazily evaluates locales", () => {
		// Arrange, act.
		const localeProvider = vi.fn();
		new I18nProvider<Languages>("en", localeProvider);

		// Assert.
		expect(localeProvider).toHaveBeenCalledTimes(0);
	});

	/**
	 * Asserts {@link I18nProvider} evaluates locales only once.
	 */
	it("loads locales once", () => {
		// Arrange
		const localeProvider = vi.fn().mockReturnValue(null);
		const i18n = new I18nProvider<Languages>("en", localeProvider);

		// Act.
		i18n.translate("Hello", "en");
		i18n.translate("Hello", "en");
		i18n.translate("Hello", "de");

		// Assert.
		expect(localeProvider).toHaveBeenCalledTimes(2);
		expect(localeProvider).toHaveBeenNthCalledWith(1, "en");
		expect(localeProvider).toHaveBeenNthCalledWith(2, "de");
	});

	it("t is alias of translate", () => {
		// Arrange.
		const i18n = new I18nProvider<Languages>("en", vi.fn());
		const spyOnTranslate = vi.spyOn(i18n, "translate");

		// Act.
		i18n.t("test");
		i18n.t("test", "de");

		// Assert.
		expect(spyOnTranslate).toHaveBeenCalledTimes(2);
		expect(spyOnTranslate).toHaveBeenNthCalledWith(1, "test", "en");
		expect(spyOnTranslate).toHaveBeenNthCalledWith(2, "test", "de");
	});

	it("emits language change event", () => {
		// Arrange.
		const i18n = new I18nProvider<Languages>("en", vi.fn());
		const listener = vi.fn();

		// Act.
		i18n.onLanguageChange(listener);
		i18n.language = "de";

		// Assert.
		expect(listener).toHaveBeenCalledExactlyOnceWith<[Languages]>("de");
	});

	describe("language changing", () => {
		it("emits event", () => {});
	});

	describe("translating", () => {
		const localeProvider = vi.fn().mockImplementation((language: Languages) => {
			switch (language) {
				case "de":
					return { Hello: "Hallo" };
				case "en":
					return { Hello: "Hello", Company: { Name: "Elgato" } };
				case "en_US":
					return { Hello: "Howdy" };
				default:
					return null;
			}
		});

		/**
		 * Asserts {@link I18nProvider} finds resources from the request language.
		 */
		it("find resources from the requested language", () => {
			// Arrange, act, assert.
			const i18n = new I18nProvider<Languages>("en", localeProvider);
			expect(i18n.translate("Hello", "de")).toBe("Hallo");
		});

		/**
		 * Asserts {@link I18nProvider} finds resources from the request language with regionalized languages.
		 */
		it("find resources from the requested language with regional variants", () => {
			// Arrange, act, assert.
			const i18n = new I18nProvider<Languages>("en", localeProvider);
			expect(i18n.translate("Hello", "en")).toBe("Hello");
		});

		/**
		 * Asserts {@link I18nProvider} finds resources from
		 */
		it("finds resources in other regions", () => {
			// Arrange, act, assert.
			const i18n = new I18nProvider<Languages>("en", localeProvider);
			expect(i18n.translate("Hello", "en_US")).toBe("Howdy");
		});

		/**
		 * Asserts {@link I18nProvider} finds resources from the fallback language.
		 */
		it("finds resources from the default language", () => {
			// Arrange, act, assert.
			const i18n = new I18nProvider<Languages>("en", localeProvider);
			expect(i18n.translate("Hello", "es")).toBe("Hello");
		});

		/**
		 * Asserts {@link I18nProvider} returns the key for unknown resources.
		 */
		it("returns the key for unknown resources", () => {
			// Arrange, act, assert.
			const i18n = new I18nProvider<Languages>("en", localeProvider);
			expect(i18n.translate("Goodbye")).toBe("Goodbye");
		});

		/**
		 * Asserts {@link I18nProvider} is capable of finding nested resources.
		 */
		it("translates nested properties", () => {
			// Arrange, act, assert.
			const i18n = new I18nProvider<Languages>("en", localeProvider);
			expect(i18n.translate("Company.Name", "en_US")).toBe("Elgato");
		});

		/**
		 * Asserts {@link I18nProvider} translates using the alias.
		 */
		it("can translate with t alias", () => {
			// Arrange, act, assert.
			const i18n = new I18nProvider<Languages>("en", localeProvider);
			expect(i18n.t("Company.Name")).toBe("Elgato");
		});
	});
});
