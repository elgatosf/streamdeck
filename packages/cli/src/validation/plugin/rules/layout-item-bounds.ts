import { type Layout } from "@elgato/schemas/streamdeck/plugins";
import chalk from "chalk";

import { JsonElement, JsonObject } from "../../../json";
import { rule } from "../../rule";
import { type PluginContext } from "../plugin";

export const layoutItemsAreWithinBoundsAndNoOverlap = rule<PluginContext>(function (plugin: PluginContext) {
	plugin.manifest.layoutFiles.forEach(({ layout }) => {
		const items = getItemBounds(layout.value);

		// Iterate backwards so first items have precedence.
		for (let i = items.length - 1; i >= 0; i--) {
			const {
				node,
				vertices: { x1, x2, y1, y2 },
			} = items[i];

			// First check the bounds of the rectangle are within the canvas.
			if (x1 < 0 || x2 > 200 || y1 < 0 || y2 > 100) {
				this.addError(layout.path, "must not be outside of the canvas", {
					...node,
					suggestion: "Width and height, relative to the x and y, must be within the 200x100 px canvas",
				});
			}

			for (let j = i - 1; j >= 0; j--) {
				if (isOverlap(items[i].vertices, items[j].vertices)) {
					this.addError(layout.path, `must not overlap ${chalk.blue(items[j].node.location.key)}`, items[i].node);
				}
			}
		}
	});
});

/**
 * Gets the bounds of items that contain a valid number of vertices.
 * @param layout Layout whose items should be selected.
 * @returns Collection of bounds, and their associated value reference.
 */
function getItemBounds(layout: JsonObject<Layout>): Bounds[] {
	return (
		layout.items?.reduce<Bounds[]>((valid, { rect, zOrder }) => {
			if (rect?.length === 4) {
				valid.push({
					node: rect[0],
					vertices: {
						x1: rect[0].value,
						x2: rect[0].value + rect[2].value,
						y1: rect[1].value,
						y2: rect[1].value + rect[3].value,
						z: zOrder?.value ?? 0,
					},
				});
			}

			return valid;
		}, []) || []
	);
}

/**
 * Determines if the vertices of {@link a} and {@link b} overlap.
 * @param a First vertices.
 * @param b Second vertices.
 * @returns `true` when the vertices overlap; otherwise `false`.
 */
function isOverlap(a: Bounds["vertices"], b: Bounds["vertices"]): boolean {
	if (a.z !== b.z) {
		return false; // different layers.
	}

	return !(b.x2 <= a.x1 || b.x1 >= a.x2 || b.y2 <= a.y1 || b.y1 >= a.y2);
	//       \__________/    \__________/    \__________/    \__________/
	//            |               |               |               └ B is below A
	//            │               |               └ B is above A
	//            │               └ B is right of A
	//            └ B is left of A
}

/**
 * Bounds of a layout item.
 */
type Bounds = {
	/**
	 * Node that indicates where the bounds are referenced; this is the `rect` of the layout item.
	 */
	node: JsonElement<number>;

	/**
	 * Vertices that detail the bounds of an item.
	 */
	vertices: {
		/**
		 * x left-most coordinate.
		 */
		x1: number;

		/**
		 * x right-mode coordinate.
		 */
		x2: number;

		/**
		 * y top-most coordinate.
		 */
		y1: number;

		/**
		 * y bottom-most coordinate.
		 */
		y2: number;

		/**
		 * Z index.
		 */
		z: number;
	};
};
