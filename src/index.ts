import { StreamDeck } from "./stream-deck";

export { Action } from "./actions/action";
export { action } from "./actions/decorators";
export { SingletonAction } from "./actions/singleton-action";
export { DeviceType } from "./api/device";
export * from "./api/layout";
export { Manifest } from "./api/manifest";
export { RegistrationInfo } from "./api/registration";
export { Target } from "./api/target";
export { EventEmitter, EventsOf } from "./common/event-emitter";
export * from "./events";
export { LogLevel } from "./logging";

export default new StreamDeck();
