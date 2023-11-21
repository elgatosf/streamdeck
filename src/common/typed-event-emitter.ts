/**
 * Inspired by work credited to https://github.com/andywer/typed-emitter/blob/master/index.d.ts
 */
import type { EventEmitter } from "node:events";

/**
 * An {@link EventEmitter} with typed event names and listeners.
 */
export interface TypedEventEmitter<TMap> {
	/** @inheritdoc */
	addListener<TEventName extends keyof TMap, TData extends TMap[TEventName]>(event: TEventName, listener: (data: TData) => void): this;

	/** @inheritdoc */
	eventNames(): (string | symbol | keyof TMap)[];

	/** @inheritdoc */
	on<TEventName extends keyof TMap, TData extends TMap[TEventName]>(event: TEventName, listener: (data: TData) => void): this;

	/** @inheritdoc */
	once<TEventName extends keyof TMap, TData extends TMap[TEventName]>(event: TEventName, listener: (data: TData) => void): this;

	/** @inheritdoc */
	prependListener<TEventName extends keyof TMap, TData extends TMap[TEventName]>(event: TEventName, listener: (data: TData) => void): this;

	/** @inheritdoc */
	prependOnceListener<TEventName extends keyof TMap, TData extends TMap[TEventName]>(event: TEventName, listener: (data: TData) => void): this;

	/** @inheritdoc */
	off<TEventName extends keyof TMap, TData extends TMap[TEventName]>(event: TEventName, listener: (data: TData) => void): this;

	/** @inheritdoc */
	removeAllListeners<TEventName extends keyof TMap>(event?: TEventName): this;

	/** @inheritdoc */
	removeListener<TEventName extends keyof TMap, TData extends TMap[TEventName]>(event: TEventName, listener: (data: TData) => void): this;

	/** @inheritdoc */
	emit<TEventName extends keyof TMap>(event: TEventName, data: TMap[TEventName]): boolean;

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/ban-types
	rawListeners<TEventName extends keyof TMap>(event: TEventName): Function[];

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/ban-types
	listeners<TEventName extends keyof TMap>(event: TEventName): Function[];

	/** @inheritdoc */
	listenerCount<TEventName extends keyof TMap>(event: TEventName): number;

	/** @inheritdoc */
	getMaxListeners(): number;

	/** @inheritdoc */
	setMaxListeners(maxListeners: number): this;
}
