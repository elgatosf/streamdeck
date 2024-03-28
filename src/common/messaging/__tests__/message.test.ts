import { isRequest, isResponse, type RawMessageRequest, type RawMessageResponse } from "../message";

describe("isRequest", () => {
	const request = {
		__type: "request",
		id: "abc123",
		path: "/test",
		unidirectional: false
	} satisfies RawMessageRequest;

	/**
	 * Asserts a valid structures.
	 */
	test("valid", () => {
		// Arrange, act, assert.
		const actual = isRequest(request);
		expect(actual).toBe(true);
	});

	/**
	 * Asserts invalid structures.
	 */
	test.each([
		{
			name: "value must not be undefined",
			request: undefined
		},
		{
			name: "value must not be null",
			request: null
		},
		{
			name: "value must be an object",
			request: true
		},
		{
			name: "__type must exist",
			request: {
				id: "abc123",
				path: "/test",
				unidirectional: true
			}
		},
		{
			name: "id must exist",
			request: {
				__type: "request",
				path: "/test",
				unidirectional: true
			}
		},
		{
			name: "path must exist",
			request: {
				__type: "request",
				id: "abc123",
				unidirectional: true
			}
		},
		{
			name: "unidirectional must exist",
			request: {
				__type: "request",
				id: "abc123",
				path: "/test"
			}
		},
		{
			name: "__type must be 'request'",
			request: {
				...request,
				__type: "other"
			}
		},
		{
			name: "id must be string",
			request: {
				...request,
				id: 1
			}
		},
		{
			name: "path must be string",
			request: {
				...request,
				path: false
			}
		},
		{
			name: "unidirectional must be boolean",
			request: {
				...request,
				unidirectional: 13
			}
		}
	])("$name", ({ request }) => {
		// Arrange, act, assert.
		const actual = isRequest(request);
		expect(actual).toBe(false);
	});
});

describe("isResponse", () => {
	const response = {
		__type: "response",
		id: "abc123",
		path: "/test",
		status: 200
	} satisfies RawMessageResponse;

	/**
	 * Asserts a valid structures.
	 */
	test("valid", () => {
		// Arrange, act, assert.
		const actual = isResponse(response);
		expect(actual).toBe(true);
	});

	/**
	 * Asserts invalid structures.
	 */
	test.each([
		{
			name: "value must not be undefined",
			response: undefined
		},
		{
			name: "value must not be null",
			response: null
		},
		{
			name: "value must be an object",
			response: true
		},
		{
			name: "__type must exist",
			response: {
				id: "abc123",
				path: "/test",
				status: 200
			}
		},
		{
			name: "id must exist",
			response: {
				__type: "response",
				path: "/test",
				status: 200
			}
		},
		{
			name: "path must exist",
			response: {
				__type: "response",
				id: "abc123",
				status: 200
			}
		},
		{
			name: "status must exist",
			response: {
				__type: "response",
				id: "abc123",
				path: "/test"
			}
		},
		{
			name: "__type must be 'response'",
			response: {
				...response,
				__type: "other"
			}
		},
		{
			name: "id must be string",
			response: {
				...response,
				id: 1
			}
		},
		{
			name: "path must be string",
			response: {
				...response,
				path: false
			}
		},
		{
			name: "status must be number",
			response: {
				...response,
				status: false
			}
		}
	])("$name", ({ response }) => {
		// Arrange, act, assert.
		const actual = isResponse(response);
		expect(actual).toBe(false);
	});
});
