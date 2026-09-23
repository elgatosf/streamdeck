import { config } from "@elgato/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		extends: [config.strict],
		rules: {
			"jsdoc/check-tag-names": [
				"warn",
				{
					definedTags: [
						"errorMessage",
						"discriminator",
						"filePath",
						"imageDimensions",
						"maxItems",
						"maximum",
						"minimum",
						"minItems",
						"pattern",
						"uniqueItems",
					],
				},
			],
		},
	},
]);
