import { Manifest } from "@elgato/schemas/streamdeck/plugins";
import { ZipWriter } from "@zip.js/zip.js";
import chalk from "chalk";
import { createReadStream, createWriteStream, existsSync, writeFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { Readable, Writable } from "node:stream";
import type { ReadableStream } from "node:stream/web";

import { command } from "../common/command";
import { StdoutError } from "../common/stdout";
import { getPluginId } from "../stream-deck";
import { type FileInfo, getFiles, mkdirIfNotExists, readJsonFile, sizeAsString } from "../system/fs";
import { defaultOptions, validate, type ValidateOptions } from "./validate";

/**
 * Packs the plugin to a `.streamDeckPlugin` files.
 */
export const pack = command<PackOptions>(
	async (options, stdout) => {
		// Determine the source, and output.
		const sourcePath = resolve(options.path);
		const outputPath = resolve(options.output, `${getPluginId(sourcePath)}.streamDeckPlugin`);

		// Version (optionally) and validate.
		const versioner = await version(sourcePath, options.version);
		try {
			await validate({
				...options,
				quietSuccess: true,
			});
		} catch (err) {
			if (err instanceof StdoutError) {
				if (options.ignoreValidation) {
					stdout.log().log(chalk.yellow("Ignore validation flag found, bypassing validation errors")).log();
				} else {
					versioner.undo();
					stdout.exit(1);
				}
			} else {
				throw err;
			}
		}

		// Check if there is already a file at the desired save location.
		if (existsSync(outputPath)) {
			if (options.force) {
				await rm(outputPath);
			} else {
				stdout
					.error("File already exists")
					.log("Specify a different -o|-output location, or -f|--force saving to overwrite the existing file")
					.exit(1);
			}
		}

		stdout.spin("Preparing plugin");

		// Create the package
		await mkdirIfNotExists(dirname(outputPath));
		const pkgBuilder = getPackageBuilder(sourcePath, outputPath, options.dryRun);
		const contents = await getPackageContents(sourcePath, pkgBuilder.add);
		pkgBuilder.close();

		// Print a summary of the contents.
		stdout.log(`📦 ${contents.manifest.Name} (v${contents.manifest.Version})`);
		stdout.log();
		stdout.log(chalk.cyan("Plugin Contents"));

		contents.files.forEach((file, i) => {
			stdout.log(
				`${chalk.dim(i === contents.files.length - 1 ? "└─" : "├─")}  ${file.size.text.padEnd(contents.sizePad)}  ${file.path.relative}`,
			);
		});

		// Print the package details.
		stdout
			.log()
			.log(chalk.cyan("Plugin Details"))
			.log(`  Name:           ${contents.manifest.Name}`)
			.log(`  Version:        ${contents.manifest.Version}`)
			.log(`  UUID:           ${contents.manifest.UUID}`)
			.log(`  Total files:    ${contents.files.length}`)
			.log(`  Unpacked size:  ${sizeAsString(contents.size)}`)
			.log(`  File name:      ${basename(outputPath)}`)
			.log();

		if (options.dryRun) {
			stdout.info("No package created, --dry-run flag is present").log().log(chalk.dim(outputPath));
			versioner?.undo();
		} else {
			stdout.success("Successfully packaged plugin").log().log(outputPath);
		}
	},
	{
		...defaultOptions,
		dryRun: false,
		force: false,
		output: process.cwd(),
		version: null,
		ignoreValidation: false,
	},
);

/**
 * Gets a package builder capable of constructing a `.streamDeckPlugin` file.
 * @param sourcePath Source path to the package contents.
 * @param outputPath Path where the package will be output too.
 * @param dryRun When `true`, the builder will not create a package output.
 * @returns The package builder.
 */
function getPackageBuilder(sourcePath: string, outputPath: string, dryRun = false): PackageBuilder {
	// When a dry-run, return a mock builder.
	if (dryRun) {
		return {
			add: () => Promise.resolve(),
			close: (): void => {},
		};
	}

	// Otherwise prepare the builder
	const entryPrefix = basename(sourcePath);
	const zipStream = new ZipWriter(Writable.toWeb(createWriteStream(outputPath)));

	return {
		add: async (file: FileInfo, stream?: ReadableStream): Promise<void> => {
			const name = join(entryPrefix, file.path.relative).replaceAll("\\", "/");
			await zipStream.add(name, stream ?? Readable.toWeb(createReadStream(file.path.absolute)));
		},
		close: () => zipStream.close(),
	};
}

/**
 * Gets the package contents for the specified {@link path}, assuming it has been validated prior.
 * @param path Path to the plugin to package.
 * @param fileFn Optional function called for each file that is considered part of the package.
 * @returns Information about the package contents.
 */
async function getPackageContents(
	path: string,
	fileFn?: (file: FileInfo, stream?: ReadableStream) => Promise<void> | void,
): Promise<PackageInfo> {
	// Get the manifest, and generate the base contents.
	const manifestPath = join(path, "manifest.json");
	const manifest = await readJsonFile<Manifest>(manifestPath);
	const contents: PackageInfo = {
		files: [],
		manifest: manifest.value,
		size: 0,
		sizePad: 0,
	};

	// Add each file to the contents.
	for await (const file of getFiles(path)) {
		contents.files.push(file);
		contents.sizePad = Math.max(contents.sizePad, file.size.text.length);

		if (fileFn) {
			// When the entry is the manifest, remove the `Nodejs.Debug` flag.
			if (file.path.relative === "manifest.json") {
				delete manifest.value.Nodejs?.Debug;
				const sanitizedManifest = manifest.stringify();

				const stream = new Readable();
				stream.push(sanitizedManifest, "utf-8");
				stream.push(null); // End-of-file.

				contents.size += sanitizedManifest.length;
				await fileFn(file, Readable.toWeb(stream));
			} else {
				contents.size += file.size.bytes;
				await fileFn(file);
			}
		}
	}

	return contents;
}

/**
 * Versions the manifest at the specified {@link path}.
 * @param path Path to the directory where the manifest is contained.
 * @param version Optional preferred version.
 * @returns Object that allows for the versioning to be undone.
 */
async function version(path: string, version: string | null): Promise<VersionReverter> {
	const manifestPath = resolve(path, "manifest.json");
	const write = (contents: string): void => writeFileSync(manifestPath, contents, { encoding: "utf-8" });
	let original: string | undefined;

	if (existsSync(manifestPath)) {
		const manifest = await readJsonFile<Manifest>(manifestPath);

		// Ensure the version in the manifest has the correct number of segments, [{major}.{minor}.{patch}.{build}]
		version ??= manifest.value.Version?.toString() || "";
		manifest.value.Version = `${version}${".0".repeat(Math.max(0, 4 - version.split(".").length))}`;

		write(manifest.stringify());
	}

	return {
		undo: (): void => {
			if (original !== undefined) {
				write(original);
			}
		},
	};
}

/**
 * Options available to {@link pack}.
 */
type PackOptions = ValidateOptions & {
	/**
	 * When `true`, the package will be evaluated, but not created.
	 */
	dryRun?: boolean;

	/**
	 * When `true`, the output will overwrite an existing `.streamDeckPlugin` file if it already exists.
	 */
	force?: boolean;

	/**
	 * When `true`, allows for bypassing validation errors (not recommended); may result in unexpected
	 * behavior. Default `false`.
	 */
	ignoreValidation?: boolean;

	/**
	 * Output directory where the plugin package will be written too; defaults to cwd.
	 */
	output?: string;

	/**
	 * Optional version of the plugin; this will be set in the manifest before bundling.
	 */
	version?: string | null;
};

/**
 * Information about the package.
 */
type PackageInfo = {
	/**
	 * Files within the package.
	 */
	files: FileInfo[];

	/**
	 * Manifest the package is associated with.
	 */
	manifest: Manifest;

	/**
	 * Unpacked size of the package, in bytes.
	 */
	size: number;

	/**
	 * Padding used to align file sizes and their names when outputting the contents to a console.
	 */
	sizePad: number;
};

/**
 * Package builder capable of adding files to a package, and outputting them to a `.streamDeckPlugin` file.
 */
type PackageBuilder = {
	/**
	 * Adds the specified {@link file} to the package.
	 * @param file File to add.
	 */
	add(file: FileInfo): Promise<void>;

	/**
	 * Closes the package builder.
	 */
	close(): void;
};

/**
 * Version reverter capable of undoing the versioning of a manifest.
 */
type VersionReverter = {
	/**
	 * Reverts the manifest to the original instance.
	 */
	undo(): void;
};
