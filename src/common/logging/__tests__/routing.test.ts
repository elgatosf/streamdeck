import type { LogEntry } from "..";
import { MessageGateway, MessageResponder, type MessageRequestOptions } from "../../messaging";
import { LogLevel } from "../level";
import { Logger } from "../logger";

import { LOGGING_WRITE_ROUTE, createRoutedLogTarget, registerCreateLogEntryRoute, type JsonSafeLogEntry } from "../routing";

jest.mock("../../messaging");

describe("createRoutedLogTarget", () => {
	it("sends log entry to router", () => {
		// Arrange.
		const router = new MessageGateway<unknown>(jest.fn(), jest.fn());
		const target = createRoutedLogTarget(router);

		// Act.
		target.write({
			data: ["Hello", "world"],
			level: LogLevel.INFO,
			scope: "Test"
		});

		// Assert.
		expect(router.fetch).toHaveBeenCalledTimes(1);
		expect(router.fetch).toHaveBeenCalledWith<[MessageRequestOptions]>({
			body: {
				level: LogLevel.INFO,
				message: "Hello world",
				scope: "Test"
			} satisfies JsonSafeLogEntry,
			path: LOGGING_WRITE_ROUTE,
			unidirectional: true
		});
	});
});

describe("registerCreateLogEntryRoute", () => {
	describe("incomplete request", () => {
		test("body is undefined", () => {
			// Arrange.
			const router = new MessageGateway<unknown>(jest.fn(), jest.fn());
			const spyOnRoute = jest.spyOn(router, "route");
			const responder = new MessageResponder(null!, jest.fn());

			// Act.
			registerCreateLogEntryRoute(router, null!);
			spyOnRoute.mock.calls[0][1](
				{
					action: jest.fn(),
					path: LOGGING_WRITE_ROUTE,
					unidirectional: true,
					body: undefined
				},
				responder
			);

			// Assert.
			expect(spyOnRoute).toHaveBeenCalledTimes(1);
			expect(spyOnRoute).toHaveBeenCalledWith(LOGGING_WRITE_ROUTE, expect.any(Function));
			expect(responder.fail).toHaveBeenCalledTimes(1);
		});

		test("level is undefined", () => {
			// Arrange.
			const router = new MessageGateway<unknown>(jest.fn(), jest.fn());
			const spyOnRoute = jest.spyOn(router, "route");
			const responder = new MessageResponder(null!, jest.fn());

			// Act.
			registerCreateLogEntryRoute(router, null!);
			spyOnRoute.mock.calls[0][1](
				{
					action: jest.fn(),
					path: LOGGING_WRITE_ROUTE,
					unidirectional: true,
					body: {
						level: undefined
					}
				},
				responder
			);

			// Assert.
			expect(spyOnRoute).toHaveBeenCalledTimes(1);
			expect(spyOnRoute).toHaveBeenCalledWith(LOGGING_WRITE_ROUTE, expect.any(Function));
			expect(responder.fail).toHaveBeenCalledTimes(1);
		});
	});

	it("should write to logger", () => {
		// Arrange.
		const router = new MessageGateway<unknown>(jest.fn(), jest.fn());
		const spyOnRoute = jest.spyOn(router, "route");
		const responder = new MessageResponder(null!, jest.fn());

		const logger = new Logger({
			level: LogLevel.INFO,
			isDebugMode: true,
			targets: [{ write: jest.fn() }]
		});

		const spyOnWrite = jest.spyOn(logger, "write");

		// Act.
		registerCreateLogEntryRoute(router, logger);
		spyOnRoute.mock.calls[0][1](
			{
				action: jest.fn(),
				path: LOGGING_WRITE_ROUTE,
				unidirectional: true,
				body: {
					level: LogLevel.WARN,
					message: "Hello world",
					scope: "Test"
				} satisfies JsonSafeLogEntry
			},
			responder
		);

		// Assert.
		expect(spyOnRoute).toHaveBeenCalledTimes(1);
		expect(spyOnRoute).toHaveBeenCalledWith(LOGGING_WRITE_ROUTE, expect.any(Function));
		expect(spyOnWrite).toHaveBeenCalledTimes(1);
		expect(spyOnWrite).toHaveBeenCalledWith<[LogEntry]>({
			data: ["Hello world"],
			level: LogLevel.WARN,
			scope: "Test"
		});
		expect(responder.success).toHaveBeenCalledTimes(1);
	});
});
