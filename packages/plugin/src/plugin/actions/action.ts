import type { JsonObject } from "@elgato/utils";

import type { DialAction } from "./dial.js";
import type { KeyAction } from "./key.js";
import type { NeoInfobarAction } from "./neo-infobar.js";

/**
 * Union of available action types.
 */
export type Action<TSettings extends JsonObject> =
	| DialAction<TSettings>
	| KeyAction<TSettings>
	| NeoInfobarAction<TSettings>;
