import ejs from "ejs";
import fs from "node:fs";
import { dirname, extname, resolve } from "path";

/**
 * Creates a new {@link FileCopier}.
 * @param options The source and destination paths.
 * @returns The {@link FileCopier}.
 */
export function createCopier(options: Options): FileCopier {
	return new FileCopier({
		data: {},
		...options,
	});
}

/**
 * File copier capable of copying, and rendering, files and directories from a source, to a destination.
 */
class FileCopier {
	/**
	 * Initializes a new instance of the {@link FileCopier} class.
	 * @param options The options.
	 */
	constructor(private readonly options: Required<Options>) {}

	/**
	 * Copies the {@link path}, relative to the {@link FileOrDirectoryPath.source}, renders all templates, and outputs the contents to the {@link path} relative to the {@link FileOrDirectoryPath.dest}.
	 * @param path The relative path to render and copy.
	 * @param destination Optional path, relative destination, whereby the items will be copied to.
	 */
	public async copy(path: string, destination?: string): Promise<void> {
		const opts = {
			source: resolve(this.options.source, path),
			dest: resolve(this.options.dest, destination || path),
		};

		if (fs.lstatSync(opts.source).isDirectory()) {
			this.copyDir(opts);
		} else {
			this.copyFile(opts);
		}
	}

	/**
	 * Copies the directory to the destination; all templates are rendered prior to output.
	 * @param param0 The options that determine what items are being copied.
	 * @param param0.source Source to copy from.
	 * @param param0.dest Destination to copy to.
	 */
	private copyDir({ source, dest }: FileOrDirectoryPath): void {
		const templates: Options[] = [];
		const filter = (source: string, dest: string): boolean => {
			if (fs.lstatSync(source).isFile() && extname(source) === ".ejs") {
				templates.push({ source, dest, data: this.options.data });
				return false;
			}

			return true;
		};

		fs.cpSync(source, dest, {
			filter,
			recursive: true,
		});

		templates.forEach((opts) => this.copyFile(opts));
	}

	/**
	 * Copies the file to the destination; when the file is a template, is rendered prior to output.
	 * @param param0 The options that determine what items are being copied.
	 * @param param0.source Source to copy from.
	 * @param param0.dest Destination to copy to.
	 */
	private copyFile({ source, dest }: FileOrDirectoryPath): void {
		fs.mkdirSync(dirname(dest), { recursive: true });

		if (extname(source) === ".ejs") {
			ejs.renderFile(source, this.options.data, (_, contents: string) => {
				const target = extname(dest) === ".ejs" ? dest.substring(0, dest.length - 4) : dest;
				fs.writeFileSync(target, contents);
			});
		} else {
			fs.copyFileSync(source, dest);
		}
	}
}

/**
 * Options used to copy and to render EJS template file or directory.
 */
type Options = FileOrDirectoryPath & {
	/**
	 * The data to be injected into the templates.
	 */
	data?: ejs.Data;
};

/**
 * Provides a source and destination path to a file or directory.
 */
type FileOrDirectoryPath = {
	/**
	 * The source path.
	 */
	dest: string;

	/**
	 * The source path.
	 */
	source: string;
};
