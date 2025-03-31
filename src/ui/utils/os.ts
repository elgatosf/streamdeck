/**
 * Fixes the character used to separate directories based on the current platform.
 * @param path File or folder path.
 * @returns Path with the platform-specific separators.
 */
export function fixDirectorySeparatorChar(path: string | undefined): string | undefined {
	return window.navigator.userAgentData.platform === "Windows" ? path?.replaceAll("/", "\\") : path;
}

/**
 * Decodes the path of a file input element.
 * @param path The path; typically the input's value.
 * @returns Decoded path.
 */
export function decodePath(path: string): string | undefined {
	return decodeURIComponent(path.replace(/^C:\\fakepath\\/, ""));
}
