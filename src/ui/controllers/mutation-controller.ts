import { ReactiveController, ReactiveControllerHost } from "lit";

/**
 * Controller for tracking filtered mutations within a host.
 */
export class MutationController<T extends Node> implements ReactiveController {
	/**
	 * Current nodes within the host that match the filter.
	 */
	public readonly nodes: T[] = [];

	/**
	 * Host this controller is attached to.
	 */
	readonly #host: HTMLElement & ReactiveControllerHost;

	/**
	 * Underlying mutation observer monitoring changes to the shadow DOM.
	 */
	readonly #observer: MutationObserver;

	/**
	 * Mutation observation options.
	 */
	readonly #options?: MutationObserverInit;

	/**
	 * Predicate that determines if the node is tracked by the host.
	 */
	readonly #predicate: (node: Node) => node is T;

	/**
	 * Initializes a new instance of the {@link MutationController} class.
	 * @param host Host to attached to.
	 * @param predicate Function that determines if a node should be tracked.
	 * @param options Mutation observation options; by default only `childList` is true.
	 */
	constructor(
		host: HTMLElement & ReactiveControllerHost,
		predicate: (node: Node) => node is T,
		options?: MutationObserverInit,
	) {
		this.#host = host;
		this.#host.addController(this);
		this.#predicate = predicate;
		this.#options = options;

		this.#observer = new MutationObserver((mutations: MutationRecord[]) => this.#onMutation(mutations));
		this.#setNodesByQueryingHost();
	}

	/**
	 * @inheritdoc
	 */
	public hostConnected(): void {
		this.#observer.observe(this.#host, {
			childList: true,
			...(this.#options || {}),
		});
	}

	/**
	 * @inheritdoc
	 */
	public hostDisconnected(): void {
		this.#observer.disconnect();
	}

	/**
	 * Evaluates a mutation, and determines whether a rebuild is required, or whether the collection of nodes changed.
	 * @param mutations Mutations that occurred.
	 * @returns Result of the evaluation.
	 */
	#evaluateMutation(mutations: MutationRecord[]): MutationEvaluationResult {
		const result: MutationEvaluationResult = {
			rebuildNodes: false,
			requestUpdate: false,
		};

		for (const { addedNodes, removedNodes, target, type } of mutations) {
			// When a new node was added, simply rebuild the collection of nodes to maintain correct ordering.
			for (const added of addedNodes) {
				if (this.#predicate(added)) {
					result.rebuildNodes = true;
					result.requestUpdate = true;

					return result;
				}
			}

			// When a node was removed, remove it from the collection, but continue the evaluation.
			for (const removed of removedNodes) {
				if (this.#predicate(removed)) {
					const index = this.nodes.indexOf(removed);
					if (index !== -1) {
						this.nodes.splice(index, 1);
						result.requestUpdate = true;
					}
				}
			}

			// When an attribute changed, check if it originates from a tracked node.
			if (type === "attributes" && this.#predicate(target)) {
				result.requestUpdate = true;
			}
		}

		return result;
	}

	/**
	 * Handles a mutation on the host's shadow DOM, updating the tracked collection of nodes.
	 * @param mutations Mutations that occurred.
	 */
	#onMutation(mutations: MutationRecord[]): void {
		const { rebuildNodes, requestUpdate } = this.#evaluateMutation(mutations);

		if (rebuildNodes) {
			this.#setNodesByQueryingHost();
			this.#host.requestUpdate();
		} else if (requestUpdate) {
			this.#host.requestUpdate();
		}
	}

	/**
	 * Sets the nodes associated with this instance by querying the host.
	 */
	#setNodesByQueryingHost(): void {
		this.nodes.length = 0;
		this.#host.querySelectorAll(":scope > *").forEach((node) => {
			if (this.#predicate(node)) {
				this.nodes.push(node);
			}
		});
	}
}

/**
 * Result of evaluating a mutation of nodes.
 */
type MutationEvaluationResult = {
	/**
	 * Determines whether the collection of nodes should be rebuilt from the host.
	 */
	rebuildNodes: boolean;

	/**
	 * Determines whether an update is requested.
	 */
	requestUpdate: boolean;
};
