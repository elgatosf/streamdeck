import type { KeyDownEvent } from "@elgato/streamdeck";
import streamDeck, { action, SingletonAction } from "@elgato/streamdeck";
import path from "node:path";
import sharp from "sharp";

/**
 * Action that resizes an image to the specified dimensions.
 */
@action({ UUID: "com.elgato.image-resizer.resize" })
export class ResizeImage extends SingletonAction<ResizeImageSettings> {
	override async onKeyDown(ev: KeyDownEvent<ResizeImageSettings>): Promise<void> {
		const { payload, action } = ev;
		const { settings } = payload;
		const { imagePath, extension = "jpg" } = settings;
		const width = settings.width ?? 1920;
		const height = settings.height ?? 1080;

		try {
			const parsedWidth = typeof width === "string" ? parseInt(width, 10) : width;
			const parsedHeight = typeof height === "string" ? parseInt(height, 10) : height;

			if (isNaN(parsedWidth) || isNaN(parsedHeight) || parsedWidth <= 0 || parsedHeight <= 0) {
				action.showAlert();
				streamDeck.logger.error("Invalid width or height specified.");
				return;
			}

			if (!imagePath) {
				action.showAlert();
				streamDeck.logger.error("No image path specified.");
				return;
			}

			const { dir, name } = path.parse(imagePath);
			const outputPath = path.join(dir, `${name} (${parsedWidth}x${parsedHeight}).${extension}`);

			await sharp(imagePath).resize(parsedWidth, parsedHeight).toFormat(extension).toFile(outputPath);

			action.showOk();
		} catch (error) {
			action.showAlert();
			streamDeck.logger.error("Failed to resize image:", error);
		}
	}
}

/**
 * Settings for {@link ResizeImage}.
 */
type ResizeImageSettings = {
	imagePath?: string;
	width?: number | string;
	height?: number | string;
	extension?: "jpg" | "png" | "webp";
};
