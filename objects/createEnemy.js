'use strict';
import { DATA_PATH, randomNumber } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import { playSound } from '../core/sound.js';
import createObject from './object.js';

/**Creates an enemy object with the specified properties.
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @returns {Promise<ImageObject>} - The created object.
 */
const createEnemy = async (x, y) => {
	const defaultFilename = `${DATA_PATH}/images/balrog.gif`;
	const rows = 2;
	const columns = 10;
	const img = {
		default: await loadSpriteSheet(defaultFilename, rows, columns),
		turning: await loadSpriteSheet(defaultFilename, rows, columns, 'once'),
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
		playSound(`${DATA_PATH}/sounds/POINTS${randomNumber(4)}.ogg`);
	};
	object.getState = function () {
		const state = {
			attacked: this.attacked,
			hungry: this.hp <= 75 && this.hp > 0,
			dead: this.hp <= 0,
			mirrored: this.isMirrored,
			turning: this.isTurning,
		};
		return state;
	};
	object.update = function (delta) {
		const state = this.getState();
		if (state.dead) {
			this.handleRemoval();
		} else if (state.attacked) {
			if (this.x === this.targetX && this.y === this.targetY) {
				this.attacked = false;
			}
		} else if (state.hungry) {
			const entryFound = this.targetNearestEntry('fish', 50);
			if (!entryFound) this.targetRandomLocation();
		} else {
			this.targetRandomLocation();
		}
		this.moveTowardsTarget(delta);
		this.hp -= 0.01;
	};
	object.getImage = function () {
		const state = this.getState();
		if (state.turning) {
			if (this.animationIndex != 1) this.setAnimationIndex(1);
			return this.image.turning;
		}
		if (this.animationIndex != 0) this.setAnimationIndex(0);

		return object.image.default;
	};

	return object;
};

export default createEnemy;
