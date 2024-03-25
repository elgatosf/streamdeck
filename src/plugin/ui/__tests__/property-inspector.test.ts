import type { SendToPropertyInspector } from "../../../api";
import type { JsonValue } from "../../../common/json";
import type { MessageRequestOptions } from "../../../common/messaging";
import { connection } from "../../connection";
import { PropertyInspector } from "../property-inspector";
import { router } from "../router";

jest.mock("../../connection");
jest.mock("../../logging");
jest.mock("../../manifest");

describe("PropertyInspector", () => {
	/**
	 * Asserts {@link PropertyInspector} initializes it's context on construction.
	 */
	it("initializes context", () => {
		// Arrange, act.
		const pi = new PropertyInspector(router, {
			action: "com.elgato.test.one",
			context: "abc123",
			device: "dev123"
		});

		// Assert.
		expect(pi.deviceId).toBe("dev123");
		expect(pi.id).toBe("abc123");
		expect(pi.manifestId).toBe("com.elgato.test.one");
	});

	describe("fetch", () => {
		/**
		 * Asserts {@link PropertyInspector.fetch} forwards the path/body to {@link router.fetch}.
		 */
		test("path and body", async () => {
			// Arrange.
			const spyOnFetch = jest.spyOn(router, "fetch");
			const pi = new PropertyInspector(router, {
				action: "com.elgato.test.one",
				context: "abc123",
				device: "dev123"
			});

			// Act.
			await pi.fetch("/hello", { name: "Elgato" });

			// Assert.
			expect(spyOnFetch).toBeCalledTimes(1);
			expect(spyOnFetch).toHaveBeenLastCalledWith<[string, JsonValue]>("/hello", { name: "Elgato" });
		});

		/**
		 * Asserts {@link PropertyInspector.fetch} forwards the request {@link router.fetch}.
		 */
		test("request", async () => {
			// Arrange.
			const spyOnFetch = jest.spyOn(router, "fetch");
			const pi = new PropertyInspector(router, {
				action: "com.elgato.test.one",
				context: "abc123",
				device: "dev123"
			});

			// Act.
			await pi.fetch({
				path: "/hello",
				body: { name: "Elgato" },
				timeout: 1000,
				unidirectional: true
			});

			// Assert.
			expect(spyOnFetch).toBeCalledTimes(1);
			expect(spyOnFetch).toHaveBeenLastCalledWith<[MessageRequestOptions]>({
				path: "/hello",
				body: { name: "Elgato" },
				timeout: 1000,
				unidirectional: true
			});
		});
	});

	/**
	 * Asserts {@link PropertyInspector.sendMessage} sends the event to the {@link connection}.
	 */
	it("sends messages", async () => {
		// Arrange.
		const spyOnSend = jest.spyOn(connection, "send");
		const pi = new PropertyInspector(router, {
			action: "com.elgato.test.one",
			context: "abc123",
			device: "dev123"
		});

		// Act.
		await pi.sendMessage({ message: "Hello world" });

		// Assert.
		expect(spyOnSend).toBeCalledTimes(1);
		expect(spyOnSend).toHaveBeenLastCalledWith<[SendToPropertyInspector]>({
			context: "abc123",
			event: "sendToPropertyInspector",
			payload: {
				message: "Hello world"
			}
		});
	});
});
