import { describe, expect, it, vi } from "vitest";

import type { Language } from "../../api/index.js";
import { I18nProvider } from "../i18n.js";

vi.mock("../logging/index.js");

describe("I18nProvider", () => {
	/**
	 * Asserts {@link I18nProvider} does not load locales unless they are requested.
	 */
	it("lazily evaluates locales", () => {
		// Arrange, act.
		const localeProvider = vi.fn();
		new I18nProvider("en", localeProvider);

		// Assert.
		expect(localeProvider).toHaveBeenCalledTimes(0);
	});

	/**
	 * Asserts {@link I18nProvider} evaluates locales only once.
	 */
	it("loads locales once", () => {
		// Arrange
		const localeProvider = vi.fn().mockReturnValue(null);
		const i18n = new I18nProvider("en", localeProvider);

		// Act.
		i18n.translate("Hello", "en");
		i18n.translate("Hello", "en");
		i18n.translate("Hello", "de");

		// Assert.
		expect(localeProvider).toHaveBeenCalledTimes(2);
		expect(localeProvider).toHaveBeenNthCalledWith(1, "en");
		expect(localeProvider).toHaveBeenNthCalledWith(2, "de");
	});

	/**
	 * Asserts {@link I18nProvider} evaluates locales only once.
	 */
	it("does not load unsupported locales", () => {
		// Arrange
		const localeProvider = vi.fn().mockReturnValue(null);
		const i18n = new I18nProvider("en", localeProvider);

		// Act.
		// @ts-expect-error Testing unsupported language.
		i18n.translate("Hello", "__");

		// Assert.
		expect(localeProvider).toHaveBeenCalledTimes(1);
		expect(localeProvider).toHaveBeenCalledWith("en");
	});

	it("t is alias of translate", () => {
		// Arrange.
		const i18n = new I18nProvider("en", vi.fn());
		const spyOnTranslate = vi.spyOn(i18n, "translate");

		// Act.
		i18n.t("test");
		i18n.t("test", "de");

		// Assert.
		expect(spyOnTranslate).toHaveBeenCalledTimes(2);
		expect(spyOnTranslate).toHaveBeenNthCalledWith(1, "test", "en");
		expect(spyOnTranslate).toHaveBeenNthCalledWith(2, "test", "de");
	});

	describe("translating", () => {
		const localeProvider = vi.fn().mockImplementation((language: Language) => {
			switch (language) {
				case "de":
					return { Hello: "Hello welt" };
				case "en":
					return { Hello: "Hello world", Company: { Name: "Elgato" } };
				default:
					return null;
			}
		});

		/**
		 * Asserts {@link I18nProvider} finds resources from the request language.
		 */
		it("find resources from the requested language", () => {
			// Arrange, act, assert.
			const i18n = new I18nProvider("en", localeProvider);
			expect(i18n.translate("Hello", "de")).toBe("Hello welt");
		});

		/**
		 * Asserts {@link I18nProvider} finds resources from the fallback language.
		 */
		it("finds resources from the default language", () => {
			// Arrange, act, assert.
			const i18n = new I18nProvider("en", localeProvider);
			expect(i18n.translate("Hello", "es")).toBe("Hello world");
		});

		/**
		 * Asserts {@link I18nProvider} returns the key for unknown resources.
		 */
		it("returns the key for unknown resources", () => {
			// Arrange, act, assert.
			const i18n = new I18nProvider("en", localeProvider);
			expect(i18n.translate("Goodbye")).toBe("Goodbye");
		});

		/**
		 * Asserts {@link I18nProvider} is capable of finding nested resources.
		 */
		it("translates nested properties", () => {
			// Arrange, act, assert.
			const i18n = new I18nProvider("en", localeProvider);
			expect(i18n.translate("Company.Name")).toBe("Elgato");
		});

		it("can translate with t alias", () => {
			// Arrange, act, assert.
			const i18n = new I18nProvider("en", localeProvider);
			expect(i18n.t("Company.Name")).toBe("Elgato");
		});
	});
});
