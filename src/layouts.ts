import { Enumerate, StrictUnion } from "./utils";

/**
 * Array defining the items coordinates and size in the format [x, y, width, height].
 * @example
 * // Top left, 50 wide, by 100 high
 * [0, 0, 50, 100]
 * @example
 * // Bottom right, 25 wide, by 30 high
 * [175, 70, 25, 30]
 */
type Rect = [Enumerate<201>, Enumerate<201>, Enumerate<101>, Enumerate<101>];

/**
 * Numerical value used to specify the opacity of an item within a layout.
 */
type Opacity = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

/**
 * Numerical value used to specify the z-order of an item, allowing for items to be layered within a layout.
 */
type ZOrder = Enumerate<701>;

/**
 * Extended information used to define a layout item within a layout's JSON file.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type LayoutItemDeclaration<T> = {
	/**
	 * Unique name used to identify the layout item. When calling `setFeedback` this value should be used as the key as part of the object that represents the feedback.
	 * @example
	 * // Item as defined in the layout's JSON file.
	 * {
	 *   key: "title",
	 *   type: "text",
	 *   rect: [0, 0, 100, 50]
	 * }
	 *
	 * // Show the "title" item, and set the font weight to 400.
	 * setFeedback(context, {
	 *   title: {
	 *     enabled: true,
	 *     font: {
	 *       weight: 400
	 *     }
	 *   }
	 * });
	 */
	key: string;

	/**
	 * Array defining the items coordinates in the format [x, y, width, height]; coordinates must be within canvas size of 200 x 100, e.g. [0, 0, 200, 100]. Items with the same `zOrder` must **not** have an overlapping `rect`.
	 * @example
	 * // Top left, 50 wide, by 100 high
	 * [0, 0, 50, 100]
	 * @example
	 * // Bottom right, 25 wide, by 30 high
	 * [175, 70, 25, 30]
	 */
	rect: Rect;

	/**
	 * Type of layout item this instance represents, e.g. "pixmap", "bar", etc.
	 */
	type: T;
};

/**
 * Defines an item to be displayed within a layout, on the Stream Deck.
 */
type LayoutItem = {
	/**
	 * Background color represented as a named color, hexadecimal value, or gradient.
	 * @example
	 * "pink"
	 * @example
	 * // An Elgato blue.
	 * "#204cfe"
	 * @example
	 * // Gradient starting as red, going to yellow, and finishing at green. Color stops are defined as comma-separated values using the format `{offset}:{color}`.
	 * "0:#ff0000,0.5:yellow,1:#00ff00"
	 */
	background?: string;

	/**
	 * Determines whether the item is enabled (i.e. visible); default is `true`.
	 */
	enabled?: boolean;

	/**
	 * Defines the opacity of the item being shown based on a single-decimal value ranging from `0..1`, e.g. `0.1`, `0.2`, etc. with `0` being invisible and `1` being fully visible. Default is `1`.
	 */
	opacity?: Opacity;

	/**
	 * Z-order of the item, used to layer items within a layout; must be between 0-700. Items with the same `zOrder` must **not** have an overlapping `rect`. Default is `0`.
	 */
	zOrder?: ZOrder;
};

/**
 * Image layout item used to render an image sourced from either a local file located under the plugin's folder, or base64 encoded `string`. The `value` defines the image.
 */
export type Pixmap = LayoutItem & {
	/**
	 * Image to render; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.), or an SVG `string`.
	 * @example
	 * // Given an "Logo.png" file exists within a sub-directory of the plugin named "imgs".
	 * "imgs/Logo.png"
	 * @example
	 * // Elgato logo, as a base64 encoded SVG.
	 * "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MHB0IiBoZWlnaHQ9…"
	 */
	value: string;
};

/**
 * Bar layout item used to render a horizontal bar with a filler, e.g. a progress bar. The amount to fill the bar by can be specified by setting the `value`.
 */
export type Bar = LayoutItem & {
	/**
	 * Bar background color represented as a named color, hexadecimal value, or gradient. Default is `darkGray`.
	 * @example
	 * "pink"
	 * @example
	 * // An Elgato blue.
	 * "#204cfe"
	 * @example
	 * // Gradient starting as red, going to yellow, and finishing at green. Color stops are defined as comma-separated values using the format `{offset}:{color}`.
	 * "0:#ff0000,0.5:yellow,1:#00ff00"
	 */
	bar_bg_c?: string;

	/**
	 * Border color represented as a named color, or hexadecimal value. Default is `white`.
	 * @example
	 * "pink"
	 * @example
	 * // An Elgato blue.
	 * "#204cfe"
	 */
	bar_border_c?: string;

	/**
	 * Fill color of the bar represented as a named color, hexadecimal value, or gradient. Default is `white`.
	 * @example
	 * "pink"
	 * @example
	 * // An Elgato blue.
	 * "#204cfe"
	 * @example
	 * // Gradient starting as red, going to yellow, and finishing at green. Color stops are defined as comma-separated values using the format `{offset}:{color}`.
	 * "0:#ff0000,0.5:yellow,1:#00ff00"
	 */
	bar_fill_c?: string;

	/**
	 * Width of the border around the bar, as a whole number. Default is `2`.
	 */
	border_w?: number;

	/**
	 * Sub-type used to determine the type of bar to render. Default is {@link BarSubType.Groove}.
	 */
	subtype?: BarSubType;

	/**
	 * Value used to determine how much of the bar is filled. Correlates with the item's `range` if specified in the layout's JSON declaration; default range is `0..100`.
	 */
	value?: number;
};

/**
 * Bar layout item used to render a horizontal bar with an indicator represented as a triangle beneath the bar. The location of the indicator can be specified by setting the `value`.
 */
export type GBar = Bar & {
	/**
	 * Height of the bar's indicator. Default is `10`.
	 */
	bar_h?: Enumerate<101>;
};

/**
 * Text layout item used to render text within a layout. **Note**, when adding a text item to the layout's JSON declaration, setting the `key` to the `"title"` keyword will enable the user to specify the font's
 * settings via the property inspector, and will cause `setTitle` to update this item.
 */
export type Text = LayoutItem & {
	/**
	 * Alignment of the text. Default is `"center"`. **Note**, when the `key` of this layout item is set to `"title"` within the layout's JSON declaration, these values will be ignored in favour of the user's preferred title settings, as set in property inspector.
	 */
	alignment?: "center" | "left" | "right";

	/**
	 * Color of the font represented as a named color, or hexadecimal value. Default is `white`. **Note**, when the `key` of this layout item is set to `"title"` within the layout's JSON declaration, these values will be ignored in favour of the user's preferred title settings, as set in property inspector.
	 * @example
	 * "pink"
	 * @example
	 * // An Elgato blue.
	 * "#204cfe"
	 */
	color?: string;

	/**
	 * Settings used to determine how the font should be rendered. **Note**, when the `key` of this layout item is set to `"title"` within the layout's JSON declaration, these values will be ignored in favour of the user's preferred title settings, as set in property inspector.
	 */
	font?: {
		/**
		 * Size of the font. **Note**, when the `key` of this layout item is set to `"title"` within the layout's JSON declaration, this value will be ignored in favour of the user's preferred title settings, as set in property inspector.
		 */
		size?: number;

		/**
		 * Weight of the font; value must be a whole `number` in the range of `100..1000`. **Note**, when the `key` of this layout item is set to `"title"` within the layout's JSON declaration, this value will be ignored in favour of the user's preferred title settings, as set in property inspector.
		 */
		weight?: number;
	};
};

/**
 * List of available types that can be applied to {@link Bar} and {@link GBar} to determine their style.
 */
export enum BarSubType {
	/**
	 * Rectangle bar; the bar fills from left to right, determined by the {@link Bar.value}, similar to a standard progress bar.
	 */
	Rectangle = 0,

	/**
	 * Rectangle bar; the bar fills outwards from the centre of the bar, determined by the {@link Bar.value}.
	 * @example
	 * // Value is 2, range is 1-10.
	 * // [  ███     ]
	 * @example
	 * // Value is 10, range is 1-10.
	 * // [     █████]
	 */
	DoubleRectangle = 1,

	/**
	 * Trapezoid bar, represented as a right-angle triangle; the bar fills from left to right, determined by the {@link Bar.value}, similar to a volume meter.
	 */
	Trapezoid = 2,

	/**
	 * Trapezoid bar, represented by two right-angle triangles; the bar fills outwards from the centre of the bar, determined by the {@link Bar.value}. See {@link BarSubType.DoubleRectangle}.
	 */
	DoubleTrapezoid = 3,

	/**
	 * Rounded rectangle bar; the bar fills from left to right, determined by the {@link Bar.value}, similar to a standard progress bar.
	 */
	Groove = 4
}

/**
 * Payload object, used in conjunction with `setLayout`, that enables updating items within a layout.
 */
export type FeedbackPayload = Record<string, StrictUnion<Bar | GBar | Pixmap | Text> | number | string>;
