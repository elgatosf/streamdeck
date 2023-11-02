import { getMockedConnection } from "../../tests/__mocks__/connection";
import * as mockEvents from "../connectivity/__mocks__/events";
import { OpenUrl } from "../connectivity/commands";
import { StreamDeckConnection } from "../connectivity/connection";
import { ApplicationDidLaunchEvent, ApplicationDidTerminateEvent, SystemDidWakeUpEvent } from "../events";
import { System } from "../system";

describe("StreamDeckClient", () => {
	/**
	 * Asserts {@link System.onApplicationDidLaunch} invokes the listener when the connection emits the `applicationDidLaunch` event.
	 */
	it("Receives onApplicationDidLaunch", () => {
		// Arrange.
		const { connection } = getMockedConnection();
		const system = new System(connection);

		const listener = jest.fn();
		system.onApplicationDidLaunch(listener);

		// Act.
		const {
			payload: { application }
		} = connection.__emit(mockEvents.applicationDidLaunch);

		//Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[ApplicationDidLaunchEvent]>({
			application,
			type: "applicationDidLaunch"
		});
	});

	/**
	 * Asserts {@link System.onApplicationDidTerminate} invokes the listener when the connection emits the `applicationDidTerminate` event.
	 */
	it("Receives onApplicationDidTerminate", () => {
		// Arrange.
		const { connection } = getMockedConnection();
		const system = new System(connection);

		const listener = jest.fn();
		system.onApplicationDidTerminate(listener);

		// Act.
		const {
			payload: { application }
		} = connection.__emit(mockEvents.applicationDidTerminate);

		//Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[ApplicationDidTerminateEvent]>({
			application,
			type: "applicationDidTerminate"
		});
	});

	/**
	 * Asserts {@link System.onSystemDidWakeUp} invokes the listener when the connection emits the `systemDidWakeUp` event.
	 */
	it("Receives onSystemDidWakeUp", () => {
		// Arrange.
		const { connection } = getMockedConnection();
		const system = new System(connection);

		const listener = jest.fn();
		system.onSystemDidWakeUp(listener);

		// Act.
		connection.__emit(mockEvents.systemDidWakeUp);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[SystemDidWakeUpEvent]>({
			type: "systemDidWakeUp"
		});
	});

	/**
	 * Asserts {@link System.openUrl} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends openUrl", async () => {
		// Arrange.
		const { connection } = getMockedConnection();
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
