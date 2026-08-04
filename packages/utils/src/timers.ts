import { type PromiseResolvers, withResolvers } from "./promises.js";

/**
 * Creates a wrapper around the specified `fn`, debouncing calls within the `delay`, to prevent multiple calls.
 * @param fn Function to debounce.
 * @param delay Delay before invoking the function.
 * @returns Function that debounces calls.
 */
export function debounce<T extends unknown[]>(
	fn: (...args: T) => Promise<void> | void,
	delay: number,
): (...args: T) => Promise<void> {
	let handle: ReturnType<typeof setTimeout>;
	let resolvers: PromiseResolvers<void> | undefined;

	return (...args: T): Promise<void> => {
		clearTimeout(handle);

		resolvers ??= withResolvers();
		handle = setTimeout(
			async (args) => {
				const capturedResolvers = resolvers;
				resolvers = undefined;

				await fn(...args);
				capturedResolvers?.resolve();
			},
			delay,
			args,
		);

		return resolvers.promise;
	};
}
