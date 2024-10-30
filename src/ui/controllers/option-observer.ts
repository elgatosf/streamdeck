import { ReactiveController, ReactiveControllerHost } from "lit";

import { SDOptionElement } from "../components/option";

/**
 * Controller for tracking {@link SDOptionElement} elements within a host.
 */
export class OptionObserver implements ReactiveController {
	/**
	 * Current options within the host.
	 */
	public readonly options: SDOptionElement[];

	/**
	 * Host this controller is attached to.
	 */
	readonly #host: HTMLElement & ReactiveControllerHost;

	/**
	 * Underlying mutation observer monitoring changes to the shadow DOM.
	 */
	readonly #observer: MutationObserver;

	/**
	 * Initializes a new instance of the {@link OptionObserver} class.
	 * @param host Host to attached to.
	 */
	constructor(host: HTMLElement & ReactiveControllerHost) {
		this.#host = host;
		this.#observer = new MutationObserver((mutations: MutationRecord[]) => this.#onMutation(mutations));

		// Add the controller, and determine the initial set of options.
		this.#host.addController(this);
		this.options = Array.from(this.#host.querySelectorAll("sd-option"));
	}

	/**
	 * @inheritdoc
	 */
	public hostConnected(): void {
		this.#observer.observe(this.#host, {
			childList: true,
		});
	}

	/**
	 * @inheritdoc
	 */
	public hostDisconnected(): void {
		this.#observer.disconnect();
	}

	/**
	 * Handles a mutation on the host's shadow DOM, updating the tracked collection of {@link SDOptionElement}.
	 * @param mutations Mutations that occurred.
	 */
	#onMutation(mutations: MutationRecord[]): void {
		let changed = false;

		mutations.forEach((mutation) => {
			// Added.
			for (const added of mutation.addedNodes) {
				if (added instanceof SDOptionElement) {
					changed = true;
					this.options.push(added);
				}
			}

			// Removed.
			mutation.removedNodes.forEach((node) => {
				if (!(node instanceof SDOptionElement)) {
					return;
				}

				const index = this.options.indexOf(node);
				if (index !== -1) {
					changed = true;
					this.options.splice(index, 1);
				}
			});
		});

		if (changed) {
			this.#host.requestUpdate();
		}
	}
}
