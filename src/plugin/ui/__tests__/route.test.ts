import { Action, action, type JsonObject, type MessageRequest } from "../..";
import type { PluginCommand, SendToPropertyInspector } from "../../../api";
import { MessageGateway, MessageResponder } from "../../../common/messaging";
import { PromiseCompletionSource } from "../../../common/promises";
import { SingletonAction } from "../../actions/singleton-action";
import { connection } from "../../connection";
import { route } from "../route";

jest.mock("../../connection");
jest.mock("../../logging");
jest.mock("../../manifest");

describe("route", () => {
	let piRouter: MessageGateway<object>;

	describe("current PI has routes", () => {
		const ev = {
			action: "com.elgato.test.one",
			context: "abc123"
		};

		beforeEach(() => initialize(ev.action));

		/**
		 * Asserts {@link route} with an asynchronous result.
		 */
		test("async", async () => {
			// Arrange.
			const awaiter = new PromiseCompletionSource();
			const action = new ActionWithRoutes("sync");
			action.spyOnGetCharacters.mockImplementation(() => awaiter.setResult(true));

			// Act.
			const res = await piRouter.fetch("/characters", {
				game: "World of Warcraft"
			});

			// Assert.
			await awaiter.promise;
			expect(action.spyOnGetCharacters).toHaveBeenCalledTimes(1);
			expect(action.spyOnGetCharacters).toHaveBeenLastCalledWith<[MessageRequest<Filter>, MessageResponder]>(
				{
					action: new Action(ev),
					path: "/characters",
					unidirectional: false,
					body: {
						game: "World of Warcraft"
					}
				},
				expect.any(MessageResponder)
			);

			expect(res.status).toBe(200);
			expect(res.ok).toBe(true);
			expect(res.body).toEqual(["Anduin", "Sylvanas", "Thrall"]);
		});

		/**
		 * Asserts {@link route} with a synchronous result.
		 */
		test("sync", async () => {
			// Arrange, act.
			const awaiter = new PromiseCompletionSource();
			const action = new ActionWithRoutes("sync");
			action.spyOnGetCharactersSync.mockImplementation(() => awaiter.setResult(true));

			// Act.
			const res = await piRouter.fetch("/characters-sync", {
				game: "Mario World"
			});

			// Assert.
			await awaiter.promise;
			expect(action.spyOnGetCharactersSync).toHaveBeenCalledTimes(1);
			expect(action.spyOnGetCharactersSync).toHaveBeenLastCalledWith<[MessageRequest<Filter>, MessageResponder]>(
				{
					action: new Action(ev),
					path: "/characters-sync",
					unidirectional: false,
					body: {
						game: "Mario World"
					}
				},
				expect.any(MessageResponder)
			);

			expect(res.status).toBe(200);
			expect(res.ok).toBe(true);
			expect(res.body).toEqual(["Mario", "Luigi", "Peach"]);
		});

		/**
		 * Asserts {@link route} with no result.
		 */
		test("void", async () => {
			// Arrange, act.
			const action = new ActionWithRoutes("void");
			const res = await piRouter.fetch("/save");

			// Assert.
			expect(action.spyOnSave).toHaveBeenCalledTimes(1);
			expect(action.spyOnSave).toHaveBeenLastCalledWith<[MessageRequest<Filter>, MessageResponder]>(
				{
					action: new Action(ev),
					path: "/save",
					unidirectional: false,
					body: undefined
				},
				expect.any(MessageResponder)
			);

			expect(res.status).toBe(200);
			expect(res.ok).toBe(true);
			expect(res.body).toBeUndefined();
		});
	});

	describe("current PI does not have routes", () => {
		beforeEach(() => initialize("com.other"));

		/**
		 * Asserts {@link route} with an asynchronous result.
		 */
		test("async", async () => {
			// Arrange, act.
			const action = new ActionWithRoutes("async");
			const res = await piRouter.fetch("/characters", {
				game: "World of Warcraft"
			});

			// Assert.
			expect(action.spyOnGetCharacters).toHaveBeenCalledTimes(0);
			expect(res.status).toBe(501);
			expect(res.ok).toBe(false);
			expect(res.body).toBeUndefined();
		});

		/**
		 * Asserts {@link route} with a synchronous result.
		 */
		test("sync", async () => {
			// Arrange, act.
			const action = new ActionWithRoutes("sync");
			const res = await piRouter.fetch("/characters-sync", {
				game: "Mario World"
			});

			// Assert.
			expect(action.spyOnGetCharactersSync).toHaveBeenCalledTimes(0);
			expect(res.status).toBe(501);
			expect(res.ok).toBe(false);
			expect(res.body).toBeUndefined();
		});

		/**
		 * Asserts {@link route} with no result.
		 */
		test("void", async () => {
			// Arrange, act.
			const action = new ActionWithRoutes("void");
			const res = await piRouter.fetch("/save");

			// Assert.
			expect(action.spyOnSave).toHaveBeenCalledTimes(0);
			expect(res.status).toBe(501);
			expect(res.ok).toBe(false);
			expect(res.body).toBeUndefined();
		});
	});

	/**
	 * Initializes the "current property inspector" for the specific action type.
	 * @param action Action type of the current property inspector.
	 */
	function initialize(action: string): void {
		// Set the current property inspector associated with the plugin router.
		connection.emit("propertyInspectorDidAppear", {
			action,
			context: "abc123",
			device: "dev123",
			event: "propertyInspectorDidAppear"
		});

		// Mock a property inspector router.
		piRouter = new MessageGateway<object>(
			(payload) => {
				connection.emit("sendToPlugin", {
					action,
					context: "abc123",
					event: "sendToPlugin",
					payload
				});
				return true;
			},
			() => ({})
		);

		// Intercept commands sent to the property inspector, forwarding them to the mocked property inspector router.
		jest.spyOn(connection, "send").mockImplementation((cmd: PluginCommand) => {
			if (cmd.event === "sendToPropertyInspector") {
				piRouter.process({
					action,
					context: "abc123",
					event: "sendToPropertyInspector",
					payload: (cmd as SendToPropertyInspector<JsonObject>).payload
				});
			}

			return Promise.resolve();
		});
	}
});

/**
 * Mock action with routes.
 */
@action({ UUID: "com.elgato.test.one" })
class ActionWithRoutes extends SingletonAction {
	public spyOnGetCharacters = jest.fn();
	public spyOnGetCharactersSync = jest.fn();
	public spyOnSave = jest.fn();

	constructor(private readonly id: string) {
		super();
		console.log(id);
	}

	/**
	 * Mock route with an asynchronous result.
	 * @param req The request.
	 * @param res The responder.
	 * @returns The characters.
	 */
	@route("/characters")
	public getCharacters(req: MessageRequest, res: MessageResponder): Promise<string[]> {
		console.log("Called spy async");
		this.spyOnGetCharacters(req, res);
		return Promise.resolve(["Anduin", "Sylvanas", "Thrall"]);
	}

	/**
	 * Mock route with a synchronous result.
	 * @param req The request.
	 * @param res The responder.
	 * @returns The characters.
	 */
	@route("/characters-sync")
	public getCharactersSync(req: MessageRequest, res: MessageResponder): string[] {
		console.log("Called spy sync");
		this.spyOnGetCharactersSync(req, res);
		return ["Mario", "Luigi", "Peach"];
	}

	/**
	 * Mock route with no result.
	 * @param req The request.
	 * @param res The responder.
	 */
	@route("/save")
	public save(req: MessageRequest, res: MessageResponder): void {
		this.spyOnSave(req, res);
	}
}

/**
 * Mock type used as part of a request's body.
 */
type Filter = {
	game: string;
};
