import { vi } from "vitest";

export const settingsCache = {
	delete: vi.fn(),
	get: vi.fn(),
	invalidate: vi.fn(),
	set: vi.fn(),
};
