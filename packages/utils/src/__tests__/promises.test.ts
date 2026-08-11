import { describe, expect, it } from "vitest";

import { withResolvers } from "../index.js";

describe("PromiseCompletionSource<T>", () => {
	it("Defaults to pending", async () => {
		// given, when, then.
		const { promise } = withResolvers();
		await expect(getPromiseState(promise)).resolves.toBe("pending");
	});

	it("Resolves after setResult", async () => {
		// Arrange, act.
		const { promise, resolve } = withResolvers<string>();
		resolve("foo");

		// Assert.
		await expect(getPromiseState(promise)).resolves.toBe("complete");
	});

	it("Resolves with result", async () => {
		// Arrange, act.
		const { promise, resolve } = withResolvers<string>();
		resolve("foo");

		// Assert.
		expect(await promise).toBe("foo");
	});

	it("Reject after setException", async () => {
		// Arrange, act.
		const { promise, reject } = withResolvers<string>();
		reject();

		// Assert.
		await expect(getPromiseState(promise)).resolves.toBe("error");
	});

	it("Rejects with exception", async () => {
		// Arrange, act.
		const { promise, reject } = withResolvers<string>();
		reject("Mock error");

		// Assert.
		await expect(async () => await promise).rejects.toMatch("Mock error");
	});
});

/**
 * Gets the state of the
 * @param promise The
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
