import { ReactiveController, ReactiveControllerHost, type ReactiveElement } from "lit";

import { DataList, Option, OptionGroup } from "../../common/data-list";
import { SDOptionElement } from "../components/option";
import { SDOptionGroupElement } from "../components/option-group";

/**
 * Controller for a data list that is formed from slotted elements within the host.
 */
export class SlottedDataListController implements ReactiveController {
	/**
	 * Data list managed by this controller.
	 */
	public readonly dataList: DataList = new DataList();

	/**
	 * Host this controller is attached to.
	 */
	readonly #host: ReactiveElement & ReactiveControllerHost;

	/**
	 * Underlying mutation observer monitoring changes to the shadow DOM.
	 */
	readonly #observer: MutationObserver;

	/**
	 * Initializes a new instance of the {@link OptionController} class.
	 * @param host Host to attach to.
	 */
	constructor(host: ReactiveElement & ReactiveControllerHost) {
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

		this.#syncOptions();
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
		const isOptionOrOptionGroup = (node: Node) =>
			node instanceof SDOptionElement || node instanceof SDOptionGroupElement;

		for (const { addedNodes, removedNodes, target } of mutations) {
			if (isOptionOrOptionGroup(target)) {
				return true;
			}

			for (const added of addedNodes) {
				if (isOptionOrOptionGroup(added)) {
					return true;
				}
			}

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
			this.#syncOptions();
			this.#host.requestUpdate();
		}
	}

	/**
	 * Synchronizes the options from the DOM, the the {@link SlottedDataListController.dataList}.
	 */
	#syncOptions(): void {
		const getOptionsOf = (parent: HTMLElement) => {
			const elements = Array.from(parent.querySelectorAll(":scope > sd-option, :scope > sd-option-group"));
			const reducer = (options: (Option | OptionGroup)[], node: Node): (Option | OptionGroup)[] => {
				if (node instanceof SDOptionElement) {
					options.push(
						new Option({
							disabled: node.disabled,
							label: node.textContent ?? undefined,
							value: node.typedValue,
						}),
					);
				} else if (node instanceof SDOptionGroupElement) {
					options.push(
						new OptionGroup({
							children: getOptionsOf(node),
							disabled: node.disabled,
							label: node.label ?? "",
						}),
					);
				}

				return options;
			};

			return elements.reduce(reducer, []);
		};

		this.dataList.options = getOptionsOf(this.#host);
	}
}
