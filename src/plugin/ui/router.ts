import type { JsonValue } from "../../common/json";
import { MessageGateway } from "../../common/messaging";
import { Action } from "../actions/action";
import { connection } from "../connection";
import { PropertyInspector } from "./property-inspector";

let current: PropertyInspector | undefined;

/**
 * Gets the current property inspector.
 * @returns The property inspector; otherwise `undefined`.
 */
export function getCurrentUI(): PropertyInspector | undefined {
	return current;
}

/**
 * Router responsible for communicating with the property inspector.
 */
const router = new MessageGateway<Action>(
	async (payload: JsonValue) => {
		const current = getCurrentUI();
		if (current) {
			await connection.send({
				event: "sendToPropertyInspector",
				context: current.id,
				payload
			});

			return true;
		}

		return false;
	},
	(source) => new Action(source)
);

connection.on("propertyInspectorDidAppear", (ev) => (current = new PropertyInspector(router, ev)));
connection.on("propertyInspectorDidDisappear", () => (current = undefined));
connection.on("sendToPlugin", (ev) => router.process(ev));

export { router };
