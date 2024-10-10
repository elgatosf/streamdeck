import type { SendToPropertyInspector } from "../../../api";
import type { JsonValue } from "../../../common/json";
import type { MessageRequestOptions } from "../../../common/messaging";
import { actionStore } from "../../actions/store";
import { connection } from "../../connection";
import { PropertyInspector } from "../property-inspector";
import { router } from "../router";

jest.mock("../../actions/store");
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
			action: "com.elgato.test.key",
			context: "key123", // Mocked in actionStore.
			device: "dev123",
		});

		// Assert.
		expect(actionStore.getActionById).toHaveBeenCalledTimes(1);
		expect(actionStore.getActionById).toHaveBeenLastCalledWith("key123");
		expect(pi.action).toEqual(actionStore.getActionById("key123"));
	});

	describe("fetch", () => {
		/**
		 * Asserts {@link PropertyInspector.fetch} forwards the path/body to {@link router.fetch}.
		 */
		test("path and body", async () => {
			// Arrange.
			const spyOnFetch = jest.spyOn(router, "fetch");
			const pi = new PropertyInspector(router, {
				action: "com.elgato.test.key",
				context: "abc123",
				device: "dev123",
			});

			// Act.
			await pi.fetch("/hello", { name: "Elgato" });

			// Assert.
			expect(spyOnFetch).toBeCalledTimes(1);
			expect(spyOnFetch).toHaveBeenLastCalledWith<[string, JsonValue]>("public:/hello", { name: "Elgato" });
		});

		/**
		 * Asserts {@link PropertyInspector.fetch} forwards the request {@link router.fetch}.
		 */
		test("request", async () => {
			// Arrange.
			const spyOnFetch = jest.spyOn(router, "fetch");
			const pi = new PropertyInspector(router, {
				action: "com.elgato.test.key",
				context: "abc123",
				device: "dev123",
			});

			// Act.
			await pi.fetch({
				path: "/hello",
				body: { name: "Elgato" },
				timeout: 1000,
				unidirectional: true,
			});

			// Assert.
			expect(spyOnFetch).toBeCalledTimes(1);
			expect(spyOnFetch).toHaveBeenLastCalledWith<[MessageRequestOptions]>({
				path: "public:/hello",
				body: { name: "Elgato" },
				timeout: 1000,
				unidirectional: true,
			});
		});
	});

	/**
	 * Asserts {@link PropertyInspector.sendToPropertyInspector} sends the event to the {@link connection}.
	 */
	it("sends payloads (legacy)", async () => {
		// Arrange.
		const spyOnSend = jest.spyOn(connection, "send");
		const pi = new PropertyInspector(router, {
			action: "com.elgato.test.key",
			context: "key123",
			device: "dev123",
		});

		// Act.
		await pi.sendToPropertyInspector({ message: "Hello world" });

		// Assert.
		expect(spyOnSend).toBeCalledTimes(1);
		expect(spyOnSend).toHaveBeenLastCalledWith<[SendToPropertyInspector]>({
			context: "key123",
			event: "sendToPropertyInspector",
			payload: {
				message: "Hello world",
			},
		});
	});
});
