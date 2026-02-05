/**
 * Resources (files) associated with an action, represented as a map of keys and paths, for example.
 * ```
 * {
 *   fileOne: "c:\\hello-world.txt",
 *   anotherFile: "c:\\icon.png"
 * }
 * ```
 */
export type Resources = {
	[key: string]: string;
};
