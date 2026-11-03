import { sdkDeclarations } from "../ast/dts-reader.js";
import { ContentWriter } from "../content/index.js";

const name = "stream-deck-plugin-singleton-action";

const allActionTypeEvents = [
	"onDidReceiveResources",
	"onDidReceiveSettings",
	"onPropertyInspectorDidAppear",
	"onPropertyInspectorDidDisappear",
	"onSendToPlugin",
	"onTitleParametersDidChange",
	"onWillAppear",
	"onWillDisappear",
];

/**
 * Generates content from the `SingletonAction` class.
 */
export async function loadContent(): Promise<void> {
	const writer = new ContentWriter(name);

	// Load the `SingletonAction` type from @elgato/streamdeck.
	const type = sdkDeclarations.getStructure("SingletonAction");
	if (!type.isObject()) {
		throw new Error("Expected SingletonAction to be an object");
	}

	await writer.writeMethods("guides/_actions-events.g.mdx", type, (m) => {
		return allActionTypeEvents.includes(m.name);
	});

	await writer.writeMethods("guides/_keys-events.g.mdx", type, (m) =>
		[...allActionTypeEvents, "onKeyDown", "onKeyUp"].includes(m.name),
	);

	await writer.writeMethods("guides/_dials-events.g.mdx", type, (m) =>
		[...allActionTypeEvents, "onDialDown", "onDialUp", "onTouchTap", "onDialRotate"].includes(m.name),
	);
}
