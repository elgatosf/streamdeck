import { describe, expect, test, vi } from "vitest";

import type * as JsonRpc from "../json-rpc/index.js";
import { MessageSender } from "../message-sender.js";

describe("MessageSender", () => {
	test("serializes concurrent send", async () => {
		// Arrange.
		let completeFirstWrite: (() => void) | undefined;
		const firstWrite = new Promise<void>((resolve) => {
			completeFirstWrite = resolve;
		});
		const write = vi.fn().mockReturnValueOnce(firstWrite).mockResolvedValueOnce(undefined);
		const sender = createMessageSender(write);
		const firstMessage: JsonRpc.Request = { jsonrpc: "2.0", method: "first" };
		const secondMessage: JsonRpc.Request = { jsonrpc: "2.0", method: "second" };

		// Act.
		const firstResult = sender.send(firstMessage);
		const secondResult = sender.send(secondMessage);
		await Promise.resolve();

		// Assert.
		expect(write).toHaveBeenCalledExactlyOnceWith(firstMessage);
		completeFirstWrite?.();
		await Promise.all([firstResult, secondResult]);
		expect(write).toHaveBeenNthCalledWith(2, secondMessage);
	});

	test("continues after a failed send", async () => {
		// Arrange.
		const error = new Error("Unable to send message");
		const write = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce(undefined);
		const sender = createMessageSender(write);
		const firstMessage: JsonRpc.Request = { jsonrpc: "2.0", method: "first" };
		const secondMessage: JsonRpc.Request = { jsonrpc: "2.0", method: "second" };

		// Act.
		const firstResult = sender.send(firstMessage);
		const secondResult = sender.send(secondMessage);

		// Assert.
		await expect(firstResult).rejects.toBe(error);
		await expect(secondResult).resolves.toBeUndefined();
		expect(write).toHaveBeenNthCalledWith(2, secondMessage);
	});
});

/**
 * Creates a message sender with a mocked outbound stream.
 * @param write Mocked stream write function.
 * @returns The message sender.
 */
function createMessageSender(write: ReturnType<typeof vi.fn>): MessageSender {
	const outboundStream = {
		getWriter: () => ({
			releaseLock: vi.fn(),
			write,
		}),
	} as unknown as WritableStream<JsonRpc.Request | JsonRpc.Response>;

	return new MessageSender(outboundStream);
}
