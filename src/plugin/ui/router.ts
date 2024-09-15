import type { PropertyInspectorDidAppear, PropertyInspectorDidDisappear } from "../../api";
import type { JsonValue } from "../../common/json";
import { MessageGateway } from "../../common/messaging";
import { Action } from "../actions/action";
import { connection } from "../connection";
import { PropertyInspector } from "./property-inspector";

let current: PropertyInspector | undefined;
let debounceCount = 0;

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
				context: current.action.id,
				payload
			});

			return true;
		}

		return false;
	},
	(source) => current!.action
);

/**
 * Determines whether the specified event is related to the current tracked property inspector.
 * @param ev The event.
 * @returns `true` when the event is related to the current property inspector.
 */
function isCurrent(ev: PropertyInspectorDidAppear | PropertyInspectorDidDisappear): boolean {
	return current?.action.id === ev.context && current.action.manifestId === ev.action && current.action.device.id === ev.device;
}

/*
 * To overcome event races, the debounce counter keeps track of appear vs disappear events, ensuring we only
 * clear the current ui when an equal number of matching disappear events occur.
 */
connection.on("propertyInspectorDidAppear", (ev) => {
	if (isCurrent(ev)) {
		debounceCount++;
	} else {
		debounceCount = 1;
		current = new PropertyInspector(router, ev);
	}
});

connection.on("propertyInspectorDidDisappear", (ev) => {
	if (isCurrent(ev)) {
		debounceCount--;
		if (debounceCount <= 0) {
			current = undefined;
		}
	}
});

connection.on("sendToPlugin", (ev) => router.process(ev));

export { router };
