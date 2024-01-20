import { getConnection } from "../../tests/__mocks__/connection";
import * as mockEvents from "../api/__mocks__/events";
import { type OpenUrl } from "../api/command";
import { Version } from "../common/version";
import { StreamDeckConnection } from "../connectivity/connection";
import { ApplicationDidLaunchEvent, ApplicationDidTerminateEvent, DidReceiveDeepLinkEvent, SystemDidWakeUpEvent } from "../events";
import { System } from "../system";
import * as ValidationModule from "../validation";

jest.mock("../manifest");
jest.mock("../validation", () => {
	return {
		__esModule: true,
		...jest.requireActual("../validation")
	};
});

describe("System", () => {
	/**
	 * Asserts {@link System.onApplicationDidLaunch} invokes the listener when the connection emits the `applicationDidLaunch` event.
	 */
	it("Receives onApplicationDidLaunch", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const system = new System(connection);

		const listener = jest.fn();
		const emit = () => emitMessage(mockEvents.applicationDidLaunch);

		// Act.
		const result = system.onApplicationDidLaunch(listener);
		const {
			payload: { application }
		} = emit();

		//Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[ApplicationDidLaunchEvent]>({
			application,
			type: "applicationDidLaunch"
		});

		// Act (dispose).
		result.dispose();
		emit();

		// Assert (dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link System.onApplicationDidTerminate} invokes the listener when the connection emits the `applicationDidTerminate` event.
	 */
	it("Receives onApplicationDidTerminate", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const system = new System(connection);

		const listener = jest.fn();
		const emit = () => emitMessage(mockEvents.applicationDidTerminate);

		// Act.
		const result = system.onApplicationDidTerminate(listener);
		const {
			payload: { application }
		} = emit();

		//Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[ApplicationDidTerminateEvent]>({
			application,
			type: "applicationDidTerminate"
		});

		// Act (dispose).
		result.dispose();
		emit();

		// Assert (dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	describe("onDidReceiveDeepLink", () => {
		/**
		 * Asserts {@link System.onDidReceiveDeepLink} invokes the listener when the connection emits the `didReceiveDeepLink` event.
		 */
		it("Propagates", () => {
			// Arrange.
			const { connection, emitMessage } = getConnection();
			const system = new System(connection);

			const listener = jest.fn();
			const emit = () =>
				emitMessage({
					event: "didReceiveDeepLink",
					payload: {
						url: "/hello/world?foo=bar#heading"
					}
				});

			// Act.
			const result = system.onDidReceiveDeepLink(listener);
			const {
				payload: { url }
			} = emit();

			//Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DidReceiveDeepLinkEvent]>({
				type: "didReceiveDeepLink",
				url: {
					fragment: "heading",
					href: url,
					path: "/hello/world",
					query: "foo=bar",
					queryParameters: new URLSearchParams([["foo", "bar"]])
				}
			});

			// Act (dispose).
			result.dispose();
			emit();

			// Assert (dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link System.onDidReceiveDeepLink} throws an error if the Stream Deck version is earlier than 6.5.
		 */
		it("Throws pre 6.5 (connection)", () => {
			// Arrange.
			const { connection } = getConnection(6.4);
			const system = new System(connection);
			const spy = jest.spyOn(ValidationModule, "requiresVersion");

			// Act, assert.
			expect(() => system.onDidReceiveDeepLink(jest.fn())).toThrow(
				`[ERR_NOT_SUPPORTED]: Receiving deep-link messages requires Stream Deck version 6.5 or higher, but current version is 6.4; please update Stream Deck and the "Software.MinimumVersion" in the plugin's manifest to "6.5" or higher.`
			);
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith<[number, Version, string]>(6.5, connection.version, "Receiving deep-link messages");
		});
	});

	/**
	 * Asserts {@link System.onSystemDidWakeUp} invokes the listener when the connection emits the `systemDidWakeUp` event.
	 */
	it("Receives onSystemDidWakeUp", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const system = new System(connection);

		const listener = jest.fn();
		const emit = () => emitMessage(mockEvents.systemDidWakeUp);

		// Act.
		const result = system.onSystemDidWakeUp(listener);
		emit();

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[SystemDidWakeUpEvent]>({
			type: "systemDidWakeUp"
		});

		// Act (dispose).
		result.dispose();
		emit();

		// Assert (dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link System.openUrl} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends openUrl", async () => {
		// Arrange.
		const { connection } = getConnection();
		const system = new System(connection);

		// Act.
		await system.openUrl("https://www.elgato.com");

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[OpenUrl]>({
			event: "openUrl",
			payload: {
				url: "https://www.elgato.com"
			}
		});
	});
});
