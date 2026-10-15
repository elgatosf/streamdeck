import { type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import z from "zod";

// Define the Zod schema.
const Settings = z.object({
	name: z.string().default("Elgato"),
});

// Infer the settings type.
type Settings = z.infer<typeof Settings>;

/**
 * An example action that demonstrates parsing settings with Zod.
 */
export class MyAction extends SingletonAction<Settings> {
	/**
	 * Occurs when the user presses the key action.
	 */
	override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
		/*
		 * Settings can safely be undefined here, Zod
		 * will fallback `name` to "Elgato".
		 */
		const { name } = Settings.parse(ev.payload.settings);
		name.toLowerCase(); // "elgato"
	}
}
