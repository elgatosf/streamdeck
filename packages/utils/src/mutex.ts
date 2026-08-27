import { withResolvers } from "./promises.js";

/**
 * A mutual exclusion lock that ensures only one asynchronous operation can access a protected
 * resource at a time.
 * @example
 * const mutex = new Mutex();
 *
 * await mutex.run(async () => {
 *     // Critical section - only one caller executes at a time
 *     await updateSharedResource();
 * });
 */
export class Mutex {
	/**
	 * Determines whether the mutex is currently locked.
	 */
	#locked: boolean = false;

	/**
	 * Queue of waiters.
	 */
	#queue = new Array<(value: PromiseLike<void> | void) => void>();

	/**
	 * Releases the lock. If other callers are waiting, the next one in the queue acquires the lock.
	 *
	 * Must be called after `wait` to allow other operations to proceed.
	 */
	public release(): void {
		const next = this.#queue.shift();

		if (next) {
			next();
		} else {
			this.#locked = false;
		}
	}

	/**
	 * Acquires the lock, executes the function, and releases the lock when complete.
	 *
	 * If the lock is held by another caller, waits until it becomes available.
	 * @param fn The function to execute while holding the lock.
	 * @returns Promise that resolves when the function completes and the lock is released.
	 */
	public async run(fn: () => Promise<void> | void): Promise<void> {
		await this.wait();

		try {
			await fn();
		} finally {
			this.release();
		}
	}

	/**
	 * Acquires the lock. If the lock is already held, waits until it becomes available.
	 *
	 * Callers are processed in FIFO order.
	 * @returns Promise that resolves when the lock is acquired.
	 */
	public async wait(): Promise<void> {
		const { promise, resolve } = withResolvers();

		if (this.#locked) {
			this.#queue.push(resolve);
		} else {
			this.#locked = true;
			resolve();
		}

		await promise;
	}
}
