import type { JsonObject } from "@elgato/utils";

import type { DialAction } from "./transients/dial.js";
import type { KeyAction } from "./transients/key.js";
import type { NeoInfobarAction } from "./transients/neo-infobar.js";

/**
 * Union of available action types.
 */
export type Action<TSettings extends JsonObject> =
	| DialAction<TSettings>
	| KeyAction<TSettings>
	| NeoInfobarAction<TSettings>;
