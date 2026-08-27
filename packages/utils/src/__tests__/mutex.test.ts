import { describe, expect, it } from "vitest";

import { Mutex } from "../mutex.js";
import { withResolvers } from "../promises.js";

describe("Mutex", () => {
	describe("wait and release", () => {
		it("acquires lock immediately when not locked", async () => {
			// Arrange.
			const mutex = new Mutex();

			// Act.
			const waitPromise = mutex.wait();

			// Assert - allow microtask to complete.
			await Promise.resolve();
			await expect(getPromiseState(waitPromise)).resolves.toBe("complete");
		});

		it("blocks second caller until first releases", async () => {
			// Arrange.
			const mutex = new Mutex();
			await mutex.wait();

			// Act.
			const secondWait = mutex.wait();

			// Assert - second caller should be blocked.
			await expect(getPromiseState(secondWait)).resolves.toBe("pending");

			// Release and verify second caller proceeds.
			mutex.release();
			await Promise.resolve();
			await expect(getPromiseState(secondWait)).resolves.toBe("complete");
		});

		it("processes waiters in FIFO order", async () => {
			// Arrange.
			const mutex = new Mutex();
			const order: number[] = [];

			await mutex.wait();

			// Act - queue up multiple waiters.
			const waiter1 = mutex.wait().then(() => order.push(1));
			const waiter2 = mutex.wait().then(() => order.push(2));
			const waiter3 = mutex.wait().then(() => order.push(3));

			// Release each in turn.
			mutex.release();
			await waiter1;

			mutex.release();
			await waiter2;

			mutex.release();
			await waiter3;

			// Assert.
			expect(order).toEqual([1, 2, 3]);
		});

		it("allows reacquiring lock after release", async () => {
			// Arrange.
			const mutex = new Mutex();
			await mutex.wait();
			mutex.release();

			// Act.
			const reacquire = mutex.wait();

			// Assert - allow microtask to complete.
			await Promise.resolve();
			await expect(getPromiseState(reacquire)).resolves.toBe("complete");
		});
	});

	describe("run", () => {
		it("executes function and releases lock", async () => {
			// Arrange.
			const mutex = new Mutex();
			let executed = false;

			// Act.
			await mutex.run(() => {
				executed = true;
			});

			// Assert.
			expect(executed).toBe(true);

			// Verify lock is released by acquiring it again.
			const reacquire = mutex.wait();
			await Promise.resolve();
			await expect(getPromiseState(reacquire)).resolves.toBe("complete");
		});

		it("executes async function", async () => {
			// Arrange.
			const mutex = new Mutex();
			let executed = false;

			// Act.
			await mutex.run(async () => {
				await Promise.resolve();
				executed = true;
			});

			// Assert.
			expect(executed).toBe(true);
		});

		it("releases lock even when function throws", async () => {
			// Arrange.
			const mutex = new Mutex();

			// Act.
			await expect(
				mutex.run(() => {
					throw new Error("Test error");
				})
			).rejects.toThrow("Test error");

			// Assert - lock should be released.
			const reacquire = mutex.wait();
			await Promise.resolve();
			await expect(getPromiseState(reacquire)).resolves.toBe("complete");
		});

		it("releases lock even when async function rejects", async () => {
			// Arrange.
			const mutex = new Mutex();

			// Act.
			await expect(
				mutex.run(async () => {
					await Promise.resolve();
					throw new Error("Async error");
				})
			).rejects.toThrow("Async error");

			// Assert - lock should be released.
			const reacquire = mutex.wait();
			await Promise.resolve();
			await expect(getPromiseState(reacquire)).resolves.toBe("complete");
		});

		it("ensures mutual exclusion during concurrent runs", async () => {
			// Arrange.
			const mutex = new Mutex();
			let concurrentCount = 0;
			let maxConcurrent = 0;
			const { promise: gate, resolve: openGate } = withResolvers();

			// Act - start multiple concurrent operations.
			const run1 = mutex.run(async () => {
				concurrentCount++;
				maxConcurrent = Math.max(maxConcurrent, concurrentCount);
				await gate;
				concurrentCount--;
			});

			const run2 = mutex.run(async () => {
				concurrentCount++;
				maxConcurrent = Math.max(maxConcurrent, concurrentCount);
				await gate;
				concurrentCount--;
			});

			const run3 = mutex.run(async () => {
				concurrentCount++;
				maxConcurrent = Math.max(maxConcurrent, concurrentCount);
				await gate;
				concurrentCount--;
			});

			// Let all operations complete.
			openGate();
			await Promise.all([run1, run2, run3]);

			// Assert - only one should have run at a time.
			expect(maxConcurrent).toBe(1);
		});

		it("executes runs in order", async () => {
			// Arrange.
			const mutex = new Mutex();
			const order: number[] = [];
			const gates: Array<{ promise: Promise<void>; resolve: () => void }> = [];

			for (let i = 0; i < 3; i++) {
				gates.push(withResolvers());
			}

			// Act - start concurrent operations.
			const run1 = mutex.run(async () => {
				order.push(1);
				await gates[0].promise;
			});

			const run2 = mutex.run(async () => {
				order.push(2);
				await gates[1].promise;
			});

			const run3 = mutex.run(async () => {
				order.push(3);
				await gates[2].promise;
			});

			// Release gates one at a time.
			gates[0].resolve();
			await run1;

			gates[1].resolve();
			await run2;

			gates[2].resolve();
			await run3;

			// Assert.
			expect(order).toEqual([1, 2, 3]);
		});
	});
});

/**
 * Gets the state of a promise.
 * @param promise The promise to check.
 * @returns The state of the promise, either 'pending', 'complete' or 'error'.
 */
async function getPromiseState<T>(promise: Promise<T>): Promise<"complete" | "error" | "pending"> {
	const other = {};
	try {
		const winner = await Promise.race([promise, other]);
		return winner == other ? "pending" : "complete";
	} catch {
		return "error";
	}
}
