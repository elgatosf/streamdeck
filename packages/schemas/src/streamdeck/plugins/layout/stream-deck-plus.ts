import type { Controller } from "../manifest/latest";
import type { Layout } from "./layout";

/**
 * A Stream Deck + layout.
 */
export type StreamDeckPlusLayoutSchema = Omit<Layout<StreamDeckPlusRect>, "controller"> & {
	/**
	 * Controller the layout is intended for.
	 */
	controller?: Extract<Controller, "Encoder"> | undefined;
};

/**
 * The coordinates of the item, represented as `[x, y, width, height]`.
 *
 * Items must be within the bounds of the Stream Deck device the layout is intended for, and must
 * not be overlapping with other items on the same `zOrder`.
 *
 * Stream Deck device layout sizes:
 * - Stream Deck +, 200 x 100 px
 * - Stream Deck Neo, 232 x 50 px
 *
 * Note: The `rect` of the layout item cannot be changed at runtime.
 */
type StreamDeckPlusRect = [x: X, y: Y, width: Width, height: Height];

/**
 * X coordinate of the rectangle.
 * @minimum 0
 * @maximum 200
 */
type X = number;

/**
 * Y coordinate of the rectangle.
 * @minimum 0
 * @maximum 100
 */
type Y = number;

/**
 * Width of the rectangle.
 * @minimum 0
 * @maximum 200
 */
type Width = number;

/**
 * Height of the rectangle.
 * @minimum 0
 * @maximum 100
 */
type Height = number;
