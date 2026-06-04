import { createHash } from "node:crypto";
import { platform, tmpdir } from "node:os";
import { join } from "node:path";

// NOTE: This derivation MUST stay byte-for-byte identical to the VS Code extension's copy
// (vscode-streamdeck: src/bridge/pipe-path.ts). Both sides compute the rendezvous path from the
// plugin UUID independently; if they diverge, the extension can no longer find the plugin.

/**
 * Computes the pipe path for the bridge transport, derived deterministically from the plugin UUID.
 *
 * The UUID is hashed to a short, filesystem-safe token so the resulting Unix domain socket path
 * stays within the platform's path length limit (~104 bytes on macOS).
 * @param uuid Plugin UUID.
 * @returns Named pipe path (Windows) or Unix domain socket path (macOS/Linux).
 */
export function getPipePath(uuid: string): string {
	const token = `sd-${createHash("sha1").update(uuid).digest("hex").slice(0, 16)}`;
	if (platform() === "win32") {
		return `\\\\.\\pipe\\${token}`;
	}

	return join(tmpdir(), `${token}.sock`);
}
