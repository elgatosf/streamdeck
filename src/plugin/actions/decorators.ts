import type { Manifest } from "../../api";
import type { Constructor } from "../../common/utils";
import type { Unpack } from "../common/utils";
import type { SingletonAction } from "./singleton-action";

/**
 * Definition used to define an action.
 */
type ActionDefinition = Pick<Unpack<Manifest["Actions"]>, "UUID">;

/**
 * Defines a Stream Deck action associated with the plugin.
 * @param definition The definition of the action, e.g. it's identifier, name, etc.
 * @returns The definition decorator.
 */
export function action(definition: ActionDefinition) {
	const manifestId = definition.UUID;

	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unused-vars
	return function <T extends Constructor<SingletonAction>>(target: T, context: ClassDecoratorContext) {
		return class extends target {
			/**
			 * The universally-unique value that identifies the action within the manifest.
			 */
			public readonly manifestId: string | undefined = manifestId;
		};
	};
}
