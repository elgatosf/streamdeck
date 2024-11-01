import { ReactiveController, ReactiveControllerHost } from "lit";

import { SDRadioElement } from "../components";
import { SDOptionElement } from "../components/option";

/**
 * Controller for tracking {@link SDOptionElement} elements within a host.
 */
export class OptionObserver implements ReactiveController {
	/**
	 * Current options within the host.
	 */
	public readonly options: (SDOptionElement | SDRadioElement)[];

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
		this.options = Array.from(this.#host.querySelectorAll("sd-option, sd-radio"));
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
				if (this.#isObservedElement(added)) {
					changed = true;
					this.options.push(added);
				}
			}

			// Removed.
			mutation.removedNodes.forEach((removed) => {
				if (!this.#isObservedElement(removed)) {
					return;
				}

				const index = this.options.indexOf(removed);
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

	/**
	 * Determines whether the specified node is an instance of an element this observer is tracking.
	 * @param node Node instance to check.
	 * @returns `true` when the node is an instance of an observed element type; otherwise `false`.
	 */
	#isObservedElement(node: Node): node is SDOptionElement | SDRadioElement {
		return node instanceof SDOptionElement || node instanceof SDRadioElement;
	}
}
