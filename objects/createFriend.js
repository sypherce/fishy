'use strict';
import { entryArray } from '../core/entry.js';
import { DATA_PATH, randomNumber } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import { playSound } from '../core/sound.js';
import createMoney from './createMoney.js';
import createObject from './object.js';

/**Represents an object with the specified properties.
 * @class
 * @extends createObject
 */
class createFriend extends createObject {
	/**Creates a new object.
	 * @constructor
	 * @param {number} x - The x-coordinate of the object.
	 * @param {number} y - The y-coordinate of the object.
	 */
	constructor(x, y) {
		super('friend', {}, x, y);
		this.speed = 2;
	}

	/**Initializes the object.
	 * @async
	 * @returns {Promise<createFriend>} The initialized object.
	 */
	async init() {
		const defaultFilename = `${DATA_PATH}/images/stinky.gif`;
		const rows = 3;
		const columns = 10;
		this.imageGroup = {
			default: await loadSpriteSheet(defaultFilename, rows, columns),
			turning: await loadSpriteSheet(defaultFilename, rows, columns, 'once'),
		};
		return this;
	}

	eat(quality) {
		playSound(`${DATA_PATH}/sounds/POINTS${randomNumber(4)}.ogg`);
		this.addMoney(quality);
	}

	/**Updates the objects's state and behavior based on the given delta time.
	 * @param {number} delta - The time elapsed since the last update in milliseconds.
	 */
	update(delta) {
		const state = this.state;
		const entryFound = this.targetNearestEntry('money', 50, true);
		if (!entryFound) this.targetRandomLocation(true);
		this.moveTowardsTarget(delta);
	}

	/**Gets the current image object based on its current state.
	 * @returns {Object} The current image object.
	 */
	get image() {
		const state = this.state;
		if (state.turning) {
			this.animationIndex = 1;
			return this.imageGroup.turning;
		}
		this.animationIndex = 0;

		return this.imageGroup.default;
	}
}

export default createFriend;
