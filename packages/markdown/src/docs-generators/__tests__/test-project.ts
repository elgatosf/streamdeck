import { Project } from "ts-morph";

/**
 * Creates an isolated in-memory project for documentation fixtures. The fixtures need standard JavaScript types, but
 * not the much larger DOM declarations that TypeScript otherwise loads.
 * @returns Project configured for the fixtures.
 */
export function createTestProject(): Project {
	return new Project({
		useInMemoryFileSystem: true,
		compilerOptions: { strict: true, lib: ["lib.esnext.d.ts"] },
	});
}
