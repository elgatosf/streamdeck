import { action, type DidReceiveSettingsEvent, SingletonAction } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.audio.play" })
class PlayAudio extends SingletonAction {
	/**
	 * Occurs when the settings are updated.
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
		// [!code highlight:4]
		await ev.action.setResources({
			audioFile: ev.payload.settings.userSelectedFile,
		});
	}
}

type Settings = {
	userSelectedFile: string;
};
