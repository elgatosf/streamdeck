import { existsSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";

import { colorize } from "../../../common/stdout";
import { aggregate } from "../../../common/utils";
import { FilePathOptions } from "../../../json";
import { isPredefinedLayoutLike } from "../../../stream-deck";
import { getIgnores, streamDeckIgnoreFilename } from "../../../system/fs";
import { rule } from "../../rule";
import { type PluginContext } from "../plugin";

/**
 * Validates the files defined within the manifest exist.
 */
export const manifestFilesExist = rule<PluginContext>(async function (plugin: PluginContext) {
	const missingHighRes = new Set<string>();
	const ignores = await getIgnores(this.path);

	// Validate the manifest is flagged to be ignored.
	if (ignores(basename(plugin.manifest.path))) {
		this.addError(plugin.manifest.path, "Manifest file must not be ignored", {
			suggestion: `Review ${streamDeckIgnoreFilename} file`,
		});
	}

	// Determine the values that require validating based on the JSON schema.
	const filePaths = new Map<string, FilePathOptions>(plugin.manifest.schema.filePathsKeywords);

	// Remove layout file paths to validate if they're predefined layouts.
	plugin.manifest.value.Actions?.forEach((action) => {
		if (action.Encoder?.layout?.value !== undefined && isPredefinedLayoutLike(action.Encoder?.layout?.value)) {
			filePaths.delete(action.Encoder.layout.location.instancePath);
		}
	});

	// Iterate over the file paths, and validate them.
	filePaths.forEach((opts, instancePath) => {
		// When there is no node for the file path, we don't need to validate.
		const nodeRef = plugin.manifest.find(instancePath);
		if (nodeRef?.node === undefined) {
			return;
		}

		// When the value type is incorrect, or there is already a schema error, we can rely on schema validation.
		const { node } = nodeRef;
		if (
			typeof node.value !== "string" ||
			plugin.manifest.errors.find((e) => e.location?.instancePath === instancePath)
		) {
			return;
		}

		// Determine the possible paths from the file path options.
		const possiblePaths =
			typeof opts === "object" && !opts.includeExtension
				? opts.extensions.map((ext) => `${node.value}${ext}`)
				: [node.value];

		// Attempt to resolve the possible paths the value can represent.
		let resolvedPath: string | undefined = undefined;
		for (const possiblePath of possiblePaths) {
			const path = resolve(this.path, possiblePath);
			if (existsSync(path)) {
				// If the path has already been resolved, there are files with duplicate names, e.g. "my-image.png" and "my-image.svg". Warn, and highlighted the resolved path.
				if (resolvedPath !== undefined) {
					this.addWarning(
						plugin.manifest.path,
						`multiple files named ${colorize(node.value)} found, using ${colorize(resolvedPath)}`,
						node,
					);
					break;
				}

				resolvedPath = possiblePath;
			}
		}

		// Validate there is a resolved path, when there isn't, it means a file was not found.
		if (resolvedPath === undefined) {
			this.addError(plugin.manifest.path, `file not found, ${colorize(node.value)}`, {
				...node,
				suggestion: typeof opts === "object" ? `File must be ${aggregate(opts.extensions, "or")}` : undefined,
			});

			return;
		}

		// Validate the file will be included when packing the plugin.
		if (ignores(resolvedPath)) {
			this.addError(plugin.manifest.path, `file must not be ignored, ${colorize(resolvedPath)}`, {
				...node,
				suggestion: `Review ${streamDeckIgnoreFilename} file`,
			});

			return;
		}

		// Validate there is a high-res version of the image, when the resolved path is a .png file.
		if (extname(resolvedPath) === ".png") {
			const fullPath = join(this.path, resolvedPath);
			if (missingHighRes.has(fullPath)) {
				return;
			}

			if (!existsSync(join(this.path, `${node.value}@2x.png`))) {
				this.addWarning(fullPath, "should have high-resolution (@2x) variant", {
					location: {
						key: node.location.key,
					},
				});
				missingHighRes.add(fullPath);
			}
		}
	});
});
