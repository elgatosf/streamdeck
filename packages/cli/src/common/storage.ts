import { readFileSync, writeFileSync } from "fs";

import { relative } from "../system/path";

const storePath = relative("../.cli.cache");

/**
 * Provides a basic store that is persisted to disk; the store should be treated as mutable and temporary.
 */
export const store = {
	/**
	 * Deletes the specified {@link key} from the store.
	 * @param key Key of the value to delete.
	 */
	delete(key: number | string | symbol): void {
		store.set(key, undefined);
	},

	/**
	 * Gets the value of the specified {@link key} from the store.
	 * @param key Key of the value to retrieve.
	 * @returns Value.
	 */
	get(key: number | string | symbol): unknown | undefined {
		return readStore()[key];
	},

	/**
	 * Sets the value of the specified {@link key} in the store.
	 * @param key Key of the value being stored.
	 * @param value Value.
	 */
	set(key: number | string | symbol, value: unknown): void {
		const cache = readStore();
		cache[key] = value;
		writeFileSync(storePath, JSON.stringify(cache), { encoding: "utf-8", flag: "w" });
	},
};

/**
 * Reads the store from the locally cached file, and returns the parsed contents.
 * @returns Contents of the store, as parsed from JSON; otherwise an empty object.
 */
function readStore(): Record<number | string | symbol, unknown> {
	try {
		return JSON.parse(readFileSync(storePath, { encoding: "utf-8", flag: "r" }));
	} catch {
		return {};
	}
}
