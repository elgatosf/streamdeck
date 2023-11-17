import { getConnection } from "../../tests/__mocks__/connection";
import * as mockEvents from "../connectivity/__mocks__/events";
import { OpenUrl } from "../connectivity/commands";
import { StreamDeckConnection } from "../connectivity/connection";
import { ApplicationDidLaunchEvent, ApplicationDidTerminateEvent, SystemDidWakeUpEvent } from "../events";
import { System } from "../system";

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
