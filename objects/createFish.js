'use strict';
import { entryArray } from '../core/entry.js';
import { DATA_PATH, randomNumber } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import { playSound } from '../core/sound.js';
import createMoney from './createMoney.js';
import createObject from './object.js';

/**Creates a fish object with the specified properties.
 *
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @param {number} width - The width of the object.
 * @param {number} height - The height of the object.
 * @param {string} src - The source URL of the image for the object.
 * @returns {Promise<Object>} - The created object.
 */
const createFish = async (x, y, width, height) => {
	const defaultFilename = `${DATA_PATH}/images/smallswim.gif`;
	const hungryFilename = `${DATA_PATH}/images/hungryswim.gif`;
	const rows = 5;
	const columns = 10;
	const img = {
		default: await loadSpriteSheet(defaultFilename, rows, columns),
		hungry: await loadSpriteSheet(hungryFilename, rows, columns),
	};
	if (typeof width === 'undefined' || typeof height === 'undefined') {
		width = img.default.data[0].width;
		height = img.default.data[0].height;
	}
	const object = createObject('fish', img, x, y, width, height);
	object.drawCounter = columns * (object.quality / 100 - 1);
	object.hp = 100;
	object.moneyGenerationLevel = 0;
	object.speed = 2;
	object.eat = function (quality) {
		playSound(`${DATA_PATH}/sounds/SLURP${randomNumber(3)}.ogg`);
		this.hp += quality;
		if (this.hp > 100) this.hp = 100;
	};
	object.state = function () {
		const state = {
			hungry: this.hp <= 75,
			starving: this.hp <= 50,
			dead: this.hp <= 0,
			mirrored: this.x <= Math.round(this.targetX),
		};
		return state;
	};
	object.update = function () {
		if (this.state().dead) {
			playSound(`${DATA_PATH}/sounds/DIE.ogg`);
			this.handleRemoval();
		} else if (this.state().hungry) {
			const entryFound = this.moveTowardsNearestEntry('food', 50);
			if (!entryFound) this.moveToRandomLocation();
		} else {
			this.moveToRandomLocation();
		}
		this.moveTowardsTarget();
		this.hp -= 0.1;

		this.moneyGenerationLevel += 0.5;

		(async () => {
			if (this.moneyGenerationLevel >= 100) {
				this.moneyGenerationLevel = 0;
				entryArray.push(await createMoney(this.x, this.y));
			}
		})();
	};
	object.getImage = function () {
		if (object.state().starving) return object.image.hungry;

		return object.image.default;
	};

	return object;
};

export default createFish;
