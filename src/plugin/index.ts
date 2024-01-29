import { StreamDeck } from "./stream-deck";

export { DeviceType, Target, type Language, type Manifest, type PayloadObject, type RegistrationInfo } from "../api";
export * from "../api/layout";
export { Action } from "./actions/action";
export { action } from "./actions/decorators";
export { SingletonAction } from "./actions/singleton-action";
export { EventEmitter, EventsOf } from "./common/event-emitter";
export * from "./events";
export { LogLevel } from "./logging";

export const streamDeck = new StreamDeck();
export default streamDeck;
