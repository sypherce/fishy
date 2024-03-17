'use strict';
import { DATA_PATH, randomNumber } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import { playSound } from '../core/sound.js';
import createObject from './object.js';

/**Creates an enemy object with the specified properties.
 *
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @param {number} width - The width of the object.
 * @param {number} height - The height of the object.
 * @param {string} src - The source URL of the image for the object.
 * @returns {Promise<Object>} - The created object.
 */
const createEnemy = async (x, y) => {
	const defaultFilename = `${DATA_PATH}/images/balrog.gif`;
	const rows = 2;
	const columns = 10;
	const img = {
		default: await loadSpriteSheet(defaultFilename, rows, columns),
	};

	const object = createObject('enemy', img, x, y);
	object.hp = 100;
	object.speed = 3;
	object.attacked = false; //flag for attacked enemy knockback
	object.eat = function (quality) {
		playSound(`${DATA_PATH}/sounds/converted/chomp${randomNumber(2)}.ogg`);
		this.hp += quality;
		if (this.hp > 100) this.hp = 100;
	};
	object.attack = function (weaponQuality, x, y) {
		const SPEED = 50;
		this.hp -= weaponQuality;
		this.attacked = true;
		//move the enemy away from the attack point
		if (Math.abs(x - this.x) < Math.abs(this.x + this.getWidth() - x)) {
			this.targetX = this.x + SPEED;
		} else {
			this.targetX = this.x - SPEED;
		}
		if (Math.abs(y - this.y) < Math.abs(this.y + this.getHeight() - y)) {
			this.targetY = this.y + SPEED;
		} else {
			this.targetY = this.y - SPEED;
		}
		console.log(`enemy.hp: ${this.hp}`);
		playSound(`${DATA_PATH}/sounds/POINTS${randomNumber(4)}.ogg`);
	};
	object.state = function () {
		const state = {
			attacked: this.attacked,
			hungry: this.hp <= 75,
			dead: this.hp <= 0,
			mirrored: this.x <= Math.round(this.targetX),
		};
		return state;
	};
	object.update = function (delta) {
		const state = this.state();
		if (state.dead) {
			this.handleRemoval();
		} else if (state.attacked) {
			if (this.x === this.targetX && this.y === this.targetY) {
				this.attacked = false;
			}
		} else if (state.hungry) {
			const entryFound = this.moveTowardsNearestEntry('fish', 50);
			if (!entryFound) this.moveToRandomLocation();
		} else {
			this.moveToRandomLocation();
		}
		this.moveTowardsTarget(delta);
		this.hp -= 0.01;
	};

	return object;
};

export default createEnemy;
