import { describe, expect, it, vi } from "vitest";

import type {
	ApplicationDidLaunch,
	ApplicationDidTerminate,
	DidReceiveDeepLink,
	OpenUrl,
	SystemDidWakeUp,
} from "../../api";
import { Secrets } from "../../api/__mocks__/events";
import { Version } from "../common/version";
import { connection } from "../connection";
import {
	ApplicationDidLaunchEvent,
	ApplicationDidTerminateEvent,
	DidReceiveDeepLinkEvent,
	SystemDidWakeUpEvent,
} from "../events";
import * as manifest from "../manifest";
import {
	getSecrets,
	onApplicationDidLaunch,
	onApplicationDidTerminate,
	onDidReceiveDeepLink,
	onSystemDidWakeUp,
	openUrl,
} from "../system";

vi.mock("../connection");
vi.mock("../logging");
vi.mock("../manifest");

describe("system", () => {
	/**
	 * Asserts {@link onApplicationDidLaunch} is invoked when `applicationDidLaunch` is emitted.
	 */
	it("receives onApplicationDidLaunch", () => {
		// Arrange
		const listener = vi.fn();
		const ev = {
			event: "applicationDidLaunch",
			payload: {
				application: "notepad.exe",
			},
		} satisfies ApplicationDidLaunch;

		// Act (emit).
		const disposable = onApplicationDidLaunch(listener);
		connection.emit("applicationDidLaunch", ev);

		// Assert (emit).
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[ApplicationDidLaunchEvent]>({
			application: "notepad.exe",
			type: "applicationDidLaunch",
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit(ev.event, ev as any);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link onApplicationDidTerminate} is invoked when `onApplicationDidTerminate` is emitted.
	 */
	it("receives onApplicationDidTerminate", () => {
		// Arrange
		const listener = vi.fn();
		const ev = {
			event: "applicationDidTerminate",
			payload: {
				application: "notepad.exe",
			},
		} satisfies ApplicationDidTerminate;

		// Act (emit).
		const disposable = onApplicationDidTerminate(listener);
		connection.emit("applicationDidTerminate", ev);

		// Assert (emit).
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[ApplicationDidTerminateEvent]>({
			application: "notepad.exe",
			type: "applicationDidTerminate",
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit(ev.event, ev as any);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	describe("onDidReceiveDeepLink", () => {
		/**
		 * Asserts {@link onDidReceiveDeepLink} is invoked when `didReceiveDeepLink` is emitted.
		 */
		it("propagates", () => {
			// Arrange
			const listener = vi.fn();
			const ev = {
				event: "didReceiveDeepLink",
				payload: {
					url: "/hello/world?foo=bar#heading",
				},
			} satisfies DidReceiveDeepLink;

			// Act (emit).
			const disposable = onDidReceiveDeepLink(listener);
			connection.emit("didReceiveDeepLink", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DidReceiveDeepLinkEvent]>({
				url: {
					fragment: "heading",
					href: ev.payload.url,
					path: "/hello/world",
					query: "foo=bar",
					queryParameters: new URLSearchParams([["foo", "bar"]]),
				},
				type: "didReceiveDeepLink",
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link onDidReceiveDeepLink} throws an error if the Stream Deck version is earlier than 6.5.
		 */
		it("validates requires 6.5 (connection)", () => {
			// Arrange.
			vi.spyOn(connection, "version", "get").mockReturnValueOnce(new Version("6.4"));

			// Act, assert.
			expect(() => onDidReceiveDeepLink(vi.fn())).toThrow(
				`[ERR_NOT_SUPPORTED]: Receiving deep-link messages requires Stream Deck version 6.5 or higher, but current version is 6.4; please update Stream Deck and the "Software.MinimumVersion" in the plugin's manifest to "6.5" or higher.`,
			);
		});
	});

	/**
	 * Asserts {@link onSystemDidWakeUp} is invoked when `systemDidWakeUp` is emitted.
	 */
	it("Receives onSystemDidWakeUp", () => {
		// Arrange
		const listener = vi.fn();
		const ev = {
			event: "systemDidWakeUp",
		} satisfies SystemDidWakeUp;

		// Act (emit).
		const disposable = onSystemDidWakeUp(listener);
		connection.emit("systemDidWakeUp", ev);

		// Assert (emit).
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[SystemDidWakeUpEvent]>({
			type: "systemDidWakeUp",
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit(ev.event, ev as any);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link openUrl} sends the command to the {@link connection}.
	 */
	it("sends", async () => {
		// Arrange, act.
		await openUrl("https://www.elgato.com");

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[OpenUrl]>({
			event: "openUrl",
			payload: {
				url: "https://www.elgato.com",
			},
		});
	});

	describe("getSecrets", () => {
		it("requires SDKVersion 3 or higher", () => {
			// Arrange.
			vi.spyOn(manifest, "getSDKVersion").mockReturnValue(2); // Not okay
			vi.spyOn(manifest, "getSoftwareMinimumVersion").mockReturnValue(new Version("6.9")); // Okay

			// Act, assert.
			expect(() => getSecrets()).toThrow(
				`[ERR_NOT_SUPPORTED]: Secrets requires manifest SDK version 3 or higher, but found version 2; please update the "SDKVersion" in the plugin's manifest to 3 or higher.`,
			);
		});

		it("requires Software.MinimumVersion 6.9 or higher", () => {
			// Arrange.
			vi.spyOn(manifest, "getSDKVersion").mockReturnValue(3); // Okay
			vi.spyOn(manifest, "getSoftwareMinimumVersion").mockReturnValue(new Version("6.8")); // Not okay

			// Act, assert.
			expect(() => getSecrets()).toThrow(
				`[ERR_NOT_SUPPORTED]: Secrets requires Stream Deck version 6.9 or higher; please update the "Software.MinimumVersion" in the plugin's manifest to "6.9" or higher.`,
			);
		});

		it("getSecrets", async () => {
			// Arrange, act (Command).
			vi.spyOn(manifest, "getSDKVersion").mockReturnValue(3);
			vi.spyOn(manifest, "getSoftwareMinimumVersion").mockReturnValue(new Version("6.9"));

			const secrets = getSecrets<Secrets>();

			// Assert (Command).
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenLastCalledWith({
				event: "getSecrets",
				context: connection.registrationParameters.pluginUUID,
			});

			await expect(Promise.race([secrets, false])).resolves.toBe(false);

			// Act (Event).
			connection.emit("didReceiveSecrets", {
				event: "didReceiveSecrets",
				payload: {
					secrets: {
						secret: "Elgato",
					},
				},
			});
			await secrets;

			// Assert (Event).
			await expect(secrets).resolves.toEqual({
				secret: "Elgato",
			} satisfies Secrets);
		});
	});
});
