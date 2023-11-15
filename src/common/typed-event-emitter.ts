/**
 * Credit to https://github.com/andywer/typed-emitter/blob/master/index.d.ts
 */
import type { EventEmitter } from "node:events";

/**
 * Map of event listeners, indexed by their event name.
 */
export type EventMap = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: (...args: any[]) => void;
};

/**
 * An {@link EventEmitter} with typed event names and listeners.
 */
export interface TypedEventEmitter<M extends EventMap> {
	/** @inheritdoc */
	addListener<E extends keyof M>(event: E, listener: M[E]): this;

	/** @inheritdoc */
	on<E extends keyof M>(event: E, listener: M[E]): this;

	/** @inheritdoc */
	once<E extends keyof M>(event: E, listener: M[E]): this;

	/** @inheritdoc */
	prependListener<E extends keyof M>(event: E, listener: M[E]): this;

	/** @inheritdoc */
	prependOnceListener<E extends keyof M>(event: E, listener: M[E]): this;

	/** @inheritdoc */
	off<E extends keyof M>(event: E, listener: M[E]): this;

	/** @inheritdoc */
	removeAllListeners<E extends keyof M>(event?: E): this;

	/** @inheritdoc */
	removeListener<E extends keyof M>(event: E, listener: M[E]): this;

	/** @inheritdoc */
	emit<E extends keyof M>(event: E, ...args: Parameters<M[E]>): boolean;

	/** @inheritdoc */
	rawListeners<E extends keyof M>(event: E): M[E][];

	/** @inheritdoc */
	listeners<E extends keyof M>(event: E): M[E][];

	/** @inheritdoc */
	listenerCount<E extends keyof M>(event: E): number;

	/** @inheritdoc */
	getMaxListeners(): number;

	/** @inheritdoc */
	setMaxListeners(maxListeners: number): this;
}
