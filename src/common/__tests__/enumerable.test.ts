import { describe, expect, it, test, vi } from "vitest";

import { Enumerable } from "../enumerable.js";

describe("Enumerable", () => {
	const source = [
		{ name: "Facecam" },
		{ name: "Stream Deck" },
		{ name: "Wave DX" },
	];

	const enumerable = new Enumerable(source);

	/**
	 * Provides assertions for the {@link Enumerable} constructor.
	 */
	describe("constructor", () => {
		/**
		 * With Enumerable<T>.
		 */
		describe("Enumerable<T>", () => {
			it("iterates enumerable", () => {
				// Arrange.
				const fn = vi.fn();
				const arr = [1, 2];
				const source = new Enumerable(arr);
				const enumerable = new Enumerable(source);

				// Act.
				arr.push(3, 4);
				enumerable.forEach(fn);

				// Assert.
				expect(enumerable.length).toBe(4);
				expect(fn).toHaveBeenCalledTimes(4);
				expect(fn).toHaveBeenNthCalledWith(1, 1);
				expect(fn).toHaveBeenNthCalledWith(2, 2);
				expect(fn).toHaveBeenNthCalledWith(3, 3);
				expect(fn).toHaveBeenNthCalledWith(4, 4);
			});

			it("reads length", () => {
				// Arrange.
				const arr = [1];
				const source = new Enumerable(arr);

				// Act, assert.
				const enumerable = new Enumerable(source);
				expect(enumerable.length).toBe(1);

				// Act, assert.
				arr.push(2);
				expect(enumerable.length).toBe(2);
			});
		});

		/**
		 * With T[].
		 */
		describe("T[]", () => {
			it("iterates mutated array", () => {
				// Arrange.
				const fn = vi.fn();
				const arr = [1, 2];
				const enumerable = new Enumerable(arr);

				// Act.
				arr.push(3, 4);
				enumerable.forEach(fn);

				// Assert.
				expect(enumerable.length).toBe(4);
				expect(fn).toHaveBeenCalledTimes(4);
				expect(fn).toHaveBeenNthCalledWith(1, 1);
				expect(fn).toHaveBeenNthCalledWith(2, 2);
				expect(fn).toHaveBeenNthCalledWith(3, 3);
				expect(fn).toHaveBeenNthCalledWith(4, 4);
			});

			it("reads length", () => {
				// Arrange.
				const arr = [1];

				// Act, assert.
				const enumerable = new Enumerable(arr);
				expect(enumerable.length).toBe(1);

				// Act, assert.
				arr.push(2);
				expect(enumerable.length).toBe(2);
			});
		});

		/**
		 * With Map<K, T>.
		 */
		describe("Map<K, T>", () => {
			it("iterates mutated map", () => {
				// Arrange (1).
				const fnBefore = vi.fn();
				const map = new Map([
					[1, "One"],
					[2, "Two"],
				]);
				const enumerable = new Enumerable(map);

				// Act (1), assert (1).
				enumerable.forEach(fnBefore);
				expect(enumerable.length).toBe(2);
				expect(fnBefore).toHaveBeenCalledTimes(2);
				expect(fnBefore).toHaveBeenNthCalledWith(1, "One");
				expect(fnBefore).toHaveBeenNthCalledWith(2, "Two");

				// Arrange (2)
				const fnAfter = vi.fn();
				map.set(1, "A");
				map.set(3, "Three");

				// Act, assert (2).
				enumerable.forEach(fnAfter);
				expect(enumerable.length).toBe(3);
				expect(fnAfter).toHaveBeenCalledTimes(3);
				expect(fnAfter).toHaveBeenNthCalledWith(1, "A");
				expect(fnAfter).toHaveBeenNthCalledWith(2, "Two");
				expect(fnAfter).toHaveBeenNthCalledWith(3, "Three");
			});

			it("reads length", () => {
				// Arrange (1).
				const map = new Map([
					[1, "One"],
					[2, "Two"],
				]);

				// Act (1).
				const enumerable = new Enumerable(map);

				// Assert (1).
				expect(enumerable.length).toBe(2);

				// Act (2)
				map.delete(1);
				map.set(3, "Three");
				map.set(4, "Four");

				// Assert (2).
				expect(enumerable.length).toBe(3);
			});
		});

		/**
		 * With Set<T>.
		 */
		describe("Set<T>", () => {
			it("iterates mutated map", () => {
				// Arrange (1).
				const fnBefore = vi.fn();
				const set = new Set(["One", "Two"]);
				const enumerable = new Enumerable(set);

				// Act (1), assert (1).
				enumerable.forEach(fnBefore);
				expect(enumerable.length).toBe(2);
				expect(fnBefore).toHaveBeenCalledTimes(2);
				expect(fnBefore).toHaveBeenNthCalledWith(1, "One");
				expect(fnBefore).toHaveBeenNthCalledWith(2, "Two");

				// Arrange (2)
				const fnAfter = vi.fn();
				set.delete("One");
				set.add("Three");

				// Act, assert (2).
				enumerable.forEach(fnAfter);
				expect(enumerable.length).toBe(2);
				expect(fnAfter).toHaveBeenCalledTimes(2);
				expect(fnAfter).toHaveBeenNthCalledWith(1, "Two");
				expect(fnAfter).toHaveBeenNthCalledWith(2, "Three");
			});

			it("reads length", () => {
				// Arrange (1).
				const set = new Set(["One", "Two"]);

				// Act (1).
				const enumerable = new Enumerable(set);

				// Assert (1).
				expect(enumerable.length).toBe(2);

				// Act (2)
				set.delete("One");
				set.add("Three");
				set.add("Four");

				// Assert (2).
				expect(enumerable.length).toBe(3);
			});
		});

		/**
		 * With IterableIterator<T> delegate.
		 */
		describe("IterableIterator", () => {
			it("iterates mutated map", () => {
				// Arrange.
				const fn = vi.fn();
				const itr = function* () {
					yield "One";
					yield "Two";
				};
				const enumerable = new Enumerable(itr);

				// Act, assert.
				enumerable.forEach(fn);
				expect(enumerable.length).toBe(2);
				expect(fn).toHaveBeenCalledTimes(2);
				expect(fn).toHaveBeenNthCalledWith(1, "One");
				expect(fn).toHaveBeenNthCalledWith(2, "Two");
			});

			it("reads length", () => {
				// Arrange.
				const itr = function* () {
					yield "One";
					yield "Two";
				};

				// Act, assert.
				const enumerable = new Enumerable(itr);
				expect(enumerable.length).toBe(2);
			});
		});
	});

	/**
	 * Asserts {@link Enumerable} implements {@link IterableIterator}.
	 */
	describe("IterableIterator implementation", () => {
		describe("next", () => {
			it("iterates all items", () => {
				// Arrange.
				const enumerable = new Enumerable(["One", "Two", "Three"]);

				// Act, assert.
				expect(enumerable.next()).toStrictEqual({ done: false, value: "One" });
				expect(enumerable.next()).toStrictEqual({ done: false, value: "Two" });
				expect(enumerable.next()).toStrictEqual({ done: false, value: "Three" });
				expect(enumerable.next()).toStrictEqual({ done: true, value: undefined });
			});

			it("re-captures on return", () => {
				// Arrange.
				const enumerable = new Enumerable(["One", "Two", "Three"]);

				// Act, assert (1).
				expect(enumerable.next()).toStrictEqual({ done: false, value: "One" });
				expect(enumerable.return?.("Stop")).toStrictEqual({ done: true, value: "Stop" });

				// Act, assert (2).
				expect(enumerable.next()).toStrictEqual({ done: false, value: "One" });
				expect(enumerable.next()).toStrictEqual({ done: false, value: "Two" });
				expect(enumerable.next()).toStrictEqual({ done: false, value: "Three" });
				expect(enumerable.next()).toStrictEqual({ done: true, value: undefined });
			});

			it("does not re-capture on throw", () => {
				// Arrange.
				const enumerable = new Enumerable(["One", "Two", "Three"]);

				// Act, assert..
				expect(enumerable.next()).toStrictEqual({ done: false, value: "One" });
				expect(() => enumerable.throw?.("Staged error")).toThrow("Staged error");
				expect(enumerable.next()).toStrictEqual({ done: false, value: "Two" });
				expect(enumerable.next()).toStrictEqual({ done: false, value: "Three" });
				expect(enumerable.next()).toStrictEqual({ done: true, value: undefined });
			});
		});

		test("return", () => {
			// Arrange.
			const enumerable = new Enumerable([1, 2, 3]);

			// Act, assert.
			const res = enumerable.return?.("Hello world");
			expect(res?.done).toBe(true);
			expect(res?.value).toBe("Hello world");
		});

		test("throw", () => {
			// Arrange.
			const enumerable = new Enumerable([1, 2, 3]);

			// Act, assert.
			expect(() => enumerable.throw?.("Hello world")).toThrow("Hello world");
		});
	});

	/**
	 * Asserts chaining for methods of {@link Enumerable} that support it.
	 */
	describe("iterator helpers", () => {
		it("chains iterators", () => {
			// Arrange.
			const fn = vi.fn();
			const source = ["One", "Two", "Three"];
			const enumerable = new Enumerable(source);

			// Act.
			enumerable
				.asIndexedPairs() // [0, "One"], [1, "Two"], [2, "Three"]
				.drop(1) // [1, "Two"], [2, "Three"]
				.flatMap(([i, value]) => [i, value].values()) // 1, "Two", 2, "Three"
				.filter((x) => typeof x === "number") // 1, 2
				.map((x) => {
					return { value: x };
				}) // { value: 1 }, { value: 2 }
				.take(1) // { value: 1 }
				.forEach(fn);

			// Assert.
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenNthCalledWith(1, { value: 1 });
		});

		it("should not iterate unless necessary", () => {
			// Arrange.
			const fn = vi.fn();
			const enumerable = new Enumerable(fn);

			// Act.
			enumerable
				.asIndexedPairs()
				.drop(1)
				.flatMap(([i, value]) => [i, value].values())
				.filter((x) => typeof x === "number")
				.map((x) => {
					return { value: x };
				})
				.take(1);

			// Assert.
			expect(fn).toHaveBeenCalledTimes(0);
		});
	});

	/**
	 * Asserts the iterator of an {@link Enumerable}.
	 */
	test("iterator", () => {
		// Arrange.
		const source = ["a", "b", "c"];
		const enumerable = new Enumerable(source);

		// Act, assert.
		let i = 0;
		for (const item of enumerable) {
			expect(item).toBe(source[i++]);
		}

		expect(i).toBe(3);
	});

	/**
	 * Asserts the iterator of an {@link Enumerable.asIndexedPairs}.
	 */
	test("asIndexedPairs", () => {
		// Arrange, act.
		const fn = vi.fn();
		const res = enumerable.asIndexedPairs();

		// Assert.
		res.forEach(fn);
		expect(fn).toHaveBeenCalledTimes(3);
		expect(fn).toHaveBeenNthCalledWith(1, [0, { name: "Facecam" }]);
		expect(fn).toHaveBeenNthCalledWith(2, [1, { name: "Stream Deck" }]);
		expect(fn).toHaveBeenNthCalledWith(3, [2, { name: "Wave DX" }]);
	});

	/**
	 * Provides assertions for {@link Enumerable.drop}.
	 */
	describe("drop", () => {
		it("accepts limit 0", () => {
			// Arrange, act, assert
			expect(enumerable.drop(0).length).toBe(source.length);
		});

		it("accepts limit 1", () => {
			// Arrange.
			const fn = vi.fn();

			// Act.
			const res = enumerable.drop(1);

			// Assert.
			res.forEach(fn);
			expect(fn).toHaveBeenCalledTimes(2);
			expect(fn).toHaveBeenNthCalledWith(1, { name: "Stream Deck" });
			expect(fn).toHaveBeenNthCalledWith(2, { name: "Wave DX" });
		});

		it("accepts limit less than length", () => {
			// Arrange.
			const fn = vi.fn();

			// Act.
			const res = enumerable.drop(2);

			// Assert.
			res.forEach(fn);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith({ name: "Wave DX" });
		});

		it("accepts limit exceeding length", () => {
			// Arrange.
			const fn = vi.fn();

			// Act.
			const res = enumerable.drop(4);

			// Assert.
			res.forEach(fn);
			expect(fn).toHaveBeenCalledTimes(0);
		});

		it("throw for negative", () => {
			// Arrange, act, assert
			expect(() => enumerable.drop(-1)).toThrow(RangeError);
		});

		it("throw for NaN", () => {
			// Arrange, act, assert
			// @ts-expect-error Test non-number
			expect(() => enumerable.drop("false")).toThrow(RangeError);
		});
	});

	/**
	 * Provides assertions for {@link Enumerable.every}.
	 */
	describe("every", () => {
		it("evaluates all when needed", () => {
			// Arrange, act, assert
			expect(enumerable.every((x) => typeof x.name === "string")).toBeTruthy();
		});

		it("evaluates lazily", () => {
			// Arrange, act.
			const fn = vi.fn().mockReturnValue(false);
			const every = enumerable.every(fn);

			// Assert.
			expect(every).toBeFalsy();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith({
				name: "Facecam",
			});
		});
	});

	/**
	 * Provides assertions for {@link Enumerable.filter}.
	 */
	describe("filter", () => {
		it("filters items", () => {
			// Arrange, act.
			const fn = vi.fn().mockImplementation((x) => x.name !== "Stream Deck");
			const filtered = Array.from(enumerable.filter(fn));

			// Assert.
			expect(fn).toHaveBeenCalledTimes(3);
			expect(fn).toHaveBeenNthCalledWith(1, { name: "Facecam" });
			expect(fn).toHaveBeenNthCalledWith(2, { name: "Stream Deck" });
			expect(fn).toHaveBeenNthCalledWith(3, { name: "Wave DX" });

			expect(filtered).toHaveLength(2);
			expect(filtered.at(0)).toEqual({ name: "Facecam" });
			expect(filtered.at(1)).toEqual({ name: "Wave DX" });
		});

		it("can return no items", () => {
			// Arrange, act, assert.
			const filtered = Array.from(enumerable.filter((x) => x.name === "Test"));
			expect(filtered).toHaveLength(0);
		});

		it("dot not evaluate unless iterated", () => {
			// Arrange, act.
			const fn = vi.fn();
			enumerable.filter(fn);

			// Assert.
			expect(fn).toHaveBeenCalledTimes(0);
		});
	});

	/**
	 * Provides assertions for {@link Enumerable.find}.
	 */
	describe("find", () => {
		it("finds the first", () => {
			// Arrange, act.
			const fn = vi.fn().mockImplementation((x) => x.name === "Facecam");
			const item = enumerable.find(fn);

			// Assert.
			expect(item).toEqual({ name: "Facecam" });
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith({ name: "Facecam" });
		});

		it("finds the last", () => {
			// Arrange, act.
			const fn = vi.fn().mockImplementation((x) => x.name === "Wave DX");
			const item = enumerable.find(fn);

			// Assert.
			expect(item).toEqual({ name: "Wave DX" });
			expect(fn).toHaveBeenCalledTimes(3);
			expect(fn).toHaveBeenCalledWith({ name: "Facecam" });
			expect(fn).toHaveBeenCalledWith({ name: "Stream Deck" });
			expect(fn).toHaveBeenCalledWith({ name: "Wave DX" });
		});

		it("can find nothing", () => {
			// Arrange, act.
			const fn = vi.fn().mockImplementation((x) => x.name === "Top secret product");
			const item = enumerable.find(fn);

			// Assert.
			expect(item).toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(3);
			expect(fn).toHaveBeenCalledWith({ name: "Facecam" });
			expect(fn).toHaveBeenCalledWith({ name: "Stream Deck" });
			expect(fn).toHaveBeenCalledWith({ name: "Wave DX" });
		});
	});

	/**
	 * Provides assertions for {@link Enumerable.findLast}.
	 */
	describe("findLast", () => {
		it("finds the first", () => {
			// Arrange, act.
			const fn = vi.fn().mockImplementation((x) => !x.name.match(/\s+/));
			const item = enumerable.findLast(fn);

			// Assert.
			expect(item).toEqual({ name: "Facecam" });
			expect(fn).toHaveBeenCalledTimes(3);
			expect(fn).toHaveBeenCalledWith({ name: "Facecam" });
			expect(fn).toHaveBeenCalledWith({ name: "Stream Deck" });
			expect(fn).toHaveBeenCalledWith({ name: "Wave DX" });
		});

		it("finds the last", () => {
			// Arrange, act.
			const fn = vi.fn().mockImplementation((x) => x.name.match(/\s+/));
			const item = enumerable.findLast(fn);

			// Assert.
			expect(item).toEqual({ name: "Wave DX" });
			expect(fn).toHaveBeenCalledTimes(3);
			expect(fn).toHaveBeenCalledWith({ name: "Facecam" });
			expect(fn).toHaveBeenCalledWith({ name: "Stream Deck" });
			expect(fn).toHaveBeenCalledWith({ name: "Wave DX" });
		});

		it("can find nothing", () => {
			// Arrange, act.
			const fn = vi.fn().mockImplementation((x) => x.name === "Top secret product");
			const item = enumerable.findLast(fn);

			// Assert.
			expect(item).toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(3);
			expect(fn).toHaveBeenCalledWith({ name: "Facecam" });
			expect(fn).toHaveBeenCalledWith({ name: "Stream Deck" });
			expect(fn).toHaveBeenCalledWith({ name: "Wave DX" });
		});
	});

	test("flatMap", () => {
		// Arrange, act.
		const fn = vi.fn();
		const res = enumerable.flatMap((x) => x.name.split(" ").values());

		// Assert.
		res.forEach(fn);
		expect(fn).toHaveBeenCalledTimes(5);
		expect(fn).toHaveBeenNthCalledWith(1, "Facecam");
		expect(fn).toHaveBeenNthCalledWith(2, "Stream");
		expect(fn).toHaveBeenNthCalledWith(3, "Deck");
		expect(fn).toHaveBeenNthCalledWith(4, "Wave");
		expect(fn).toHaveBeenNthCalledWith(5, "DX");
	});

	/**
	 * Provides assertions for {@link Enumerable.forEach}.
	 */
	describe("forEach", () => {
		it("iterates over items", () => {
			// Arrange, act.
			const fn = vi.fn();
			enumerable.forEach(fn);

			// Assert.
			expect(fn).toHaveBeenCalledTimes(3);
			expect(fn).toHaveBeenCalledWith({ name: "Facecam" });
			expect(fn).toHaveBeenCalledWith({ name: "Stream Deck" });
			expect(fn).toHaveBeenCalledWith({ name: "Wave DX" });
		});
	});

	/**
	 * Provides assertions for {@link Enumerable.includes}.
	 */
	describe("includes", () => {
		it("matches reference", () => {
			// Arrange, act, assert
			expect(enumerable.includes(source[1])).toBeTruthy();
			expect(enumerable.includes({ name: "Stream Deck" })).toBeFalsy();
			expect(enumerable.includes(undefined!)).toBeFalsy();
		});
	});

	/**
	 * Provides assertions for {@link Enumerable.map}.
	 */
	describe("map", () => {
		it("maps each item", () => {
			// Arrange, act.
			const res = Array.from(enumerable.map(({ name }) => name));

			// Assert.
			expect(res).toHaveLength(3);
			expect(res.at(0)).toBe("Facecam");
			expect(res.at(1)).toBe("Stream Deck");
			expect(res.at(2)).toBe("Wave DX");
		});

		it("returns an empty array", () => {
			// Arrange, act.
			const empty = new Enumerable<number>([]);
			const res = Array.from(empty.map((x) => x.toString()));

			// Assert.
			expect(res).toHaveLength(0);
		});

		it("dot not evaluate unless iterated", () => {
			// Arrange, act.
			const fn = vi.fn();
			enumerable.map(fn);

			// Assert.
			expect(fn).toHaveBeenCalledTimes(0);
		});
	});

	/**
	 * Provides assertions for {@link Enumerable.reduce}.
	 */
	describe("reduce", () => {
		describe("without initial value", () => {
			it("reduces all", () => {
				// Arrange, act, assert.
				const res = enumerable.reduce((prev, curr) => ({ name: `${prev.name}, ${curr.name}` }));
				expect(res).toEqual({ name: "Facecam, Stream Deck, Wave DX" });
			});

			it("throws when empty", () => {
				// Arrange, act, assert.
				const empty = new Enumerable([]);
				expect(() => empty.reduce((prev, curr) => curr)).toThrowError(
					new TypeError("Reduce of empty enumerable with no initial value."),
				);
			});
		});

		describe("with initial value", () => {
			it("reduces all", () => {
				// Arrange, act, assert.
				const res = enumerable.reduce((prev, curr) => `${prev}, ${curr.name}`, "Initial");
				expect(res).toEqual("Initial, Facecam, Stream Deck, Wave DX");
			});

			it("reduces empty", () => {
				// Arrange, act, assert.
				const empty = new Enumerable([]);
				expect(empty.reduce((prev, curr) => `${prev}, ${curr}`, "Initial")).toBe("Initial");
			});
		});
	});

	/**
	 * Provides assertions for {@link Enumerable.some}.
	 */
	describe("some", () => {
		it("evaluates lazily", () => {
			// Arrange, act, assert.
			const fn = vi.fn().mockReturnValue(true);
			const some = enumerable.some(fn);

			// Assert.
			expect(some).toBeTruthy();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith({ name: "Facecam" });
		});

		it("evaluates all when needed", () => {
			// Arrange, act, assert.
			const fn = vi.fn().mockReturnValue(false);
			const some = enumerable.some(fn);

			// Assert.
			expect(some).toBeFalsy();
			expect(fn).toHaveBeenCalledTimes(3);
			expect(fn).toHaveBeenCalledWith({ name: "Facecam" });
			expect(fn).toHaveBeenCalledWith({ name: "Stream Deck" });
			expect(fn).toHaveBeenCalledWith({ name: "Wave DX" });
		});
	});

	/**
	 * Provides assertions for {@link Enumerable.take}.
	 */
	describe("take", () => {
		it("accepts limit 0", () => {
			// Arrange, act, assert
			expect(enumerable.take(0).length).toBe(0);
		});

		it("accepts limit 1", () => {
			// Arrange.
			const fn = vi.fn();

			// Act.
			const res = enumerable.take(1);

			// Assert.
			res.forEach(fn);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenNthCalledWith(1, { name: "Facecam" });
		});

		it("accepts limit less than length", () => {
			// Arrange.
			const fn = vi.fn();

			// Act.
			const res = enumerable.take(2);

			// Assert.
			res.forEach(fn);
			expect(fn).toHaveBeenCalledTimes(2);
			expect(fn).toHaveBeenNthCalledWith(1, { name: "Facecam" });
			expect(fn).toHaveBeenNthCalledWith(2, { name: "Stream Deck" });
		});

		it("accepts limit exceeding length", () => {
			// Arrange.
			const fn = vi.fn();

			// Act.
			const res = enumerable.take(99);

			// Assert.
			res.forEach(fn);
			expect(fn).toHaveBeenCalledTimes(3);
			expect(fn).toHaveBeenNthCalledWith(1, { name: "Facecam" });
			expect(fn).toHaveBeenNthCalledWith(2, { name: "Stream Deck" });
			expect(fn).toHaveBeenNthCalledWith(3, { name: "Wave DX" });
		});

		it("throw for negative", () => {
			// Arrange, act, assert
			expect(() => enumerable.take(-1)).toThrow(RangeError);
		});

		it("throw for NaN", () => {
			// Arrange, act, assert
			// @ts-expect-error Test non-number
			expect(() => enumerable.take("false")).toThrow(RangeError);
		});
	});

	/**
	 * Provides assertions for {@link Enumerable.toArray}.
	 */
	describe("toArray", () => {
		it("returns a new array of items", () => {
			// Arrange.
			const arr = ["One", "Two"];
			const enumerable = new Enumerable(arr);

			// Act.
			const res = enumerable.toArray();

			// Assert.
			expect(arr).toEqual(res);
			expect(arr).not.toBe(res);
		});

		it("can return an empty array", () => {
			// Arrange.
			const enumerable = new Enumerable(function* () {});

			// Act.
			const res = enumerable.toArray();

			// Assert
			expect(res).toHaveLength(0);
		});
	});

	/**
	 * Provides assertions for {@link Enumerable.toJSON}.
	 */
	test("toJSON", () => {
		const arr = ["One", "Two"];
		const enumerable = new Enumerable(arr);

		expect(JSON.stringify(arr)).toEqual(JSON.stringify(enumerable));
	});

	/**
	 * Provides assertions for {@link Enumerable.toString}.
	 */
	test("toString", () => {
		const arr = ["One", "Two"];
		const enumerable = new Enumerable(arr);

		expect(arr.toString()).toEqual(enumerable.toString());
	});
});
