// Ref: https://sdpi-components.dev/docs/helpers/data-source#payload-structure

export type DataSourcePayload = {
	event: string;
	items: DataSourceResult;
};

export type DataSourceResult = DataSourceResultItem[];

export type DataSourceResultItem = Item | ItemGroup;

export type Item = {
	disabled?: boolean;
	label?: string;
	value: string;
};

export type ItemGroup = {
	label?: string;
	children: Item[];
};
