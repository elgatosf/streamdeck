import { action, Coordinates, KeyAction, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { setTimeout } from "timers/promises";

/**
 * A play piece for the lights-out game
 */
@action({ UUID: "com.elgato.lightsout.gamepiece" })
export class GamePiece extends SingletonAction<GamePieceSettings> {
	private states: Map<string, number> = new Map();

	constructor() {
		super();
	}

	override onWillAppear(ev: WillAppearEvent<GamePieceSettings>): Promise<void> | void {
		// Find and store the existing state of any visible action
		if (ev.action.isKey() && ev.payload.state !== undefined) {
			this.states.set(ev.action.id, ev.payload.state);
		}
	}

	/**
	 * A generator which narrows down all visible actions to only ones that are present on a specific Stream Deck device
	 */
	*deviceItems(deviceId: string): IterableIterator<KeyAction<GamePieceSettings>> {
		for (const action of this.actions) {
			if (action.device.id === deviceId && action.isKey() && action.coordinates !== undefined) {
				yield action;
			}
		}
	}

	/**
	 * A generator which can find the (up to) 5 actions which would be affected by a light switch toggle event
	 */
	*adjacentItems(deviceId: string, coordinates: Coordinates): IterableIterator<KeyAction<GamePieceSettings>> {
		// A list of x/y offsets to use as offsets to find candidate actions
		const offsets = [
			[-1, 0],
			[0, 0],
			[1, 0],
			[0, -1],
			[0, 1],
		];
		for (const action of this.deviceItems(deviceId)) {
			const candidate = action.coordinates;
			const pressed = coordinates;
			if (!candidate) {
				continue;
			}
			for (const offset of offsets) {
				const checkColumn = pressed.column + offset[0];
				const checkRow = pressed.row + offset[1];
				if (candidate.column == checkColumn && candidate.row == checkRow) {
					yield action;
				}
			}
		}
	}

	/**
	 * Toggles the internal state for the specified action ID and returns the new state
	 */
	toggleState(actionId: string) {
		let state = this.states.get(actionId);
		state = state ? 0 : 1;
		this.states.set(actionId, state);
		return state;
	}

	/**
	 * Performs a light switch toggle, which toggles the state of the 4 actions that border the pressed action in
	 * each cardinal direction, as well as the action itself
	 */
	override async onKeyDown(ev: KeyDownEvent<GamePieceSettings>): Promise<void> {
		// We can't access action coordinates if the action is a part of a multi-action
		if (ev.payload.isInMultiAction) {
			return;
		}

		for (const action of this.adjacentItems(ev.action.device.id, ev.payload.coordinates)) {
			let newState = this.toggleState(action.id);
			action.setState(newState);
		}

		this.tryWin(ev.action.device.id);
	}

	/**
	 * Sets all tracked actions to the specified state.
	 */
	setAll(deviceId: string, state: LightState) {
		for (const action of this.deviceItems(deviceId)) {
			if (!action.isKey() || action.isInMultiAction()) {
				continue;
			}
			this.states.set(action.id, state);
			action.setState(state);
		}
	}

	/**
	 * Flashes all actions on and off a certain number of times, leaving them all on at the end.
	 *
	 * @param {number} count The number of times to flash the actions on the grid.
	 */
	async flashAll(deviceId: string, count: number): Promise<void> {
		const offset = 100;
		while (count-- > 0) {
			await setTimeout(offset);
			this.setAll(deviceId, LIGHT_OFF);

			await setTimeout(offset);
			this.setAll(deviceId, LIGHT_ON);
		}
		await setTimeout(offset * 2);
	}

	/**
	 * Checks the game state to see if the player has won, and if they have, play the win sequence.
	 */
	async tryWin(deviceId: string) {
		for (const action of this.deviceItems(deviceId)) {
			const state = this.states.get(action.id);
			if (state === LIGHT_ON) {
				return;
			}
		}
		this.displayWin(deviceId);
	}

	/**
	 * Plays the win sequence.
	 */
	async displayWin(deviceId: string) {
		// Grab all of the coordinates of actions and randomize them
		let keys: KeyAction<GamePieceSettings>[] = [];
		for (const action of this.deviceItems(deviceId)) {
			if (action.isKey()) {
				keys.push(action);
			}
		}
		keys.sort((a, b) => Math.random() - 0.5);

		let flashCount = 0;

		// Flash every key in the playing field
		for (const key of keys) {
			key.setState(LIGHT_ON);
			await setTimeout(50);
			key.setState(LIGHT_OFF);
			await setTimeout(50);

			// Just skip the sequence if it runs too long
			if (flashCount++ > 15) {
				break;
			}
		}

		// Flash and reset the playing field
		await this.flashAll(deviceId, 3);
		this.randomize(deviceId);
	}

	/**
	 * Randomize the board through simulated play.
	 */
	async randomize(deviceId: string) {
		// Get all action coordinates
		let keys: KeyAction<GamePieceSettings>[] = [];
		for (const action of this.deviceItems(deviceId)) {
			if (action.isKey() && action.coordinates !== undefined) {
				keys.push(action);
			}
		}

		// Variables that track light coverage
		const totalLights = keys.length;
		let visibleLights = 0;

		// Visibly turn on all of the lights while we're resetting
		this.setAll(deviceId, LIGHT_ON);

		// Turn all lights off in our internal state tracking. Starting from the "off" state ensures the generated board can be completed
		this.states.forEach((_, actionId, map) => map.set(actionId, LIGHT_OFF));

		// "Play" the game randomly for some number of iterations, while ensuring that at least 1/3 of the lights are on at the end
		const iterations = Math.max(10, Math.random() * 50);

		for (let i = 0; i < iterations || visibleLights / totalLights < 0.33; ++i) {
			// Ensure we do not loop forever
			if (i > 1000) {
				break;
			}

			// Pick random key and toggle it
			const key = keys[Math.floor(Math.random() * keys.length)];
			for (const action of this.adjacentItems(deviceId, key.coordinates!)) {
				this.toggleState(action.id);
			}
		}

		// Update all of the action states
		for (const action of keys) {
			const state = this.states.get(action.id);
			action.setState(state ? 1 : 0);
			// Wait for each light to "turn off" as if someone is walking through and turning them off one by one
			if (state == LIGHT_OFF) {
				await setTimeout(100);
			}
		}
	}
}

export type LightState = 0 | 1;
export const LIGHT_OFF: LightState = 1;
export const LIGHT_ON: LightState = 0;

type GamePieceSettings = {
	light: LightState;
};
