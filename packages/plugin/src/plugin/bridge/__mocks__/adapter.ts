import { vi } from "vitest";

export const bridge = {
	start: vi.fn().mockResolvedValue(undefined),
};
