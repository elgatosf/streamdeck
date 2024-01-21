import type { ApplicationDidLaunch, ApplicationDidTerminate } from "../../api";
import { Event } from "./event";

/**
 * Provides information for events relating to an application.
 */
export class ApplicationEvent<T extends ApplicationDidLaunch | ApplicationDidTerminate> extends Event<T> {
	/**
	 * Monitored application that was launched/terminated.
	 */
	public readonly application: string;

	/**
	 * Initializes a new instance of the {@link ApplicationEvent} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(source: T) {
		super(source);
		this.application = source.payload.application;
	}
}
