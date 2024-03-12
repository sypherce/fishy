'use strict';
import { DATA_PATH, randomNumber } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import { playSound } from '../core/sound.js';
import createObject from './object.js';

/**Creates a enemy object with the specified properties.
 *
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @param {number} width - The width of the object.
 * @param {number} height - The height of the object.
 * @param {string} src - The source URL of the image for the object.
 * @returns {Promise<Object>} - The created object.
 */
const createEnemy = async (x, y, width, height) => {
	const defaultFilename = `${DATA_PATH}/images/balrog.gif`;
	const rows = 2;
	const columns = 10;
	const img = {
		default: await loadSpriteSheet(defaultFilename, rows, columns),
	};
	if (typeof width === 'undefined' || typeof height === 'undefined') {
		width = img.default.data[0].width;
		height = img.default.data[0].height;
	}
	const object = createObject('enemy', img, x, y, width, height);
	object.speed = 3;
	object.hp = 100;
	object.eat = function (quality) {
		playSound(`${DATA_PATH}/sounds/converted/chomp${randomNumber(2)}.ogg`);
		this.hp += quality;
		if (this.hp > 100) this.hp = 100;
	};
	object.state = function () {
		const state = {
			hungry: this.hp <= 75,
			dead: this.hp <= 0,
			mirrored: this.x <= Math.round(this.targetX),
		};
		return state;
	};
	object.update = function () {
		if (this.state().dead) {
			this.handleRemoval();
		} else if (this.state().hungry) {
			const entryFound = this.moveTowardsNearestEntry('fish', 50);
			if (!entryFound) this.moveToRandomLocation();
		} else {
			this.moveToRandomLocation();
		}
		this.moveTowardsTarget();
		this.hp -= 0.01;
	};

	return object;
};

export default createEnemy;
