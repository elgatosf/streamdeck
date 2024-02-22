import { StreamDeck } from "./stream-deck";

export {
	Bar,
	BarSubType,
	Controller,
	Coordinates,
	DeviceInfo,
	DeviceType,
	FeedbackPayload,
	GBar,
	Language,
	Manifest,
	PayloadObject,
	Pixmap,
	RegistrationInfo,
	Size,
	State,
	Target,
	Text
} from "../api";
export { Action, ImageOptions, TitleOptions, TriggerDescriptionOptions } from "./actions/action";
export { action } from "./actions/decorators";
export { SingletonAction } from "./actions/singleton-action";
export { EventEmitter, EventsOf } from "./common/event-emitter";
export * from "./events";
export { LogLevel } from "./logging";

export const streamDeck = new StreamDeck();
export default streamDeck;
