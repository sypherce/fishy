'use strict';
import { entryArray } from '../core/entry.js';
import { DATA_PATH, randomNumber } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import { playSound } from '../core/sound.js';
import createMoney from './createMoney.js';
import createObject from './object.js';

/**Creates a friend object with the specified properties.
 *
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @param {number} width - The width of the object.
 * @param {number} height - The height of the object.
 * @param {string} src - The source URL of the image for the object.
 * @returns {Promise<Object>} - The created object.
 */
const createFriend = async (x, y) => {
	const defaultFilename = `${DATA_PATH}/images/stinky.gif`;
	const rows = 3;
	const columns = 10;
	const img = {
		default: await loadSpriteSheet(defaultFilename, rows, columns),
	};

	const object = createObject('friend', img, x, y);
	object.setAnimationIndex(0);
	object.speed = 2;
	object.eat = function (quality) {
		playSound(`${DATA_PATH}/sounds/POINTS${randomNumber(4)}.ogg`);
		this.addMoney(quality);
	};
	object.state = function () {
		const state = {
			mirrored: this.x <= Math.round(this.targetX),
		};
		return state;
	};
	object.update = function (delta) {
		const state = this.state();
		const entryFound = this.moveTowardsNearestEntry('money', 50, true);
		if (!entryFound) this.moveToRandomLocation(true);
		this.moveTowardsTarget(delta);
	};
	object.getImage = function () {
		return object.image.default;
	};

	return object;
};

export default createFriend;
