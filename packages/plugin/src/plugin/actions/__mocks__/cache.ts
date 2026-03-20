import { vi } from "vitest";

export const settingsCache = {
	delete: vi.fn(),
	get: vi.fn(),
	set: vi.fn(),
};
