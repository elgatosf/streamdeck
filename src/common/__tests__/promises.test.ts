import { describe, expect, it } from "vitest";

import { PromiseCompletionSource } from "../promises";

describe("PromiseCompletionSource<T>", () => {
	it("Defaults to pending", () => {
		// given, when, then.
		const pcs = new PromiseCompletionSource<string>();
		expect(getPromiseState(pcs.promise)).resolves.toBe("pending");
	});

	it("Resolves after setResult", () => {
		// Arrange, act.
		const pcs = new PromiseCompletionSource<string>();
		pcs.setResult("foo");

		// Assert.
		expect(getPromiseState(pcs.promise)).resolves.toBe("complete");
	});

	it("Resolves with result", async () => {
		// Arrange, act.
		const pcs = new PromiseCompletionSource<string>();
		pcs.setResult("foo");

		// Assert.
		expect(await pcs.promise).toBe("foo");
	});

	it("Reject after setException", () => {
		// Arrange, act.
		const pcs = new PromiseCompletionSource<string>();
		pcs.setException();

		// Assert.
		expect(getPromiseState(pcs.promise)).resolves.toBe("error");
	});

	it("Rejects with exception", () => {
		// Arrange, act.
		const pcs = new PromiseCompletionSource<string>();
		pcs.setException("Mock error");

		// Assert.
		expect(async () => await pcs.promise).rejects.toMatch("Mock error");
	});
});

/**
 * Gets the state of the promise.
 * @param promise The promise.
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
