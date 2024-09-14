import { Enumerable } from "../enumerable";

describe("Enumerable", () => {
	const source = [
		{ name: "Facecam" },
		{ name: "Stream Deck" },
		{ name: "Wave DX" } //
	];

	const enumerable = Enumerable.from(source);

	/**
	 * Provides assertions for {@link Enumerable.from}.
	 */
	describe("from", () => {
		/**
		 * With T[].
		 */
		describe("T[]", () => {
			it("iterates mutated array", () => {
				// Arrange.
				const fn = jest.fn();
				const arr = [1, 2];
				const enumerable = Enumerable.from(arr);

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
				const enumerable = Enumerable.from(arr);
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
				const enumerable = Enumerable.from(map);

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
				const enumerable = Enumerable.from(map);

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
				const enumerable = Enumerable.from(set);

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
				const enumerable = Enumerable.from(set);

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
			const empty = Enumerable.from<number>([]);
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
				const empty = Enumerable.from([]);
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
				const empty = Enumerable.from([]);
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
});