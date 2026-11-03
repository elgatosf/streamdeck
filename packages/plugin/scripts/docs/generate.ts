/**
 * Generates the documentation partials within `docs/sdk` from the SDK's type declarations.
 *
 * Usage: tsx scripts/docs/generate.ts
 */
import * as action from "./generators/action.js";
import * as layout from "./generators/layout.js";
import * as manifest from "./generators/manifest.js";
import * as singletonAction from "./generators/singleton-action.js";
import * as websocket from "./generators/websocket.js";

await action.loadContent();
await layout.loadContent();
await manifest.loadContent();
await singletonAction.loadContent();
await websocket.loadContent();
