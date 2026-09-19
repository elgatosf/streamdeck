import { describe, expect, test } from "vitest";

import { NotificationResponder } from "../notification-responder.js";

describe("NotificationResponder", () => {
	/**
	 * Provides assertions for `canRespond`.
	 */
	describe("canRespond", () => {
		/**
		 * Asserts a notification responder cannot respond by default.
		 */
		test("defaults to false", () => {
			// Arrange, act, assert.
			const responder = new NotificationResponder();
			expect(responder.canRespond).toBe(false);
		});

		/**
		 * Asserts a notification responder cannot respond after handling an error.
		 */
		test("false after error", async () => {
			// Arrange.
			const responder = new NotificationResponder();

			// Act, assert.
			await responder.error();
			expect(responder.canRespond).toBe(false);
		});

		/**
		 * Asserts a notification responder cannot respond after handling a success.
		 */
		test("false after success", async () => {
			// Arrange.
			const responder = new NotificationResponder();

			// Act, assert.
			await responder.success();
			expect(responder.canRespond).toBe(false);
		});
	});

	/**
	 * Provides assertions for `error()`.
	 */
	test("error is noop", async () => {
		// Arrange, act, assert.
		const responder = new NotificationResponder();
		await expect(responder.error()).resolves.toBeUndefined();
	});

	/**
	 * Provides assertions for `success()`.
	 */
	test("success is noop", async () => {
		// Arrange, act, assert.
		const responder = new NotificationResponder();
		await expect(responder.success()).resolves.toBeUndefined();
	});
});
