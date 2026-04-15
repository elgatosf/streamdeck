import { validateStreamDeckPluginManifest } from "@tests";

describe.each(["v6.4", "v6.5", "v6.6", "v6.7", "v6.8"])("%s", (version) => {
	const filePath = `${version}.json`;

	/**
	 * Asserts the patterns of `Actions[]`.
	 */
	describe("Actions[]", () => {
		/**
		 * Asserts the pattern of `Icon`.
		 */
		test("Icon", () => {
			// Arrange, act, assert.
			const errors = validateStreamDeckPluginManifest(filePath, (m) => (m.Actions[0].Icon = "test.png"));
			expect(errors).toHaveError({
				instancePath: "/Actions/0/Icon",
				keyword: "pattern",
				params: {
					pattern: patterns.IMAGE_PATH
				}
			});
		});

		/**
		 * Asserts the pattern of `PropertyInspectorPath`.
		 */
		test("PropertyInspectorPath", () => {
			// Arrange, act.
			const errors = validateStreamDeckPluginManifest(filePath, (m) => {
				// @ts-expect-error Test non-HTML file path.
				m.Actions[0].PropertyInspectorPath = "file.txt";
			});

			// Assert.
			expect(errors).toHaveError({
				instancePath: "/Actions/0/PropertyInspectorPath",
				keyword: "pattern",
				params: {
					pattern: patterns.HTML_PATH
				}
			});
		});

		/**
		 * Asserts the pattern of `UUID`.
		 */
		test("UUID", () => {
			// Arrange, act, assert.
			const errors = validateStreamDeckPluginManifest(filePath, (m) => (m.Actions[0].UUID = "com.$.test"));
			expect(errors).toHaveError({
				instancePath: "/Actions/0/UUID",
				keyword: "pattern",
				params: {
					pattern: patterns.UUID
				}
			});
		});

		/**
		 * Asserts the patterns of `Encoder`.
		 */
		describe("Encoder", () => {
			/**
			 * Asserts the pattern of `Icon`.
			 */
			test("Icon", () => {
				// Arrange, act, assert.
				const errors = validateStreamDeckPluginManifest(filePath, (m) => (m.Actions[0].Encoder!.Icon = "test.png"));
				expect(errors).toHaveError({
					instancePath: "/Actions/0/Encoder/Icon",
					keyword: "pattern",
					params: {
						pattern: patterns.IMAGE_PATH
					}
				});
			});

			/**
			 * Asserts the pattern of `background`.
			 */
			test("background", () => {
				// Arrange, act, assert.
				const errors = validateStreamDeckPluginManifest(filePath, (m) => (m.Actions[0].Encoder!.background = "test.png"));
				expect(errors).toHaveError({
					instancePath: "/Actions/0/Encoder/background",
					keyword: "pattern",
					params: {
						pattern: patterns.ENCODER_BACKGROUND_PATH
					}
				});
			});

			/**
			 * Asserts the pattern of `layout`.
			 */
			test("layout", () => {
				// Arrange, act, assert.
				const errors = validateStreamDeckPluginManifest(filePath, (m) => (m.Actions[0].Encoder!.layout = "./test.json"));
				expect(errors).toHaveError({
					instancePath: "/Actions/0/Encoder/layout",
					keyword: "pattern",
					params: {
						pattern: patterns.LAYOUT
					}
				});
			});
		});

		/**
		 * Asserts the patterns of `States[]`.
		 */
		describe("States[]", () => {
			/**
			 * Asserts the pattern of `Image`.
			 */
			test("Image", () => {
				// Arrange, act, assert.
				const errors = validateStreamDeckPluginManifest(filePath, (m) => (m.Actions[0].States[0].Image = "test.png"));
				expect(errors).toHaveError({
					instancePath: "/Actions/0/States/0/Image",
					keyword: "pattern",
					params: {
						pattern: patterns.IMAGE_PATH_WITH_GIF_SUPPORT
					}
				});
			});

			/**
			 * Asserts the pattern of `MultiActionImage`.
			 */
			test("MultiActionImage", () => {
				// Arrange, act, assert.
				const errors = validateStreamDeckPluginManifest(filePath, (m) => (m.Actions[0].States[0].MultiActionImage = "test.png"));
				expect(errors).toHaveError({
					instancePath: "/Actions/0/States/0/MultiActionImage",
					keyword: "pattern",
					params: {
						pattern: patterns.IMAGE_PATH
					}
				});
			});
		});
	});

	/**
	 * Asserts the pattern of `CategoryIcon`.
	 */
	test("CategoryIcon", () => {
		// Arrange, act, assert.
		const errors = validateStreamDeckPluginManifest(filePath, (m) => (m.CategoryIcon = "test.png"));
		expect(errors).toHaveError({
			instancePath: "/CategoryIcon",
			keyword: "pattern",
			params: {
				pattern: patterns.IMAGE_PATH
			}
		});
	});

	/**
	 * Asserts the pattern of `CodePath`.
	 */
	test("CodePath", () => {
		// Arrange, act, assert.
		const errors = validateStreamDeckPluginManifest(filePath, (m) => (m.CodePath = "./file.exe"));
		expect(errors).toHaveError({
			instancePath: "/CodePath",
			keyword: "pattern",
			params: {
				pattern: patterns.FILE_PATH
			}
		});
	});

	/**
	 * Asserts the pattern of `CodePathMac`.
	 */
	test("CodePathMac", () => {
		// Arrange, act, assert.
		const errors = validateStreamDeckPluginManifest(filePath, (m) => (m.CodePathMac = "./file.exe"));
		expect(errors).toHaveError({
			instancePath: "/CodePathMac",
			keyword: "pattern",
			params: {
				pattern: patterns.FILE_PATH
			}
		});
	});

	/**
	 * Asserts the pattern of `CodePathWin`.
	 */
	test("CodePathWin", () => {
		// Arrange, act, assert.
		const errors = validateStreamDeckPluginManifest(filePath, (m) => (m.CodePathWin = "./file.exe"));
		expect(errors).toHaveError({
			instancePath: "/CodePathWin",
			keyword: "pattern",
			params: {
				pattern: patterns.FILE_PATH
			}
		});
	});

	/**
	 * Asserts the pattern of `Icon`.
	 */
	test("Icon", () => {
		// Arrange, act, assert.
		const errors = validateStreamDeckPluginManifest(filePath, (m) => (m.Icon = "test.png"));
		expect(errors).toHaveError({
			instancePath: "/Icon",
			keyword: "pattern",
			params: {
				pattern: patterns.ICON_PATH
			}
		});
	});

	/**
	 * Asserts the patterns of `Profiles[]`.
	 */
	describe("Profiles[]", () => {
		test("Name", () => {
			// Arrange, act.
			const errors = validateStreamDeckPluginManifest(filePath, (m) => {
				m.Profiles![0].Name = "other.streamDeckProfile";
			});

			// Assert.
			expect(errors).toHaveError({
				instancePath: "/Profiles/0/Name",
				keyword: "pattern",
				params: {
					pattern: patterns.PROFILE_PATH
				}
			});
		});
	});

	/**
	 * Asserts the pattern of `PropertyInspectorPath`.
	 */
	test("PropertyInspectorPath", () => {
		// Arrange, act.
		const errors = validateStreamDeckPluginManifest(filePath, (m) => {
			// @ts-expect-error Test non-HTML file path string.
			m.PropertyInspectorPath = "test.txt";
		});

		// Assert.
		expect(errors).toHaveError({
			instancePath: "/PropertyInspectorPath",
			keyword: "pattern",
			params: {
				pattern: patterns.HTML_PATH
			}
		});
	});

	/**
	 * Asserts the pattern of `UUID`.
	 */
	test("UUID", () => {
		// Arrange, act, assert.
		const errors = validateStreamDeckPluginManifest(filePath, (m) => (m.UUID = "com.$.test"));
		expect(errors).toHaveError({
			instancePath: "/UUID",
			keyword: "pattern",
			params: {
				pattern: patterns.UUID
			}
		});
	});
});

const patterns = {
	COLOR: "^#(?:[0-9a-fA-F]{3}){1,2}$",
	ENCODER_BACKGROUND_PATH: "^(?![~\\.]*[\\\\\\/]+)(?!.*\\.(([Pp][Nn][Gg])|([Ss][Vv][Gg]))$).*$",
	FILE_PATH: "^(?![~\\.]*[\\\\\\/]+).*$",
	HTML_PATH: "^(?![~\\.]*[\\\\\\/]+).*\\.(([Hh][Tt][Mm])|([Hh][Tt][Mm][Ll]))$",
	LAYOUT: "^(^(?![\\.]*[\\\\\\/]+).+\\.([Jj][Ss][Oo][Nn])$)|(\\$(X1|A0|A1|B1|B2|C1))$",
	IMAGE_PATH_WITH_GIF_SUPPORT: "^(?![~\\.]*[\\\\\\/]+)(?!.*\\.(([Gg][Ii][Ff])|([Ss][Vv][Gg])|([Pp][Nn][Gg]))$).*$",
	IMAGE_PATH: "^(?![~\\.]*[\\\\\\/]+)(?!.*\\.(([Ss][Vv][Gg])|([Pp][Nn][Gg]))$).*$",
	ICON_PATH: "^(?![~\\.]*[\\\\\\/]+)(?!.*\\.(([Pp][Nn][Gg]))$).*$",
	PROFILE_PATH: "^(?![~\\.]*[\\\\\\/]+)(?!.*\\.(([Ss][Tt][Rr][Ee][Aa][Mm][Dd][Ee][Cc][Kk][Pp][Rr][Oo][Ff][Ii][Ll][Ee]))$).*$",
	UUID: "^([a-z0-9-]+)(\\.[a-z0-9-]+)+$"
};
