import { ReactiveController, ReactiveControllerHost } from "lit";

import { SDOptionElement } from "../components/option";

/**
 * Controller for tracking {@link SDOptionElement} within a host.
 * @deprecated Previously used by group elements... may serve a purpose in the future?
 */
export class OptionController implements ReactiveController {
	/**
	 * Current options within the host.
	 */
	public readonly options: SDOptionElement[] = [];

	/**
	 * Host this controller is attached to.
	 */
	readonly #host: HTMLElement & ReactiveControllerHost;

	/**
	 * Underlying mutation observer monitoring changes to the shadow DOM.
	 */
	readonly #observer: MutationObserver;

	/**
	 * Requests a host update which is processed asynchronously.
	 */
	readonly #requestUpdate: () => void;

	/**
	 * Initializes a new instance of the {@link OptionController} class.
	 * @param host Host to attach to.
	 */
	constructor(host: HTMLElement & ReactiveControllerHost) {
		this.#host = host;
		this.#host.addController(this);
		this.#requestUpdate = (): void => this.#host.requestUpdate();

		this.#observer = new MutationObserver((mutations: MutationRecord[]) => this.#onMutation(mutations));
		this.#setOptionsByQueryingHost();
	}

	/**
	 * @inheritdoc
	 */
	public hostConnected(): void {
		this.#observer.observe(this.#host, { childList: true });
	}

	/**
	 * @inheritdoc
	 */
	public hostDisconnected(): void {
		this.#observer.disconnect();
	}

	/**
	 * Handles a mutation on the host's shadow DOM, updating the tracked collection of nodes.
	 * @param mutations Mutations that occurred.
	 */
	#onMutation(mutations: MutationRecord[]): void {
		let isOptionRemoved = false;

		for (const { addedNodes, removedNodes } of mutations) {
			// When a new option was added, simply rebuild the collection of options to maintain correct ordering.
			for (const added of addedNodes) {
				if (added instanceof SDOptionElement) {
					this.#setOptionsByQueryingHost();
					return;
				}
			}

			// When an option was removed, remove it from the collection, but continue the evaluation.
			for (const removed of removedNodes) {
				if (removed instanceof SDOptionElement) {
					const index = this.options.indexOf(removed);
					if (index !== -1) {
						this.options
							.splice(index, 1)
							.forEach((option) => option.removeEventListener("update", this.#requestUpdate));

						isOptionRemoved = true;
					}
				}
			}
		}

		if (isOptionRemoved) {
			this.#host.requestUpdate();
		}
	}

	/**
	 * Sets the options associated with this instance by querying the host.
	 */
	#setOptionsByQueryingHost(): void {
		this.options.length = 0;

		this.#host.querySelectorAll(":scope > sd-option").forEach((option) => {
			if (!(option instanceof SDOptionElement)) {
				return;
			}

			this.options.push(option);
			option.addEventListener("update", this.#requestUpdate);
		});

		this.#host.requestUpdate();
	}
}
