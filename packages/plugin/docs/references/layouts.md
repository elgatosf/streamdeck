---
sidebar_position: 2
---

# Layouts

Layouts are customizable interfaces used by the touch strip found on Stream Deck +, and the Infobar found on Stream Deck Neo. Layouts are defined as JSON files distributed with your plugin, and can be updated programmatically whilst your plugin is running.

## Device Sizes

The canvas size of a layout varies depending on the device it will be rendered on, these sizes are:

- Stream Deck + — 200 × 100 px
- Stream Deck + XL — 200 × 100 px
- Stream Deck Neo Infobar — 232 × 50 px

> [!NOTE]
> In the context of Stream Deck + (Classic | XL) , the layout's canvas is a portion of the touch strip associated with a corresponding dial. Plugins cannot render across the entire touch strip.

## JSON Schema

A JSON schema is available for layout JSON files, providing intellisense and validation, and is available at the following URL:

```text title="JSON schema URL"
https://schemas.elgato.com/streamdeck/plugins/layout.json
```

You can reference this URL using the `$schema` property within your layout JSON file:

```json title="Layout JSON file" {2}
{
	"$schema": "https://schemas.elgato.com/streamdeck/plugins/layout.json",
	"id": "CustomLayout",
	"items": [
		// ...
	]
}
```

## TypeScript Declaration

<!-- generated: layout-declaration -->

```ts title="Layout TypeScript declaration"
type Layout = {
	controller?: "Encoder" | "Neo";
	id: string;
	items: (
		| {
				background?: string;
				bar_bg_c?: string;
				bar_border_c?: string;
				bar_fill_c?: string;
				border_w?: number;
				enabled?: boolean;
				key: string;
				opacity?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
				range?: {
					max: number;
					min: number;
				};
				rect: [x: number, y: number, width: number, height: number];
				subtype?: 0 | 1 | 2 | 3 | 4;
				type: "bar";
				value: number;
				zOrder?: number;
		  }
		| {
				background?: string;
				bar_bg_c?: string;
				bar_border_c?: string;
				bar_fill_c?: string;
				bar_h?: number;
				border_w?: number;
				enabled?: boolean;
				key: string;
				opacity?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
				range?: {
					max: number;
					min: number;
				};
				rect: [x: number, y: number, width: number, height: number];
				subtype?: 0 | 1 | 2 | 3 | 4;
				type: "gbar";
				value: number;
				zOrder?: number;
		  }
		| {
				background?: string;
				enabled?: boolean;
				key: string;
				opacity?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
				rect: [x: number, y: number, width: number, height: number];
				type: "pixmap";
				value?: string;
				zOrder?: number;
		  }
		| {
				alignment?: "center" | "left" | "right";
				background?: string;
				color?: string;
				enabled?: boolean;
				font?: {
					size?: number;
					weight?: number;
				};
				key: string;
				opacity?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
				rect: [x: number, y: number, width: number, height: number];
				"text-overflow"?: "clip" | "ellipsis" | "fade";
				type: "text";
				value?: string;
				zOrder?: number;
		  }
	)[];
};
```

<!-- /generated -->

## Definitions

<!-- generated: layout-definitions -->

### Layout

Defines the structure of a custom layout file.

**Properties**

#### controller {#layout-controller}

Type: `"Encoder"`, `"Neo"` (optional)

Controller the layout is intended for.

#### id {#layout-id}

Type: `string` (required)

Unique identifier associated with the layout.

#### items {#layout-items}

Type: ([Bar](#bar), [GBar](#gbar), [Pixmap](#pixmap), [Text](#text))[] (required)

Items within the layout.

### Bar

Bar layout item used to render a horizontal bar with a filler, e.g. a progress bar. The amount to fill the bar by can be specified by setting the `value`.

**Properties**

#### background {#bar-background}

Type: `string` (optional)

Background color represented as a named color, hexadecimal value, or gradient. Gradients can be defined by specifying multiple color-stops separated by commas, in the following
format `[{offset}:{color}[,]]`.

**Examples:**

- "pink"
- "#204cfe" (Elgato blue)
- "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)

#### enabled {#bar-enabled}

Type: `boolean` (optional)

Determines whether the item is enabled (i.e. visible); default is `true`.

#### key {#bar-key}

Type: `string` (required)

Unique name used to identify the layout item. When calling `setFeedback` this value should be used as the key as part of the object that represents the feedback.

Note: The `key` of the layout item cannot be changed at runtime.

#### opacity {#bar-opacity}

Type: `0`, `0.1`, `0.2`, `0.3`, `0.4`, `0.5`, `0.6`, `0.7`, `0.8`, `0.9`, `1` (optional)

Defines the opacity of the item being shown based on a single-decimal value ranging from `0..1`, e.g. `0.1`, `0.2`, etc. with `0` being invisible and `1` being fully visible.
Default is `1`.

#### rect {#bar-rect}

Type: [x: `number`, y: `number`, width: `number`, height: `number`] (required)

The coordinates of the item, represented as `[x, y, width, height]`.

Items must be within the bounds of the Stream Deck device the layout is intended for, and must
not be overlapping with other items. For items that may overlap, consider using `zOrder`.

Stream Deck device layout sizes:

- Stream Deck +, 200 x 100 px
- Stream Deck Neo, 232 x 50 px

Note: The `rect` of the layout item cannot be changed at runtime.

#### type {#bar-type}

Type: `"bar"` (required)

Type of layout item this instance represents, e.g. "pixmap", "bar", etc.

Note: The `type` of the layout item cannot be changed at runtime.

#### zOrder {#bar-zorder}

Type: `number` (optional)

Z-order of the item, used to layer items within a layout; must be between 0-700. Items with the same `zOrder` must **not** have an overlapping `rect`. Default is `0`.

#### bar_bg_c {#bar-bar_bg_c}

Type: `string` (optional)

Bar background color represented as a named color, hexadecimal value, or gradient. Default is `darkGray`. Gradients can be defined by specifying multiple color-stops separated
by commas, in the following format `[{offset}:{color}[,]]`.

**Examples:**

- "pink"
- "#204cfe" (Elgato blue)
- "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)

#### bar_border_c {#bar-bar_border_c}

Type: `string` (optional)

Border color represented as a named color, or hexadecimal value. Default is `white`.

**Examples:**

- "pink"
- "#204cfe" (Elgato blue)

#### bar_fill_c {#bar-bar_fill_c}

Type: `string` (optional)

Fill color of the bar represented as a named color, hexadecimal value, or gradient. Default is `white`. Gradients can be defined by specifying multiple color-stops separated
by commas, in the following format `[{offset}:{color}[,]]`.

**Examples:**

- "pink"
- "#204cfe" (Elgato blue)
- "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)

#### border_w {#bar-border_w}

Type: `number` (optional)

Width of the border around the bar, as a whole number. Default is `2`.

#### range {#bar-range}

Type: [Range](#range) (optional)

Defines the range of the value the bar represents, e.g. 0-20, 0-100, etc.

#### subtype {#bar-subtype}

Type: `0`, `1`, `2`, `3`, `4` (optional)

Sub-type used to determine the type of bar to render. Default is `BarSubType.Groove` (4).

**Options**

- Rectangle (0)
- DoubleRectangle (1)
- Trapezoid (2)
- DoubleTrapezoid (3)
- Groove (4)

#### value {#bar-value}

Type: `number` (required)

Value used to determine how much of the bar is filled. Correlates with the item's `range` if specified in the layout's JSON definition; default range is `0..100`.

### GBar

Bar layout item used to render a horizontal bar with an indicator represented as a triangle beneath the bar. The location of the indicator can be specified by setting the `value`.

**Properties**

#### background {#gbar-background}

Type: `string` (optional)

Background color represented as a named color, hexadecimal value, or gradient. Gradients can be defined by specifying multiple color-stops separated by commas, in the following
format `[{offset}:{color}[,]]`.

**Examples:**

- "pink"
- "#204cfe" (Elgato blue)
- "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)

#### enabled {#gbar-enabled}

Type: `boolean` (optional)

Determines whether the item is enabled (i.e. visible); default is `true`.

#### key {#gbar-key}

Type: `string` (required)

Unique name used to identify the layout item. When calling `setFeedback` this value should be used as the key as part of the object that represents the feedback.

Note: The `key` of the layout item cannot be changed at runtime.

#### opacity {#gbar-opacity}

Type: `0`, `0.1`, `0.2`, `0.3`, `0.4`, `0.5`, `0.6`, `0.7`, `0.8`, `0.9`, `1` (optional)

Defines the opacity of the item being shown based on a single-decimal value ranging from `0..1`, e.g. `0.1`, `0.2`, etc. with `0` being invisible and `1` being fully visible.
Default is `1`.

#### rect {#gbar-rect}

Type: [x: `number`, y: `number`, width: `number`, height: `number`] (required)

The coordinates of the item, represented as `[x, y, width, height]`.

Items must be within the bounds of the Stream Deck device the layout is intended for, and must
not be overlapping with other items. For items that may overlap, consider using `zOrder`.

Stream Deck device layout sizes:

- Stream Deck +, 200 x 100 px
- Stream Deck Neo, 232 x 50 px

Note: The `rect` of the layout item cannot be changed at runtime.

#### type {#gbar-type}

Type: `"gbar"` (required)

Type of layout item this instance represents, e.g. "pixmap", "bar", etc.

Note: The `type` of the layout item cannot be changed at runtime.

#### zOrder {#gbar-zorder}

Type: `number` (optional)

Z-order of the item, used to layer items within a layout; must be between 0-700. Items with the same `zOrder` must **not** have an overlapping `rect`. Default is `0`.

#### bar_bg_c {#gbar-bar_bg_c}

Type: `string` (optional)

Bar background color represented as a named color, hexadecimal value, or gradient. Default is `darkGray`. Gradients can be defined by specifying multiple color-stops separated
by commas, in the following format `[{offset}:{color}[,]]`.

**Examples:**

- "pink"
- "#204cfe" (Elgato blue)
- "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)

#### bar_border_c {#gbar-bar_border_c}

Type: `string` (optional)

Border color represented as a named color, or hexadecimal value. Default is `white`.

**Examples:**

- "pink"
- "#204cfe" (Elgato blue)

#### bar_fill_c {#gbar-bar_fill_c}

Type: `string` (optional)

Fill color of the bar represented as a named color, hexadecimal value, or gradient. Default is `white`. Gradients can be defined by specifying multiple color-stops separated
by commas, in the following format `[{offset}:{color}[,]]`.

**Examples:**

- "pink"
- "#204cfe" (Elgato blue)
- "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)

#### border_w {#gbar-border_w}

Type: `number` (optional)

Width of the border around the bar, as a whole number. Default is `2`.

#### range {#gbar-range}

Type: [Range](#range) (optional)

Defines the range of the value the bar represents, e.g. 0-20, 0-100, etc.

#### subtype {#gbar-subtype}

Type: `0`, `1`, `2`, `3`, `4` (optional)

Sub-type used to determine the type of bar to render. Default is `BarSubType.Groove` (4).

**Options**

- Rectangle (0)
- DoubleRectangle (1)
- Trapezoid (2)
- DoubleTrapezoid (3)
- Groove (4)

#### value {#gbar-value}

Type: `number` (required)

Value used to determine how much of the bar is filled. Correlates with the item's `range` if specified in the layout's JSON definition; default range is `0..100`.

#### bar_h {#gbar-bar_h}

Type: `number` (optional)

Height of the bar's indicator. Default is `10`.

### Pixmap

Image layout item used to render an image sourced from either a local file located under the plugin's folder, or base64 encoded `string`. The `value` defines the image.

**Properties**

#### background {#pixmap-background}

Type: `string` (optional)

Background color represented as a named color, hexadecimal value, or gradient. Gradients can be defined by specifying multiple color-stops separated by commas, in the following
format `[{offset}:{color}[,]]`.

**Examples:**

- "pink"
- "#204cfe" (Elgato blue)
- "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)

#### enabled {#pixmap-enabled}

Type: `boolean` (optional)

Determines whether the item is enabled (i.e. visible); default is `true`.

#### key {#pixmap-key}

Type: `string` (required)

Unique name used to identify the layout item. When calling `setFeedback` this value should be used as the key as part of the object that represents the feedback.

Note: The `key` of the layout item cannot be changed at runtime.

#### opacity {#pixmap-opacity}

Type: `0`, `0.1`, `0.2`, `0.3`, `0.4`, `0.5`, `0.6`, `0.7`, `0.8`, `0.9`, `1` (optional)

Defines the opacity of the item being shown based on a single-decimal value ranging from `0..1`, e.g. `0.1`, `0.2`, etc. with `0` being invisible and `1` being fully visible.
Default is `1`.

#### rect {#pixmap-rect}

Type: [x: `number`, y: `number`, width: `number`, height: `number`] (required)

The coordinates of the item, represented as `[x, y, width, height]`.

Items must be within the bounds of the Stream Deck device the layout is intended for, and must
not be overlapping with other items. For items that may overlap, consider using `zOrder`.

Stream Deck device layout sizes:

- Stream Deck +, 200 x 100 px
- Stream Deck Neo, 232 x 50 px

Note: The `rect` of the layout item cannot be changed at runtime.

#### type {#pixmap-type}

Type: `"pixmap"` (required)

Type of layout item this instance represents, e.g. "pixmap", "bar", etc.

Note: The `type` of the layout item cannot be changed at runtime.

#### zOrder {#pixmap-zorder}

Type: `number` (optional)

Z-order of the item, used to layer items within a layout; must be between 0-700. Items with the same `zOrder` must **not** have an overlapping `rect`. Default is `0`.

#### value {#pixmap-value}

Type: `string` (optional)

Image to render; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.), or an SVG
`string`.

**Examples:**

- "imgs/Logo.png"
- "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MHB0IiBoZWlnaHQ9…"

### Range

Defines the range of the value the bar represents, e.g. 0-20, 0-100, etc.

**Properties**

#### min {#range-min}

Type: `number` (required)

Minimum value of the bar.

#### max {#range-max}

Type: `number` (required)

Maximum value of the bar.

### Text

Layout item used to render text.

For Stream Deck + and Stream Deck + XL, when a text item has the key `title`, users can change
the appearance (e.g. font color) and value within Stream Deck.

**Properties**

#### background {#text-background}

Type: `string` (optional)

Background color represented as a named color, hexadecimal value, or gradient. Gradients can be defined by specifying multiple color-stops separated by commas, in the following
format `[{offset}:{color}[,]]`.

**Examples:**

- "pink"
- "#204cfe" (Elgato blue)
- "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)

#### enabled {#text-enabled}

Type: `boolean` (optional)

Determines whether the item is enabled (i.e. visible); default is `true`.

#### key {#text-key}

Type: `string` (required)

Unique name used to identify the layout item. When calling `setFeedback` this value should be used as the key as part of the object that represents the feedback.

Note: The `key` of the layout item cannot be changed at runtime.

#### opacity {#text-opacity}

Type: `0`, `0.1`, `0.2`, `0.3`, `0.4`, `0.5`, `0.6`, `0.7`, `0.8`, `0.9`, `1` (optional)

Defines the opacity of the item being shown based on a single-decimal value ranging from `0..1`, e.g. `0.1`, `0.2`, etc. with `0` being invisible and `1` being fully visible.
Default is `1`.

#### rect {#text-rect}

Type: [x: `number`, y: `number`, width: `number`, height: `number`] (required)

The coordinates of the item, represented as `[x, y, width, height]`.

Items must be within the bounds of the Stream Deck device the layout is intended for, and must
not be overlapping with other items. For items that may overlap, consider using `zOrder`.

Stream Deck device layout sizes:

- Stream Deck +, 200 x 100 px
- Stream Deck Neo, 232 x 50 px

Note: The `rect` of the layout item cannot be changed at runtime.

#### type {#text-type}

Type: `"text"` (required)

Type of layout item this instance represents, e.g. "pixmap", "bar", etc.

Note: The `type` of the layout item cannot be changed at runtime.

#### zOrder {#text-zorder}

Type: `number` (optional)

Z-order of the item, used to layer items within a layout; must be between 0-700. Items with the same `zOrder` must **not** have an overlapping `rect`. Default is `0`.

#### alignment {#text-alignment}

Type: `"center"`, `"left"`, `"right"` (optional)

Alignment of the text. Default is `"center"`. **Note**, when the `key` of this layout item is set to `"title"` within the layout's JSON definition, these values will be ignored
in favour of the user's preferred title settings, as set in property inspector.

#### color {#text-color}

Type: `string` (optional)

Color of the font represented as a named color, or hexadecimal value. Default is `white`. **Note**, when the `key` of this layout item is set to `"title"` within the layout's
JSON definition, these values will be ignored in favour of the user's preferred title settings, as set in property inspector.

**Examples:**

- "pink"
- "#204cfe" (Elgato blue)

#### font {#text-font}

Type: `object` (optional)

Defines how the font should be rendered. **Note**, when the `key` of this layout item is set to `"title"` within the layout's JSON definition, these values will be ignored in
favour of the user's preferred title settings, as set in property inspector.

**Properties**

##### size {#text-font-size}

Type: `number` (optional)

Size of the font, in pixels, represented as a whole number.

**Note**, when the `key` of this layout item is set to `"title"` within the layout's JSON definition, this value will be ignored in favour of the user's preferred title settings, as set in property inspector.

##### weight {#text-font-weight}

Type: `number` (optional)

Weight of the font; value must be a whole `number` in the range of `100..1000`. **Note**, when the `key` of this layout item is set to `"title"` within the layout's JSON
definition, this value will be ignored in favour of the user's preferred title settings, as set in property inspector.

#### text-overflow {#text-text-overflow}

Type: `"clip"`, `"ellipsis"`, `"fade"` (optional)

Defines how overflowing text should be rendered on the layout.

- clip, truncates the text at the boundary of the element (default).
- ellipsis, truncates the text prior to the boundary of the element, and adds an ellipsis (…) to the end.
- fade, applies a fade-gradient over the end of the text.

#### value {#text-value}

Type: `string` (optional)

Text to be displayed.

<!-- /generated -->
