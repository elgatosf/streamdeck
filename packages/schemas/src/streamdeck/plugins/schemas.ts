import type { Manifest_6_4 } from "./manifest/v6.4";
import type { Manifest_6_5 } from "./manifest/v6.5";
import type { Manifest_6_6 } from "./manifest/v6.6";
import type { Manifest_6_9 } from "./manifest/v6.9";
import type { Manifest_7_0 } from "./manifest/v7.0";
import type { Manifest_7_1 } from "./manifest/v7.1";

/**
 * Defines the plugin and available actions, and all information associated with them, including the plugin's entry point, all iconography, action default behavior, etc.
 */
export type Manifest =
	| JsonSchema<Manifest_6_4>
	| JsonSchema<Manifest_6_5>
	| JsonSchema<Manifest_6_6>
	| JsonSchema<Manifest_6_9>
	| JsonSchema<Manifest_7_0>
	| JsonSchema<Manifest_7_1>;

export type { Layout } from "./layout";

/**
 * @inheritdoc
 */
type JsonSchema<T> = T & {
	/**
	 * JSON schema responsible for describing the manifest's data format and validation.
	 */
	$schema?: string;
};
