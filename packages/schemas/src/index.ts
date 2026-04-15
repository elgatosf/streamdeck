/**
 * Custom keyword definitions.
 */
export const keywordDefinitions = {
	/**
	 * The `markdownDescription` keyword definition; used to define descriptions with markdown syntax.
	 */
	markdownDescription: {
		/**
		 * String that identifies the `markdownDescription` keyword.
		 */
		keyword: "markdownDescription",

		/**
		 * Schema type of the keyword.
		 */
		schemaType: "string" as const
	},

	/**
	 * The `errorMessage` keyword definition; used to define custom error messages.
	 */
	errorMessage: {
		/**
		 * String that identifies the `errorMessage` keyword.
		 */
		keyword: "errorMessage",

		/**
		 * Schema type of the keyword.
		 */
		schemaType: "string" as const
	},

	/**
	 * The `imageDimensions` keyword definition; used to validate dimensions of images.
	 */
	imageDimensions: {
		/**
		 * String that identifies the `imageDimensions` keyword.
		 */
		keyword: "imageDimensions",

		/**
		 * Schema type of the keyword.
		 */
		schemaType: "array" as const
	},

	/**
	 * The `filePath` keyword definition; used to validate strings that represent file paths.
	 */
	filePath: {
		/**
		 * String that identifies the `filePath` keyword.
		 */
		keyword: "filePath",

		/**
		 * Schema type of the keyword.
		 */
		schemaType: ["boolean" as const, "object" as const]
	}
};

/**
 * Options associated with the {@link keywordDefinitions.filePath} keyword.
 */
export type FilePathOptions =
	| true
	| {
			/**
			 * Collection of valid file extensions.
			 */
			extensions: string[];

			/**
			 * Determines whether the extension must be present, or omitted, from the file path.
			 */
			includeExtension: boolean;
	  };

/**
 * Options associated with the {@link keywordDefinitions.imageDimensions} keyword.
 */
export type ImageDimensions = [width: number, height: number];
