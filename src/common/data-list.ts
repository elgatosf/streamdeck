/**
 * Collection of options.
 */
export class DataList {
	/**
	 * Options within the list.
	 */
	options: (Option | OptionGroup)[] = [];

	/**
	 * Initializes a new instance of the {@link DataList} class.
	 * @param options The options.
	 */
	constructor(options?: (Option | OptionGroup)[]) {
		this.options = options ?? [];
	}

	/**
	 * Maps the options within this list.
	 * @param mapOption Function responsible for mapping an option.
	 * @param mapOptionGroup Function responsible for mapping an option group.
	 * @returns Mapped options.
	 */
	public map<TOption, TOptionGroup>(
		mapOption: (option: Option) => TOption,
		mapOptionGroup: (optionGroup: OptionGroup, children: (TOption | TOptionGroup)[]) => TOptionGroup,
	): (TOption | TOptionGroup)[] | undefined {
		if (this.options.length === 0) {
			return;
		}

		const map = (value: Option | OptionGroup): TOption | TOptionGroup => {
			if (value instanceof Option) {
				return mapOption(value);
			} else if (value instanceof OptionGroup) {
				return mapOptionGroup(value, value.children.map(map));
			} else {
				throw new Error(`Failed to map data list: unknown option type`, { cause: value });
			}
		};

		return this.options.map(map);
	}
}

/**
 * Base option that provides shared information.
 */
class BaseOption {
	/**
	 * Determines whether the option is disabled; default `false`.
	 */
	public disabled: boolean = false;

	/**
	 * Label that represents the option.
	 */
	public label?: string;

	/**
	 * Initializes a new instance of the {@link BaseOption} class.
	 * @param option Initial information.
	 */
	constructor(option?: Partial<BaseOption>) {
		this.disabled = option?.disabled ?? false;
		this.label = option?.label;
	}
}

/**
 * Provides information for an option within a data list.
 */
export class Option extends BaseOption {
	/**
	 * Value this option represents.
	 */
	public value?: boolean | number | string;

	/**
	 * Initializes a new instance of the {@link Option} class.
	 * @param option Initial information.
	 */
	constructor(option?: Partial<Option>) {
		super(option);
		this.value = option?.value;
	}
}

/**
 * Provides a grouping of options within a data list.
 */
export class OptionGroup extends BaseOption {
	/**
	 * Child options within this group.
	 */
	public readonly children: (Option | OptionGroup)[] = [];

	/**
	 * Initializes a new instance of the {@link OptionGroup} class.
	 * @param option Initial information.
	 */
	constructor(group?: Partial<OptionGroup>) {
		super(group);
		this.children = group?.children ?? [];
	}
}
