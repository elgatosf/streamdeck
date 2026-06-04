import { vi } from "vitest";

export const debug = {
	start: vi.fn().mockResolvedValue(undefined),
};