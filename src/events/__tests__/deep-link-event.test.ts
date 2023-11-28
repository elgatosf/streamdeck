import { DeepLinkURL } from "../deep-link-event";

describe("DeepLinkURL", () => {
	/**
	 * Asserts all {@link DeepLinkURL} properties are correct when only the path is specified.
	 */
	it("parses path", () => {
		// Arrange, act.
		const url = new DeepLinkURL("/hello/world");

		// Assert.
		expect(url.fragment).toBe("");
		expect(url.href).toBe("/hello/world");
		expect(url.path).toBe("/hello/world");
		expect(url.query).toBe("");
		expect(url.queryParameters.size).toBe(0);
	});

	/**
	 * Asserts all {@link DeepLinkURL} properties are correct when the path and query are specified.
	 */
	it("parses path, and query", () => {
		// Arrange, act.
		const url = new DeepLinkURL("/hello?foo=bar");

		// Assert.
		expect(url.fragment).toBe("");
		expect(url.href).toBe("/hello?foo=bar");
		expect(url.path).toBe("/hello");
		expect(url.query).toBe("foo=bar");
		expect(url.queryParameters.size).toBe(1);
		expect(url.queryParameters.get("foo")).toBe("bar");
	});

	/**
	 * Asserts all {@link DeepLinkURL} properties are correct when the path, query, and fragment are specified.
	 */
	it("parses path, query, and fragment", () => {
		// Arrange, act.
		const url = new DeepLinkURL("/hello?foo=bar#heading");

		// Assert.
		expect(url.fragment).toBe("heading");
		expect(url.href).toBe("/hello?foo=bar#heading");
		expect(url.path).toBe("/hello");
		expect(url.query).toBe("foo=bar");
		expect(url.queryParameters.size).toBe(1);
		expect(url.queryParameters.get("foo")).toBe("bar");
	});

	/**
	 * Asserts all {@link DeepLinkURL} properties are correct when the only the query is specified.
	 */
	it("parses query", () => {
		// Arrange, act.
		const url = new DeepLinkURL("/?foo=bar");

		// Assert.
		expect(url.fragment).toBe("");
		expect(url.href).toBe("/?foo=bar");
		expect(url.path).toBe("/");
		expect(url.query).toBe("foo=bar");
		expect(url.queryParameters.size).toBe(1);
		expect(url.queryParameters.get("foo")).toBe("bar");
	});

	/**
	 * Asserts all {@link DeepLinkURL} properties are correct when the query and fragment are specified.
	 */
	it("parses query, and fragment", () => {
		// Arrange, act.
		const url = new DeepLinkURL("/?foo=bar#heading");

		// Assert.
		expect(url.fragment).toBe("heading");
		expect(url.href).toBe("/?foo=bar#heading");
		expect(url.path).toBe("/");
		expect(url.query).toBe("foo=bar");
		expect(url.queryParameters.size).toBe(1);
		expect(url.queryParameters.get("foo")).toBe("bar");
	});

	/**
	 * Asserts all {@link DeepLinkURL} properties are correct when only the fragment is specified.
	 */
	it("parses fragment", () => {
		// Arrange, act.
		const url = new DeepLinkURL("/#heading");

		// Assert.
		expect(url.fragment).toBe("heading");
		expect(url.href).toBe("/#heading");
		expect(url.path).toBe("/");
		expect(url.query).toBe("");
		expect(url.queryParameters.size).toBe(0);
	});

	/**
	 * Asserts all {@link DeepLinkURL} properties are correct when the the fragment's number sign (#) is specified before the query's question mark (?).
	 */
	it("parses path when fragment is before query", () => {
		// Arrange, act.
		const url = new DeepLinkURL("/hello#?heading");

		// Assert.
		expect(url.fragment).toBe("?heading");
		expect(url.href).toBe("/hello#?heading");
		expect(url.path).toBe("/hello");
		expect(url.query).toBe("");
		expect(url.queryParameters.size).toBe(0);
	});
});
