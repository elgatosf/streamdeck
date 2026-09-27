import type { Manifest_6_4 } from "./manifest/v6.4";
import type { Manifest_6_5 } from "./manifest/v6.5";
import type { Manifest_6_6 } from "./manifest/v6.6";
import type { Manifest_6_9 } from "./manifest/v6.9";
import type { Manifest_7_0 } from "./manifest/v7.0";
import type { Manifest_7_1 } from "./manifest/v7.1";
import type { Manifest_7_6 } from "./manifest/v7.6";

import type { StreamDeckNeoLayoutSchema } from "./layout/stream-deck-neo";
import type { StreamDeckPlusLayoutSchema } from "./layout/stream-deck-plus";

/**
 * Defines the plugin and available actions, and all information associated with them, including the plugin's entry point, all iconography, action default behavior, etc.
 */
export type Manifest =
	| JsonSchema<Manifest_6_4>
	| JsonSchema<Manifest_6_5>
	| JsonSchema<Manifest_6_6>
	| JsonSchema<Manifest_6_9>
	| JsonSchema<Manifest_7_0>
	| JsonSchema<Manifest_7_1>
	| JsonSchema<Manifest_7_6>;

/**
 * Defines the structure of a custom layout rendered on a Stream Deck + or Stream Deck Neo.
 */
export type Layout = JsonSchema<StreamDeckNeoLayoutSchema> | JsonSchema<StreamDeckPlusLayoutSchema>;

/**
 * @inheritdoc
 */
type JsonSchema<T> = T & {
	/**
	 * JSON schema responsible for describing the manifest's data format and validation.
	 */
	$schema?: string;
};
