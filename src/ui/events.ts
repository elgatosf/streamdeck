import type { DidReceiveSettings, PayloadObject } from "../api";
import type { ActionEvent } from "../common/events";
import type { Action } from "./action";

export { DidReceiveGlobalSettingsEvent } from "../common/events";

/**
 * Event information received from Stream Deck when the UI receives settings.
 */
export type DidReceiveSettingsEvent<TSettings extends PayloadObject<TSettings>> = ActionEvent<DidReceiveSettings<TSettings>, Action<TSettings>>;
