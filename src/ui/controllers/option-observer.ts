import { ReactiveController, ReactiveControllerHost, type ReactiveElement } from "lit";

import { DataList, Option, OptionGroup } from "../../common/data-list";
import { SDOptionElement } from "../components/option";
import { SDOptionGroupElement } from "../components/option-group";

/**
 * Controller capable of observing for mutations of {@link SDOptionElement} and {@link SDOptionGroupElement} within the host.
 */
export class OptionObserver implements ReactiveController {
	/**
	 * Data list that contains the options observed by this controller.
	 */
	public readonly dataList: DataList = new DataList();

	/**
	 * Host this controller is attached to.
	 */
	readonly #host: ReactiveControllerHost & ReactiveElement;

	/**
	 * Underlying mutation observer monitoring changes to the shadow DOM.
	 */
	readonly #observer: MutationObserver;

	/**
	 * Initializes a new instance of the {@link OptionObserver} class.
	 * @param host Host to attach to.
	 */
	constructor(host: ReactiveControllerHost & ReactiveElement) {
		this.#host = host;
		this.#host.addController(this);

		this.#observer = new MutationObserver((mutations: MutationRecord[]) => this.#onMutation(mutations));
	}

	/**
	 * @inheritdoc
	 */
	public hostConnected(): void {
		this.#observer.observe(this.#host, {
			attributes: true,
			childList: true,
			subtree: true,
		});

		this.dataList.options = this.#getOptionsOf(this.#host);
	}

	/**
	 * @inheritdoc
	 */
	public hostDisconnected(): void {
		this.#observer.disconnect();
	}

	/**
	 * Determines whether the mutation records includes a mutation on an option, or option group.
	 * @param mutations Collection of mutations to check.
	 * @returns `true` when a mutation is for an option, or option group; otherwise `false`.
	 */
	#isOptionOrOptionGroupMutation(mutations: MutationRecord[]): boolean {
		const isOptionOrOptionGroup = (node: Node): node is SDOptionElement | SDOptionGroupElement =>
			node instanceof SDOptionElement || node instanceof SDOptionGroupElement;

		for (const { addedNodes, removedNodes, target } of mutations) {
			// Check if an option or group had its contents updated.
			if (isOptionOrOptionGroup(target)) {
				return true;
			}

			// Check if an option or group was added.
			for (const added of addedNodes) {
				if (isOptionOrOptionGroup(added)) {
					return true;
				}
			}

			// Check if an option or group was removed.
			for (const removed of removedNodes) {
				if (isOptionOrOptionGroup(removed)) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Handles a mutation on the host's shadow DOM, updating the tracked collection of nodes.
	 * @param mutations Mutations that occurred.
	 */
	#onMutation(mutations: MutationRecord[]): void {
		if (this.#isOptionOrOptionGroupMutation(mutations)) {
			this.dataList.options = this.#getOptionsOf(this.#host);
			this.#host.requestUpdate();
		}
	}

	/**
	 * Gets the options of the specified element.
	 * @param parent Element to search for options, and option groups.
	 * @returns The options within the element.
	 */
	#getOptionsOf(parent: HTMLElement): (Option | OptionGroup)[] {
		const elements = Array.from(parent.querySelectorAll(":scope > sd-option, :scope > sd-option-group"));

		const reducer = (options: (Option | OptionGroup)[], node: Node): (Option | OptionGroup)[] => {
			if (node instanceof SDOptionElement) {
				// Add the option.
				options.push(
					new Option({
						disabled: node.disabled,
						label: node.textContent ?? undefined,
						selected: node.htmlSelected,
						value: node.htmlValue,
					}),
				);
			} else if (node instanceof SDOptionGroupElement) {
				// Add the group, and recursively discover its children.
				options.push(
					new OptionGroup({
						children: this.#getOptionsOf(node),
						disabled: node.disabled,
						label: node.label ?? "",
					}),
				);
			}

			return options;
		};

		return elements.reduce(reducer, []);
	}
}
