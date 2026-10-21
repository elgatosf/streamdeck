import streamdeck, {
	Action,
	action,
	DidReceiveSettingsEvent,
	KeyAction,
	KeyDownEvent,
	Language,
	SingletonAction,
	WillAppearEvent,
} from "@elgato/streamdeck";

/**
 * An example action class that displays a randomized string from the various supported locales
 */
@action({ UUID: "com.elgato.hello-world.newstring" })
export class NewString extends SingletonAction<NewStringSettings> {
	/**
	 * Called whenever a NewString action is created by the Stream Deck software
	 */
	override async onWillAppear(ev: WillAppearEvent<NewStringSettings>): Promise<void> {
		if (!ev.action.isKey()) return;

		let settings = ev.payload.settings;
		// If we don't have a title key already, set it to "clickme"
		if (!ev.payload.settings.titleKey) {
			settings = { ...ev.payload.settings, titleKey: "clickme" };
			ev.action.setSettings(settings);
		}
		this.displayTitleFromSettings(settings, ev.action);
	}

	/**
	 * Called when the Property Inspector changes the selected language
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<NewStringSettings>): Promise<void> {
		if (!ev.action.isKey()) return;

		this.displayTitleFromSettings(ev.payload.settings, ev.action);
	}

	/**
	 * Called when the user presses a key with this action on their Stream Deck
	 */
	override async onKeyDown(ev: KeyDownEvent<NewStringSettings>): Promise<void> {
		// Pick a random string
		const titleKey = this.pickRandomKey();

		// Save it to our settings
		const settings = { ...ev.payload.settings, titleKey };
		ev.action.setSettings(settings);

		this.displayTitleFromSettings(settings, ev.action);
	}

	/**
	 * Fetches the settings from the provided settings object and then displays it as a title on the action
	 */
	async displayTitleFromSettings(settings: NewStringSettings, action: KeyAction<NewStringSettings>) {
		// Fetch the string that we have saved in the settings
		const titleKey = settings.titleKey;
		if (!titleKey) {
			return;
		}

		// Localize it
		const title = streamdeck.i18n.translate(titleKey, settings.language);
		const language = streamdeck.i18n.translate("thisLanguage", settings.language);

		// Display it
		await action.setTitle(`${language}\n\n${title}`);
	}

	/**
	 * Picks a random key value to use for translation lookups
	 */
	pickRandomKey() {
		const options = [
			"flash",
			"selectprop",
			"on",
			"off",
			"toggle",
			"action",
			"dynamic",
			"clickme",
		];
		const index = Math.floor(Math.random() * options.length);
		return options[index];
	}
}

type NewStringSettings = {
	language: Language | undefined;
	titleKey: string | undefined;
};
