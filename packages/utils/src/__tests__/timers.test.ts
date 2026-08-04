import { describe, expect, it } from "vitest";

import { debounce, withResolvers } from "../index.js";

/**
 * Provides assertions for {@link debounce}.
 */
describe("debounce", () => {
	it("should only invoke the function once before completing", async () => {
		// Arrange.
		let callCount = 0;
		const fn = debounce(() => {
			callCount++;
		}, 1);

		// when, then.
		await Promise.all([fn(), fn(), fn()]);
		expect(callCount).toBe(1);
	});

	it("should wait for the delay before invoking the callback", async () => {
		// Arrange.
		const { promise, resolve } = withResolvers();
		const fn = debounce(() => resolve(), 100);

		// Act.
		const start = Math.floor(performance.now());

		await fn();
		await promise;

		const elapsed = Math.ceil(performance.now()) - start;

		// Assert.
		expect(elapsed).toBeGreaterThanOrEqual(100);
	});

	it("should reset the promise after each callback", async () => {
		// Arrange.
		let callCount = 0;
		const fn = debounce(() => {
			callCount++;
		}, 1);

		// when, then.
		await fn();
		expect(callCount).toBe(1);

		// when, then.
		await fn();
		expect(callCount).toBe(2);
	});

	it("should invoke callback before setting promise completion source", async () => {
		// Arrange.
		let callbackTime!: number;

		// Act.
		const fn = debounce(() => {
			callbackTime = performance.now();
		}, 100);
		await fn();

		// Assert.
		expect(performance.now()).toBeGreaterThan(callbackTime);
	});
});
