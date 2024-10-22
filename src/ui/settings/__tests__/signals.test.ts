/**
 * @jest-environment jsdom
 */
import { connection } from "../../connection";
import { SettingSignalProvider } from "../signals";

jest.mock("../../connection");

describe("signals", () => {
	beforeAll(() => {
		jest.useFakeTimers();
	});

	it("can be created", () => {
		// Arrange.
		const provider = new SettingSignalProvider("didReceiveGlobalSettings", jest.fn());
		provider.initialize({
			name: "Elgato",
		});

		// Act.
		const signal = provider.use("name");

		// Assert.
		expect(signal.value.get()).resolves.toBe("Elgato");
	});

	it("should update settings", async () => {
		// Arrange.
		const saveFn = jest.fn();
		const provider = new SettingSignalProvider("didReceiveGlobalSettings", saveFn);
		provider.initialize({
			name: "Elgato",
			existing: true,
		});

		// Act.
		const signal = provider.use("name");
		await signal.value.set("Stream Deck");

		// Assert.
		expect(saveFn).toHaveBeenCalledTimes(1);
		expect(saveFn).toHaveBeenCalledWith({
			name: "Stream Deck",
			existing: true,
		});
	});

	it("should not save unchanged settings", async () => {
		// Arrange.
		const saveFn = jest.fn();
		const provider = new SettingSignalProvider("didReceiveGlobalSettings", saveFn);
		provider.initialize({
			name: "Elgato",
		});

		// Act.
		const signal = provider.use("name");
		await signal.value.set("Elgato");

		// Assert.
		expect(saveFn).toHaveBeenCalledTimes(0);
	});

	it("should be capable of debouncing", async () => {
		// Arrange.
		const saveFn = jest.fn();
		const provider = new SettingSignalProvider("didReceiveGlobalSettings", saveFn);
		provider.initialize({
			name: "Elgato",
		});

		// Act.
		const signal = provider.use("name", {
			debounceSaveTimeout: 10000,
		});

		const resolver = Promise.all([
			signal.value.set("One"),
			signal.value.set("Two"),
			signal.value.set("Three"),
		]);

		jest.runAllTimers();
		await resolver;

		// Assert.
		expect(saveFn).toHaveBeenCalledTimes(1);
		expect(saveFn).toHaveBeenCalledWith({
			name: "Three",
		});
	});

	describe("synchronization", () => {
		it("from other signals", async () => {
			// Arrange.
			const onChangeFn = jest.fn();
			const provider = new SettingSignalProvider("didReceiveGlobalSettings", jest.fn());
			provider.initialize({
				name: "Elgato",
			});

			// Act.
			const signalOne = provider.use("name");
			const signalTwo = provider.use("name", { onChange: onChangeFn });
			await signalOne.value.set("Stream Deck");

			// Assert.
			expect(onChangeFn).toHaveBeenCalledTimes(1);
			expect(signalTwo.value.get()).resolves.toBe("Stream Deck");
		});

		it("from connection", async () => {
			// Arrange.
			const onChangeFn = jest.fn();
			const provider = new SettingSignalProvider("didReceiveGlobalSettings", jest.fn());
			provider.initialize({
				name: "Elgato",
			});

			// Act.
			const signal = provider.use("name", { onChange: onChangeFn });
			connection.emit("didReceiveGlobalSettings", {
				event: "didReceiveGlobalSettings",
				payload: {
					settings: {
						name: "Stream Deck",
					},
				},
			});

			// Assert.
			expect(onChangeFn).toHaveBeenCalledTimes(1);
			expect(signal.value.get()).resolves.toBe("Stream Deck");
		});
	});

	describe("disposing", () => {
		it("removes local listeners", async () => {
			// Arrange.
			const onChangeFn = jest.fn();
			const provider = new SettingSignalProvider("didReceiveGlobalSettings", jest.fn());
			provider.initialize({
				name: "Elgato",
			});

			const signalOne = provider.use("name");
			const signalTwo = provider.use("name", { onChange: onChangeFn });

			// Act.
			await signalOne.value.set("Stream Deck");
			signalTwo.dispose();
			await signalOne.value.set("Stream Deck");

			// Assert.
			expect(onChangeFn).toHaveBeenCalledTimes(1);
		});

		it("removes remote listeners", async () => {
			// Arrange.
			const onChangeFn = jest.fn();
			const provider = new SettingSignalProvider("didReceiveGlobalSettings", jest.fn());
			provider.initialize({
				name: "Elgato",
			});

			const emit = () => {
				connection.emit("didReceiveGlobalSettings", {
					event: "didReceiveGlobalSettings",
					payload: {
						settings: {
							name: "Elgato",
						},
					},
				});
			};

			const signal = provider.use("name", { onChange: onChangeFn });

			// Act.
			emit();
			signal.dispose();
			emit();

			// Assert.
			expect(onChangeFn).toHaveBeenCalledTimes(1);
		});
	});
});
