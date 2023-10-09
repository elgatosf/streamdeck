import { StreamDeck } from "./stream-deck";

export { action } from "./actions/decorators";
export { SingletonAction } from "./actions/singleton-action";
export * from "./connectivity/layouts";
export { Target } from "./connectivity/target";
export * from "./events";
export { LogLevel } from "./logging";
export { Manifest } from "./manifest";

export default new StreamDeck();
