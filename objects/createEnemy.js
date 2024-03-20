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
class createEnemy extends createObject {
	constructor(x, y) {
		super('enemy', {}, x, y);
		this.hp = 100;
		this.speed = 3;
		this.isAttacked = false;
	}

	async init() {
		const defaultFilename = `${DATA_PATH}/images/balrog.gif`;
		const rows = 2;
		const columns = 10;
		this.image = {
			default: await loadSpriteSheet(defaultFilename, rows, columns),
			turning: await loadSpriteSheet(defaultFilename, rows, columns, 'once'),
		};
		return this;
	}

	eat(quality) {
		playSound(`${DATA_PATH}/sounds/converted/chomp${randomNumber(2)}.ogg`);
		this.hp += quality;
		if (this.hp > 100) this.hp = 100;
	}

	attack(weaponQuality, x, y) {
		const SPEED = 50;
		this.hp -= weaponQuality;
		this.isAttacked = true;
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
	}

	getState() {
		const state = {
			attacked: this.isAttacked,
			hungry: this.hp <= 75 && this.hp > 0,
			dead: this.hp <= 0,
			mirrored: this.isMirrored,
			turning: this.isTurning,
		};
		return state;
	}

	update(delta) {
		const state = this.getState();
		if (state.dead) {
			this.handleRemoval();
		} else if (state.attacked) {
			if (this.x === this.targetX && this.y === this.targetY) {
				this.isAttacked = false;
			}
		} else if (state.hungry) {
			const entryFound = this.targetNearestEntry('fish', 50);
			if (!entryFound) this.targetRandomLocation();
		} else {
			this.targetRandomLocation();
		}
		this.moveTowardsTarget(delta);
		this.hp -= 0.01;
	}

	getImage() {
		const state = this.getState();
		if (state.turning) {
			this.setAnimationIndex(1);
			return this.image.turning;
		}
		this.setAnimationIndex(0);

		return this.image.default;
	}
}

export default createEnemy;
