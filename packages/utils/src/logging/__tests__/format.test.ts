import { beforeEach, describe, expect, test, vi } from "vitest";

import { stringFormatter } from "../index.js";

describe("stringFormatter", () => {
	describe("data only", () => {
		/**
		 * Asserts {@link stringFormatter} aggregates the data.
		 */
		test("without error", () => {
			// Arrange, act.
			const format = stringFormatter({ dataOnly: true });
			const actual = format({
				data: ["Hello", "World", { foo: "bar" }, true],
				level: "info",
				scope: "Test",
			});

			// Assert.
			expect(actual).toEqual(`Hello World {"foo":"bar"} true`);
		});

		/**
		 * Asserts {@link stringFormatter} aggregates data when one of the parameters is an error.
		 */
		test("with error", () => {
			// Arrange, act.
			const err = new Error("I am the error");
			const format = stringFormatter({ dataOnly: true });
			const actual = format({
				data: ["Encountered an error", err, true],
				level: "info",
				scope: "",
			});

			expect(actual).toEqual(`Encountered an error \n${err.stack}\ntrue`);
		});
	});

	describe("full", () => {
		const mockedDate = new Date("2000-12-25T10:30:00.123Z");
		const mockedDateString = "2000-12-25T10:30:00.123Z";

		beforeEach(() => vi.useFakeTimers().setSystemTime(mockedDate));

		describe("aggregating data", () => {
			/**
			 * Asserts {@link stringFormatter} aggregates the data.
			 */
			test("without error", () => {
				// Arrange, act.
				const format = stringFormatter();
				const actual = format({
					data: ["Hello", "World", { foo: "bar" }, true],
					level: "info",
					scope: "Test",
				});

				// Assert.
				expect(actual).toEqual(`${mockedDateString} INFO  Test: Hello World {"foo":"bar"} true`);
			});

			/**
			 * Asserts {@link stringFormatter} aggregates data when one of the parameters is an error.
			 */
			test("with error", () => {
				// Arrange, act.
				const err = new Error("I am the error");
				const format = stringFormatter();
				const actual = format({
					data: ["Encountered an error", err, true],
					level: "info",
					scope: "",
				});

				expect(actual).toEqual(`${mockedDateString} INFO  Encountered an error \n${err.stack}\ntrue`);
			});
		});

		describe("log each level", () => {
			/**
			 * Asserts {@link stringFormatter} for each log-level, without a scope.
			 */
			describe("without scope", () => {
				const testCases = [
					{
						name: "ERROR",
						level: "error" as const,
						expected: `${mockedDateString} ERROR Hello world`,
					},
					{
						name: "WARN",
						level: "warn" as const,
						expected: `${mockedDateString} WARN  Hello world`,
					},
					{
						name: "INFO",
						level: "info" as const,
						expected: `${mockedDateString} INFO  Hello world`,
					},
					{
						name: "DEBUG",
						level: "debug" as const,
						expected: `${mockedDateString} DEBUG Hello world`,
					},
					{
						name: "TRACE",
						level: "trace" as const,
						expected: `${mockedDateString} TRACE Hello world`,
					},
				];

				test.each(testCases)("$name message", ({ level, expected }) => {
					// Arrange, act.
					const format = stringFormatter();
					const actual = format({
						data: ["Hello world"],
						level,
						scope: "",
					});

					// Assert.
					expect(actual).toEqual(expected);
				});
			});

			/**
			 * Asserts {@link stringFormatter} for each log-level, with a scope.
			 */
			describe("with scope", () => {
				const scope = "Test->Logger";
				const testCases = [
					{
						name: "ERROR",
						level: "error" as const,
						expected: `${mockedDateString} ERROR ${scope}: Hello world`,
					},
					{
						name: "WARN",
						level: "warn" as const,
						expected: `${mockedDateString} WARN  ${scope}: Hello world`,
					},
					{
						name: "INFO",
						level: "info" as const,
						expected: `${mockedDateString} INFO  ${scope}: Hello world`,
					},
					{
						name: "DEBUG",
						level: "debug" as const,
						expected: `${mockedDateString} DEBUG ${scope}: Hello world`,
					},
					{
						name: "TRACE",
						level: "trace" as const,
						expected: `${mockedDateString} TRACE ${scope}: Hello world`,
					},
				];

				test.each(testCases)("$name message", ({ level, expected }) => {
					// Arrange, act.
					const format = stringFormatter();
					const actual = format({
						data: ["Hello world"],
						level,
						scope,
					});

					// Assert.
					expect(actual).toEqual(expected);
				});
			});
		});
	});
});
