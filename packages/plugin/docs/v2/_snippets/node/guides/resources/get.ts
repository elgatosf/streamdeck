import { action, type DidReceiveSettingsEvent, type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

import { audioService } from "./audio-service";

@action({ UUID: "com.elgato.audio.play" })
class PlayAudio extends SingletonAction {
	/**
	 * Occurs when the settings are updated.
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
		await ev.action.setResources({
			audioFile: ev.payload.settings.userSelectedFile,
		});
	}

	/**
	 * Occurs when the key is pressed down.
	 */
	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		// [!code highlight:5]
		const filePath = ev.payload.resources.audioFile;
		if (filePath) {
			await audioService.play(ev.payload.resources.audioFile);
		}
	}
}

type Settings = {
	userSelectedFile: string;
};
