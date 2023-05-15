export type StreamDeckEvent<T> = {
	event: T;
};

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

export type InboundEvents = DidReceiveGlobalSettings | DidReceiveSettings;
export type OutboundEvents =
	| "getGlobalSettings"
	| "getSettings"
	| "logMessage"
	| "openUrl"
	| "sendToPropertyInspector"
	| "setGlobalSettings"
	| "setFeedback"
	| "setFeedbackLayout"
	| "setImage"
	| "setSettings"
	| "setState"
	| "setTitle"
	| "showAlert"
	| "showOk"
	| "switchToProfile";
