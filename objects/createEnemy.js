'use strict';
import { DATA_PATH, randomNumber } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import { playSound } from '../core/sound.js';
import createObject from './object.js';

/**Represents an object with the specified properties.
 * @class
 * @extends createObject
 */
class createEnemy extends createObject {
	/**Creates a new object.
	 * @constructor
	 * @param {number} x - The x-coordinate of the object.
	 * @param {number} y - The y-coordinate of the object.
	 */
	constructor(x, y) {
		super('enemy', {}, x, y);
		this.hp = 100;
		this.isAttacked = false;
		this.speed = 3;
	}

	/**Initializes the object.
	 * @async
	 * @returns {Promise<createEnemy>} The initialized object.
	 */
	async init() {
		const defaultFilename = `${DATA_PATH}/images/balrog.gif`;
		const rows = 2;
		const columns = 10;
		this.imageGroup = {
			default: await loadSpriteSheet(defaultFilename, rows, columns),
			turning: await loadSpriteSheet(defaultFilename, rows, columns, 'once'),
		};
		return this;
	}

	/**Increases the health points (hp) by the specified quality.
	 * If the resulting hp exceeds 100, it is capped at 100.
	 * @param {number} quality - The quality of the object consumed.
	 */
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
		if (Math.abs(x - this.x) < Math.abs(this.x + this.width - x)) {
			this.targetX = this.x + SPEED;
		} else {
			this.targetX = this.x - SPEED;
		}
		if (Math.abs(y - this.y) < Math.abs(this.y + this.height - y)) {
			this.targetY = this.y + SPEED;
		} else {
			this.targetY = this.y - SPEED;
		}
		playSound(`${DATA_PATH}/sounds/POINTS${randomNumber(4)}.ogg`);
	}

	/**Gets the state of the object.
	 * @returns {Object} The state of the object.
	 */
	get state() {
		const state = {
			...super.state,
			attacked: this.isAttacked,
			hungry: this.hp <= 75 && this.hp > 0,
			dead: this.hp <= 0,
		};
		return state;
	}
	set state(args) {
		super.state = args;
	}

	/**Updates the objects's state and behavior based on the given delta time.
	 * @param {number} delta - The time elapsed since the last update in milliseconds.
	 */
	update(delta) {
		const state = this.state;
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

export default createEnemy;
