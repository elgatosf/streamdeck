import { PromiseCompletionSource } from "../common/promises";
import { StreamDeckConnection } from "../connectivity/connection";
import * as messages from "../connectivity/messages";
import { State } from "../connectivity/messages";
import { Device } from "../devices";
import {
	ActionEvent,
	ActionWithoutPayloadEvent,
	ApplicationDidLaunchEvent,
	ApplicationDidTerminateEvent,
	ApplicationEvent,
	DeviceDidConnectEvent,
	DeviceDidDisconnectEvent,
	DeviceEvent,
	DialDownEvent,
	DialRotateEvent,
	DialUpEvent,
	DidReceiveGlobalSettingsEvent,
	DidReceiveSettingsEvent,
	KeyDownEvent,
	KeyUpEvent,
	PropertyInspectorDidAppearEvent,
	PropertyInspectorDidDisappearEvent,
	SendToPluginEvent,
	TitleParametersDidChangeEvent,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent
} from "./events";
import { FeedbackPayload, StreamDeckClient as IStreamDeckClient, Target } from "./types/client";

/**
 * Provides the main bridge between the plugin and the Stream Deck allowing the plugin to send requests and receive events, e.g. when the user presses an action.
 */
export class StreamDeckClient implements IStreamDeckClient {
	/**
	 * Initializes a new instance of the {@link StreamDeckClient} class.
	 * @param connection Underlying connection with the Stream Deck.
	 * @param devices Device collection responsible for tracking devices.
	 */
	constructor(public readonly connection: StreamDeckConnection, private readonly devices: ReadonlyMap<string, Device>) {}

	/** @inheritdoc */
	public async getGlobalSettings<T = unknown>(): Promise<Partial<T>> {
		const settings = new PromiseCompletionSource<Partial<T>>();
		this.connection.once("didReceiveGlobalSettings", (msg: messages.DidReceiveGlobalSettings<T>) => settings.setResult(msg.payload.settings));

		await this.connection.send("getGlobalSettings", {
			context: this.connection.registrationParameters.pluginUUID
		});

		return settings.promise;
	}

	/** @inheritdoc */
	public async getSettings<T = unknown>(context: string): Promise<Partial<T>> {
		const settings = new PromiseCompletionSource<Partial<T>>();
		const callback = (msg: messages.DidReceiveSettings<T>) => {
			if (msg.context == context) {
				settings.setResult(msg.payload.settings);
				this.connection.removeListener("didReceiveSettings", callback);
			}
		};

		this.connection.on("didReceiveSettings", callback);
		await this.connection.send("getSettings", {
			context
		});

		return settings.promise;
	}

	/** @inheritdoc */
	public onApplicationDidLaunch(listener: (ev: ApplicationDidLaunchEvent) => void): void {
		this.connection.on("applicationDidLaunch", (ev) => listener(new ApplicationEvent(ev)));
	}

	/** @inheritdoc */
	public onApplicationDidTerminate(listener: (ev: ApplicationDidTerminateEvent) => void): void {
		this.connection.on("applicationDidTerminate", (ev) => listener(new ApplicationEvent(ev)));
	}

	/** @inheritdoc */
	public onDeviceDidConnect(listener: (ev: DeviceDidConnectEvent) => void): void {
		this.connection.on("deviceDidConnect", (ev) =>
			listener(
				new DeviceEvent(ev, {
					id: ev.device,
					isConnected: true,
					...ev.deviceInfo
				})
			)
		);
	}

	/** @inheritdoc */
	public onDeviceDidDisconnect(listener: (ev: DeviceDidDisconnectEvent) => void): void {
		this.connection.on("deviceDidDisconnect", (ev) =>
			listener(
				new DeviceEvent(
					ev,
					this.devices.get(ev.device) || {
						id: ev.device,
						isConnected: false
					}
				)
			)
		);
	}

	/** @inheritdoc */
	public onDialDown<TSettings = unknown>(listener: (ev: DialDownEvent<TSettings>) => void): void {
		this.connection.on("dialDown", (ev: messages.DialDown<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/** @inheritdoc */
	public onDialRotate<TSettings = unknown>(listener: (ev: DialRotateEvent<TSettings>) => void): void {
		this.connection.on("dialRotate", (ev: messages.DialRotate<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/** @inheritdoc */
	public onDialUp<TSettings = unknown>(listener: (ev: DialUpEvent<TSettings>) => void): void {
		this.connection.on("dialUp", (ev: messages.DialUp<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/** @inheritdoc */
	public onDidReceiveGlobalSettings<TSettings = unknown>(listener: (ev: DidReceiveGlobalSettingsEvent<TSettings>) => void): void {
		this.connection.on("didReceiveGlobalSettings", (ev: messages.DidReceiveGlobalSettings<TSettings>) => listener(new DidReceiveGlobalSettingsEvent(ev)));
	}

	/** @inheritdoc */
	public onDidReceiveSettings<TSettings = unknown>(listener: (ev: DidReceiveSettingsEvent<TSettings>) => void): void {
		this.connection.on("didReceiveSettings", (ev: messages.DidReceiveSettings<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/** @inheritdoc */
	public onKeyDown<TSettings = unknown>(listener: (ev: KeyDownEvent<TSettings>) => void): void {
		this.connection.on("keyDown", (ev: messages.KeyDown<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/** @inheritdoc */
	public onKeyUp<TSettings = unknown>(listener: (ev: KeyUpEvent<TSettings>) => void): void {
		this.connection.on("keyUp", (ev: messages.KeyUp<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/** @inheritdoc */
	public onPropertyInspectorDidAppear(listener: (ev: PropertyInspectorDidAppearEvent) => void): void {
		this.connection.on("propertyInspectorDidAppear", (ev: messages.PropertyInspectorDidAppear) => listener(new ActionWithoutPayloadEvent(this, ev)));
	}

	/** @inheritdoc */
	public onPropertyInspectorDidDisappear(listener: (ev: PropertyInspectorDidDisappearEvent) => void): void {
		this.connection.on("propertyInspectorDidDisappear", (ev: messages.PropertyInspectorDidDisappear) => listener(new ActionWithoutPayloadEvent(this, ev)));
	}

	/** @inheritdoc */
	public onSendToPlugin<TPayload extends object>(listener: (ev: SendToPluginEvent<TPayload>) => void): void {
		this.connection.on("sendToPlugin", (ev: messages.SendToPlugin<TPayload>) => listener(new SendToPluginEvent(this, ev)));
	}

	/** @inheritdoc */
	public onSystemDidWakeUp(listener: () => void) {
		this.connection.on("systemDidWakeUp", () => listener());
	}

	/** @inheritdoc */
	public onTitleParametersDidChange<TSettings = unknown>(listener: (ev: TitleParametersDidChangeEvent<TSettings>) => void): void {
		this.connection.on("titleParametersDidChange", (ev: messages.TitleParametersDidChange<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/** @inheritdoc */
	public onTouchTap<TSettings = unknown>(listener: (ev: TouchTapEvent<TSettings>) => void): void {
		this.connection.on("touchTap", (ev: messages.TouchTap<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/** @inheritdoc */
	public onWillAppear<TSettings = unknown>(listener: (ev: WillAppearEvent<TSettings>) => void): void {
		this.connection.on("willAppear", (ev: messages.WillAppear<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/** @inheritdoc */
	public onWillDisappear<TSettings = unknown>(listener: (ev: WillDisappearEvent<TSettings>) => void): void {
		this.connection.on("willDisappear", (ev: messages.WillDisappear<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/** @inheritdoc */
	public openUrl(url: string): Promise<void> {
		return this.connection.send("openUrl", {
			payload: {
				url
			}
		});
	}

	/** @inheritdoc */
	public sendToPropertyInspector(context: string, payload: unknown): Promise<void> {
		return this.connection.send("sendToPropertyInspector", {
			context,
			payload
		});
	}

	/** @inheritdoc */
	public setFeedback(context: string, feedback: FeedbackPayload): Promise<void> {
		// TODO: Should we rename this to "updateLayout"?
		return this.connection.send("setFeedback", {
			context,
			payload: feedback
		});
	}

	/** @inheritdoc */
	public setFeedbackLayout(context: string, layout: string): Promise<void> {
		// TODO: Should we rename this to simply be "setLayout"?
		return this.connection.send("setFeedbackLayout", {
			context,
			payload: {
				layout
			}
		});
	}

	/** @inheritdoc */
	public setGlobalSettings(settings: unknown): Promise<void> {
		return this.connection.send("setGlobalSettings", {
			context: this.connection.registrationParameters.pluginUUID,
			payload: settings
		});
	}

	/** @inheritdoc */
	public setImage(context: string, image: string, state: State | undefined = undefined, target: Target = Target.HardwareAndSoftware): Promise<void> {
		return this.connection.send("setImage", {
			context,
			payload: {
				image,
				target,
				state
			}
		});
	}

	/** @inheritdoc */
	public setSettings(context: string, settings: unknown): Promise<void> {
		return this.connection.send("setSettings", {
			context,
			payload: settings
		});
	}

	/** @inheritdoc */
	public setState(context: string, state: State): Promise<void> {
		return this.connection.send("setState", {
			context,
			payload: {
				state
			}
		});
	}

	/** @inheritdoc */
	public setTitle(context: string, title?: string, state: State | undefined = undefined, target: Target = Target.HardwareAndSoftware): Promise<void> {
		return this.connection.send("setTitle", {
			context,
			payload: {
				title,
				state,
				target
			}
		});
	}

	/** @inheritdoc */
	public showAlert(context: string): Promise<void> {
		return this.connection.send("showAlert", {
			context
		});
	}

	/** @inheritdoc */
	public showOk(context: string): Promise<void> {
		return this.connection.send("showOk", {
			context
		});
	}

	/** @inheritdoc */
	public switchToProfile(profile: string, device: string): Promise<void> {
		return this.connection.send("switchToProfile", {
			context: this.connection.registrationParameters.pluginUUID,
			device,
			payload: {
				profile
			}
		});
	}
}
