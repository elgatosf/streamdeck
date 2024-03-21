import type { RawMessageResponse } from "../message";
import { MessageResponseBuilder } from "../responder";

describe("MessageResponseBuilder", () => {
	/**
	 * Asserts {@link MessageResponseBuilder.send} sends a `200` with the optional body.
	 */
	it("should send 200 with success", async () => {
		// Arrange.
		const proxy = jest.fn();
		const res = new MessageResponseBuilder(
			{
				__type: "request",
				id: "abc123",
				path: "/pets",
				unidirectional: false
			},
			proxy
		);

		// Act.
		await res.success(["Arthur", "Izzie", "Murphy"]);

		// Assert.
		expect(proxy).toHaveBeenCalledTimes(1);
		expect(proxy).toHaveBeenLastCalledWith<[RawMessageResponse]>({
			__type: "response",
			id: "abc123",
			path: "/pets",
			status: 200,
			body: ["Arthur", "Izzie", "Murphy"]
		});
	});

	/**
	 * Asserts {@link MessageResponseBuilder.fail} sends a `500` with the optional body.
	 */
	it("should send 500 with fail", async () => {
		// Arrange.
		const proxy = jest.fn();
		const res = new MessageResponseBuilder(
			{
				__type: "request",
				id: "abc123",
				path: "/toggle-light",
				unidirectional: false,
				body: {
					id: 123
				}
			},
			proxy
		);

		// Act.
		await res.fail([]);

		// Assert.
		expect(proxy).toHaveBeenCalledTimes(1);
		expect(proxy).toHaveBeenLastCalledWith<[RawMessageResponse]>({
			__type: "response",
			id: "abc123",
			path: "/toggle-light",
			status: 500,
			body: []
		});
	});

	/**
	 * Asserts {@link MessageResponseBuilder.send} sends a status.
	 */
	it("send status", async () => {
		// Arrange.
		const proxy = jest.fn();
		const res = new MessageResponseBuilder(
			{
				__type: "request",
				id: "abc123",
				path: "/mute-mic",
				unidirectional: false
			},
			proxy
		);

		// Act.
		await res.send(501);

		// Assert.
		expect(proxy).toHaveBeenCalledTimes(1);
		expect(proxy).toHaveBeenLastCalledWith<[RawMessageResponse]>({
			__type: "response",
			id: "abc123",
			path: "/mute-mic",
			status: 501
		});
	});

	/**
	 * Asserts a response can be sent when the request is unidirectional.
	 */
	it("can respond when unidirectional", async () => {
		// Arrange.
		const proxy = jest.fn();
		const res = new MessageResponseBuilder(
			{
				__type: "request",
				id: "abc123",
				path: "/test",
				unidirectional: true
			},
			proxy
		);

		// Act.
		await res.success();

		// Assert.
		expect(proxy).toHaveBeenCalledTimes(1);
		expect(proxy).toHaveBeenLastCalledWith<[RawMessageResponse]>({
			__type: "response",
			id: "abc123",
			path: "/test",
			status: 200
		});
	});

	/**
	 * Asserts a response is not sent after a response has already been sent.
	 */
	it("down not respond more than once", async () => {
		// Arrange.
		const proxy = jest.fn();
		const res = new MessageResponseBuilder(
			{
				__type: "request",
				id: "abc123",
				path: "/test",
				unidirectional: false,
				body: {
					id: 123
				}
			},
			proxy
		);

		// Act.
		await res.success();
		await res.success({ test: "other" });

		// Assert.
		expect(proxy).toHaveBeenCalledTimes(1);
		expect(proxy).toHaveBeenLastCalledWith<[RawMessageResponse]>({
			__type: "response",
			id: "abc123",
			path: "/test",
			status: 200
		});
	});
});
