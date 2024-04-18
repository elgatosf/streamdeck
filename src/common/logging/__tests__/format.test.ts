import { LogLevel } from "../../../common/logging";
import { stringFormatter } from "../format";

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
				level: LogLevel.INFO,
				scope: "Test"
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
				level: LogLevel.INFO,
				scope: ""
			});

			expect(actual).toEqual(`Encountered an error \n${err.stack}\ntrue`);
		});
	});

	describe("full", () => {
		const mockedDate = new Date(2000, 11, 25, 10, 30, 0, 123);
		const mockedDateString = "2000-12-25T10:30:00.123Z";

		beforeEach(() => jest.useFakeTimers().setSystemTime(mockedDate));

		describe("aggregating data", () => {
			/**
			 * Asserts {@link stringFormatter} aggregates the data.
			 */
			it("without error", () => {
				// Arrange, act.
				const format = stringFormatter();
				const actual = format({
					data: ["Hello", "World", { foo: "bar" }, true],
					level: LogLevel.INFO,
					scope: "Test"
				});

				// Assert.
				expect(actual).toEqual(`${mockedDateString} INFO  Test: Hello World {"foo":"bar"} true`);
			});

			/**
			 * Asserts {@link stringFormatter} aggregates data when one of the parameters is an error.
			 */
			it("with error", () => {
				// Arrange, act.
				const err = new Error("I am the error");
				const format = stringFormatter();
				const actual = format({
					data: ["Encountered an error", err, true],
					level: LogLevel.INFO,
					scope: ""
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
						level: LogLevel.ERROR,
						expected: `${mockedDateString} ERROR Hello world`
					},
					{
						name: "WARN",
						level: LogLevel.WARN,
						expected: `${mockedDateString} WARN  Hello world`
					},
					{
						name: "INFO",
						level: LogLevel.INFO,
						expected: `${mockedDateString} INFO  Hello world`
					},
					{
						name: "DEBUG",
						level: LogLevel.DEBUG,
						expected: `${mockedDateString} DEBUG Hello world`
					},
					{
						name: "TRACE",
						level: LogLevel.TRACE,
						expected: `${mockedDateString} TRACE Hello world`
					}
				];

				it.each(testCases)("$name message", ({ level, expected }) => {
					// Arrange, act.
					const format = stringFormatter();
					const actual = format({
						data: ["Hello world"],
						level,
						scope: ""
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
						level: LogLevel.ERROR,
						expected: `${mockedDateString} ERROR ${scope}: Hello world`
					},
					{
						name: "WARN",
						level: LogLevel.WARN,
						expected: `${mockedDateString} WARN  ${scope}: Hello world`
					},
					{
						name: "INFO",
						level: LogLevel.INFO,
						expected: `${mockedDateString} INFO  ${scope}: Hello world`
					},
					{
						name: "DEBUG",
						level: LogLevel.DEBUG,
						expected: `${mockedDateString} DEBUG ${scope}: Hello world`
					},
					{
						name: "TRACE",
						level: LogLevel.TRACE,
						expected: `${mockedDateString} TRACE ${scope}: Hello world`
					}
				];

				it.each(testCases)("$name message", ({ level, expected }) => {
					// Arrange, act.
					const format = stringFormatter();
					const actual = format({
						data: ["Hello world"],
						level,
						scope
					});

					// Assert.
					expect(actual).toEqual(expected);
				});
			});
		});
	});
});
