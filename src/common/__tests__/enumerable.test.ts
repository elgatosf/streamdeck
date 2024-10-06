import { Enumerable } from "../enumerable";

describe("Enumerable", () => {
	const source = [
		{ name: "Facecam" },
		{ name: "Stream Deck" },
		{ name: "Wave DX" } //
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
				const fn = jest.fn();
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
				const fn = jest.fn();
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
				const fnBefore = jest.fn();
				const map = new Map([
					[1, "One"],
					[2, "Two"]
				]);
				const enumerable = new Enumerable(map);

				// Act (1), assert (1).
				enumerable.forEach(fnBefore);
				expect(enumerable.length).toBe(2);
				expect(fnBefore).toHaveBeenCalledTimes(2);
				expect(fnBefore).toHaveBeenNthCalledWith(1, "One");
				expect(fnBefore).toHaveBeenNthCalledWith(2, "Two");

				// Arrange (2)
				const fnAfter = jest.fn();
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
					[2, "Two"]
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
				const fnBefore = jest.fn();
				const set = new Set(["One", "Two"]);
				const enumerable = new Enumerable(set);

				// Act (1), assert (1).
				enumerable.forEach(fnBefore);
				expect(enumerable.length).toBe(2);
				expect(fnBefore).toHaveBeenCalledTimes(2);
				expect(fnBefore).toHaveBeenNthCalledWith(1, "One");
				expect(fnBefore).toHaveBeenNthCalledWith(2, "Two");

				// Arrange (2)
				const fnAfter = jest.fn();
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
				const fn = jest.fn();
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
	 * Asserts the iterator of an {@link Enumerable}.
	 */
	describe("iterator", () => {
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
	 * Asserts the iterator of an {@link asIndexedPairs}.
	 */
	test("asIndexedPairs", () => {
		// Arrange, act.
		const fn = jest.fn();
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
			const fn = jest.fn();

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
			const fn = jest.fn();

			// Act.
			const res = enumerable.drop(2);

			// Assert.
			res.forEach(fn);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith({ name: "Wave DX" });
		});

		it("accepts limit exceeding length", () => {
			// Arrange.
			const fn = jest.fn();

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
			const fn = jest.fn().mockReturnValue(false);
			const every = enumerable.every(fn);

			// Assert.
			expect(every).toBeFalsy();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith({
				name: "Facecam"
			});
		});
	});

	/**
	 * Provides assertions for {@link Enumerable.filter}.
	 */
	describe("filter", () => {
		it("filters items", () => {
			// Arrange, act.
			const fn = jest.fn().mockImplementation((x) => x.name !== "Stream Deck");
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
			const fn = jest.fn();
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
			const fn = jest.fn().mockImplementation((x) => x.name === "Facecam");
			const item = enumerable.find(fn);

			// Assert.
			expect(item).toEqual({ name: "Facecam" });
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith({ name: "Facecam" });
		});

		it("finds the last", () => {
			// Arrange, act.
			const fn = jest.fn().mockImplementation((x) => x.name === "Wave DX");
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
			const fn = jest.fn().mockImplementation((x) => x.name === "Top secret product");
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
			const fn = jest.fn().mockImplementation((x) => !x.name.match(/\s+/));
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
			const fn = jest.fn().mockImplementation((x) => x.name.match(/\s+/));
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
			const fn = jest.fn().mockImplementation((x) => x.name === "Top secret product");
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
		const fn = jest.fn();
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
			const fn = jest.fn();
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
			const fn = jest.fn();
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
				expect(() => empty.reduce((prev, curr) => curr)).toThrowError(new TypeError("Reduce of empty enumerable with no initial value."));
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
			const fn = jest.fn().mockReturnValue(true);
			const some = enumerable.some(fn);

			// Assert.
			expect(some).toBeTruthy();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith({ name: "Facecam" });
		});

		it("evaluates all when needed", () => {
			// Arrange, act, assert.
			const fn = jest.fn().mockReturnValue(false);
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
			const fn = jest.fn();

			// Act.
			const res = enumerable.take(1);

			// Assert.
			res.forEach(fn);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenNthCalledWith(1, { name: "Facecam" });
		});

		it("accepts limit less than length", () => {
			// Arrange.
			const fn = jest.fn();

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
			const fn = jest.fn();

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
});
