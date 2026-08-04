import type { OptionGroup } from "./option-group.js";
import type { Option } from "./option.js";

/**
 * Collection of options and/or option groups.
 */
export type DataList = (Option | OptionGroup)[];
