import type { MessageRequest } from "../";
import type { PluginCommand, SendToPropertyInspector } from "../../../api";
import type { JsonObject } from "../../../common/json";
import { MessageGateway, MessageResponder } from "../../../common/messaging";
import { PromiseCompletionSource } from "../../../common/promises";
import { action } from "../../actions";
import { SingletonAction } from "../../actions/singleton-action";
import { actionStore } from "../../actions/store";
import { connection } from "../../connection";
import { route } from "../route";

jest.mock("../../actions/store");
jest.mock("../../connection");
jest.mock("../../logging");
jest.mock("../../manifest");

describe("route", () => {
	let piRouter: MessageGateway<object>;

	describe("current PI has routes", () => {
		const ev = {
			action: "com.elgato.test.key",
			context: "key123"
		};

		beforeEach(() => initialize(ev.context));

		/**
		 * Asserts {@link route} with an asynchronous result.
		 */
		test("async", async () => {
			// Arrange.
			const awaiter = new PromiseCompletionSource();
			const action = new ActionWithRoutes();
			action.spyOnGetCharacters.mockImplementation(() => awaiter.setResult(true));

			// Act.
			const res = await piRouter.fetch("public:/characters", {
				game: "World of Warcraft"
			});

			// Assert.
			await awaiter.promise;
			expect(action.spyOnGetCharacters).toHaveBeenCalledTimes(1);
			expect(action.spyOnGetCharacters).toHaveBeenLastCalledWith<[MessageRequest<Filter>, MessageResponder]>(
				{
					action: actionStore.getActionById(ev.context)!,
					path: "public:/characters",
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
			const action = new ActionWithRoutes();
			action.spyOnGetCharactersSync.mockImplementation(() => awaiter.setResult(true));

			// Act.
			const res = await piRouter.fetch("public:/characters-sync", {
				game: "Mario World"
			});

			// Assert.
			await awaiter.promise;
			expect(action.spyOnGetCharactersSync).toHaveBeenCalledTimes(1);
			expect(action.spyOnGetCharactersSync).toHaveBeenLastCalledWith<[MessageRequest<Filter>, MessageResponder]>(
				{
					action: actionStore.getActionById(ev.context)!,
					path: "public:/characters-sync",
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
			const action = new ActionWithRoutes();
			const res = await piRouter.fetch("public:/save");

			// Assert.
			expect(action.spyOnSave).toHaveBeenCalledTimes(1);
			expect(action.spyOnSave).toHaveBeenLastCalledWith<[MessageRequest<Filter>, MessageResponder]>(
				{
					action: actionStore.getActionById(ev.context)!,
					path: "public:/save",
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
		beforeEach(() => initialize("dial123")); // This resolves a different manifestId to the sample class below

		/**
		 * Asserts {@link route} with an asynchronous result.
		 */
		test("async", async () => {
			// Arrange, act.
			const action = new ActionWithRoutes();
			const res = await piRouter.fetch("public:/characters", {
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
			const action = new ActionWithRoutes();
			const res = await piRouter.fetch("public:/characters-sync", {
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
			const action = new ActionWithRoutes();
			const res = await piRouter.fetch("public:/save");

			// Assert.
			expect(action.spyOnSave).toHaveBeenCalledTimes(0);
			expect(res.status).toBe(501);
			expect(res.ok).toBe(false);
			expect(res.body).toBeUndefined();
		});
	});

	/**
	 * Initializes the "current property inspector" for the specific action type.
	 * @param context Action context (i.e. the action's instance identifier).
	 */
	function initialize(context: string): void {
		const action = actionStore.getActionById(context)!;

		// Set the current property inspector associated with the plugin router.
		connection.emit("propertyInspectorDidAppear", {
			action: action?.manifestId,
			context,
			device: "dev123",
			event: "propertyInspectorDidAppear"
		});

		// Mock a property inspector router.
		piRouter = new MessageGateway<object>(
			(payload) => {
				connection.emit("sendToPlugin", {
					action: action.manifestId,
					context,
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
					action: action.manifestId,
					context,
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
@action({ UUID: "com.elgato.test.key" })
class ActionWithRoutes extends SingletonAction {
	public spyOnGetCharacters = jest.fn();
	public spyOnGetCharactersSync = jest.fn();
	public spyOnSave = jest.fn();

	/**
	 * Mock route with an asynchronous result.
	 * @param req The request.
	 * @param res The responder.
	 * @returns The characters.
	 */
	@route("/characters")
	public getCharacters(req: MessageRequest, res: MessageResponder): Promise<string[]> {
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
