import type * as protocol from "@streamdeck/core";
import { expectTypeOf, it } from "vitest";

import type * as sdk from "../index.js";

it("re-exports the existing protocol types from core", () => {
	expectTypeOf<sdk.Bar>().toEqualTypeOf<protocol.Bar>();
	expectTypeOf<sdk.Controller>().toEqualTypeOf<protocol.Controller>();
	expectTypeOf<sdk.Coordinates>().toEqualTypeOf<protocol.Coordinates>();
	expectTypeOf<sdk.DeviceInfo>().toEqualTypeOf<protocol.DeviceInfo>();
	expectTypeOf<sdk.FeedbackPayload>().toEqualTypeOf<protocol.FeedbackPayload>();
	expectTypeOf<sdk.GBar>().toEqualTypeOf<protocol.GBar>();
	expectTypeOf<sdk.Language>().toEqualTypeOf<protocol.Language>();
	expectTypeOf<sdk.Manifest>().toEqualTypeOf<protocol.Manifest>();
	expectTypeOf<sdk.Pixmap>().toEqualTypeOf<protocol.Pixmap>();
	expectTypeOf<sdk.RegistrationInfo>().toEqualTypeOf<protocol.RegistrationInfo>();
	expectTypeOf<sdk.Size>().toEqualTypeOf<protocol.Size>();
	expectTypeOf<sdk.State>().toEqualTypeOf<protocol.State>();
	expectTypeOf<sdk.Text>().toEqualTypeOf<protocol.Text>();
});
