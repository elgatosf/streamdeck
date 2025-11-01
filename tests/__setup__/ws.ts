import { Server, WebSocket } from "mock-socket";
import { vi } from "vitest";

// Mock the `ws` module globally
vi.mock("ws", () => {
	return {
		default: WebSocket,
		WebSocket,
		Server,
	};
});
