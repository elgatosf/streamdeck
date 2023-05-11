type Contextual = {
	context: string;
};

export type DidReceiveGlobalSettings<TSettings = unknown> = {
	event: "didReceiveGlobalSettings";
	payload: {
		settings: TSettings;
	};
};

export type DidReceiveSettings<TSettings = unknown> = Contextual & {
	action: string;
	event: "didReceiveSettings";
	device: string;
	payload: {
		isInMultiAction: boolean;
		coordinates: {
			column: number;
			row: number;
		};
		settings: TSettings;
	};
};

export type EventsReceived = DidReceiveGlobalSettings | DidReceiveSettings;
