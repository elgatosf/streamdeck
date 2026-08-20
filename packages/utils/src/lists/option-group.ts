import { z } from "zod/v4-mini";

import type { DataList } from "./data-list.js";
import { Option } from "./option.js";

/**
 * Serializable structure that represents a group of options.
 */
export type OptionGroup = {
	/**
	 * Discriminator property used to identify an option group.
	 */
	readonly type: "option-group";

	/**
	 * Determines whether the option group is disabled.
	 */
	disabled?: boolean;

	/**
	 * Options within the group.
	 */
	options: DataList;

	/**
	 * Label that represents the option group.
	 */
	label: string;
};

/**
 * Serializable structure that represents a group of options.
 */
export const OptionGroup: z.ZodMiniType<OptionGroup> = z.object({
	type: z.literal("option-group"),
	disabled: z.optional(z.boolean()),
	options: z.lazy(() => z.array(z.union([Option, OptionGroup]))),
	label: z.string(),
});

/**
 * Creates a new option group.
 * @param props Properties that define the option group.
 * @returns The option group.
 */
export function optionGroup(props: OptionGroupProps): OptionGroup {
	const { disabled, options, label } = props;
	return {
		type: "option-group",
		disabled,
		label,
		options,
	};
}

/**
 * Properties that define an option group.
 */
type OptionGroupProps = Omit<OptionGroup, "type">;
