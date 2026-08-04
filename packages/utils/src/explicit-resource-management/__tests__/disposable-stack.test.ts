import { describe, expect, it, test, vi } from "vitest";

import { DisposableStack, type IDisposable } from "../index.js";

describe("DisposableStack", () => {
	/**
	 * Asserts all resources are disposed.
	 */
	it("should dispose all resources", () => {
		// Arrange.
		const stack = new DisposableStack();
		const resource = createResource();
		const orphan = { cleanUp: vi.fn() };
		const deferred = vi.fn();

		// Act.
		stack.use(resource);
		stack.adopt(orphan, (o) => o.cleanUp());
		stack.defer(deferred);

		stack.dispose();

		// Assert.
		expect(stack.disposed).toBe(true);
		expect(resource.dispose).toHaveBeenCalledExactlyOnceWith();
		expect(orphan.cleanUp).toHaveBeenCalledExactlyOnceWith();
		expect(deferred).toHaveBeenCalledExactlyOnceWith();
	});

	/**
	 * Asserts the stack implements the dispose symbol.
	 */
	it("disposes with using", () => {
		// Arrange.
		const resource = createResource();
		{
			// Act.
			using stack = new DisposableStack();
			stack.use(resource);
		}

		// Assert.
		expect(resource.dispose).toHaveBeenCalledExactlyOnceWith();
	});

	/**
	 * Asserts disposal happens only once.
	 */
	it("disposes once", () => {
		// Arrange.
		const stack = new DisposableStack();
		const resource = createResource();

		// Act.
		stack.use(resource);
		stack.dispose();
		stack.dispose();
		stack.dispose();

		// Assert
		expect(resource.dispose).toHaveBeenCalledExactlyOnceWith();
	});

	describe("stacking when disposed", () => {
		/**
		 * Asserts {@link DisposableStack.adopt} throws when the stack is already disposed.
		 */
		test("adopt", () => {
			// Arrange.
			const stack = new DisposableStack();
			stack.dispose();

			// Act, assert.
			expect(() => stack.adopt({}, () => {})).throws(
				"Cannot add disposable resource to stack as the stack is already disposed.",
			);
		});

		/**
		 * Asserts {@link DisposableStack.defer} throws when the stack is already disposed.
		 */
		test("defer", () => {
			// Arrange.
			const stack = new DisposableStack();
			stack.dispose();

			// Act, assert.
			expect(() => stack.defer(() => {})).throws(
				"Cannot add disposable resource to stack as the stack is already disposed.",
			);
		});

		/**
		 * Asserts {@link DisposableStack.use} throws when the stack is already disposed.
		 */
		test("use", () => {
			// Arrange.
			const stack = new DisposableStack();
			stack.dispose();

			// Act, assert.
			expect(() => stack.use(createResource())).throws(
				"Cannot add disposable resource to stack as the stack is already disposed.",
			);
		});
	});

	/**
	 * Creates a mock resource.
	 * @returns The resource.
	 */
	function createResource(): IDisposable {
		return {
			[Symbol.dispose]: vi.fn(),
			dispose: vi.fn(),
		};
	}
});
