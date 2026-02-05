import * as schemas from "@elgato/schemas/streamdeck/plugins";

export { BarSubType } from "@elgato/schemas/streamdeck/plugins";

/**
 * Bar layout item used to render a horizontal bar with a filler, e.g. a progress bar. The amount to fill the bar by can be specified by setting the `value`.
 */
export type Bar = FeedbackPayloadItem<schemas.Bar>;

/**
 * Bar layout item used to render a horizontal bar with an indicator represented as a triangle beneath the bar. The location of the indicator can be specified by setting the `value`.
 */
export type GBar = FeedbackPayloadItem<schemas.GBar>;

/**
 * Image layout item used to render an image sourced from either a local file located under the plugin's folder, or base64 encoded `string`. The `value` defines the image.
 */
export type Pixmap = FeedbackPayloadItem<schemas.Pixmap>;

/**
 * Text layout item used to render text within a layout. **Note**, when adding a text item to the layout's JSON definition, setting the `key` to the `"title"` keyword will enable the
 * user to specify the font's settings via the property inspector, and will cause `setTitle` to update this item
 */
export type Text = FeedbackPayloadItem<schemas.Text>;

/**
 * Payload object used to update a Stream Deck encoder's (touchscreen) layout.
 */
export type FeedbackPayload = Record<string, Bar | GBar | Pixmap | Text | number | string>;

/**
 * Omits immutable properties from {@template T}.
 */
type FeedbackPayloadItem<T extends schemas.Bar | schemas.GBar | schemas.Pixmap | schemas.Text> = Partial<
	Omit<T, "key" | "rect" | "type">
>;
