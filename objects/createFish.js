'use strict';
import { entryArray } from '../core/entry.js';
import { DATA_PATH, randomNumber } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import { playSound } from '../core/sound.js';
import createMoney from './createMoney.js';
import createObject from './object.js';

/**Creates a fish object with the specified properties.
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @returns {Promise<ImageObject>} - The created object.
 */
class createFish extends createObject {
	constructor(x, y) {
		super('fish', {}, x, y);
		this.setAnimationIndex(this.quality / 100 - 1);
		this.hp = 100;
		this.moneyGenerationLevel = 0;
		this.speed = 2;
	}

	async init() {
		const IMAGE_PATH = `${DATA_PATH}/images`;
		const rows = 5;
		const columns = 10;
		this.image = {
			default: await loadSpriteSheet(`${IMAGE_PATH}/smallswim.gif`, rows, columns),
			hungry: await loadSpriteSheet(`${IMAGE_PATH}/hungryswim.gif`, rows, columns),
			dead: await loadSpriteSheet(`${IMAGE_PATH}/smalldie.gif`, rows, columns, 'once'),
			turning: await loadSpriteSheet(`${IMAGE_PATH}/smallturn.gif`, rows, columns, 'once'),
		};
		return this;
	}

	eat(quality) {
		playSound(`${DATA_PATH}/sounds/SLURP${randomNumber(3)}.ogg`);
		this.hp += quality;
		if (this.hp > 100) this.hp = 100;
	}

	getState() {
		const state = {
			hungry: this.hp <= 75 && this.hp > 50,
			starving: this.hp <= 50 && this.hp > 0,
			dead: this.hp <= 0,
			mirrored: this.isMirrored,
			turning: this.isTurning,
		};
		return state;
	}

	update(delta) {
		const FPS_60 = 1000.0 / 60.0;
		const state = this.getState();
		if (state.dead) {
			if (typeof this.alreadyDead === 'undefined') {
				playSound(`${DATA_PATH}/sounds/DIE.ogg`);
				this.alreadyDead = true;
			}
			if (this.y > 400) {
				this.handleRemoval();
			}
			this.y += delta / FPS_60;
			return;
		} else if (state.hungry || state.starving) {
			const entryFound = this.targetNearestEntry('food', 50);
			if (!entryFound) this.targetRandomLocation();
		} else {
			this.targetRandomLocation();
		}
		this.moveTowardsTarget(delta);
		this.hp -= 0.1;

		this.moneyGenerationLevel += 0.5;

		(async () => {
			if (this.moneyGenerationLevel >= 100) {
				this.moneyGenerationLevel = 0;
				entryArray.push(await new createMoney(this.x, this.y).init());
			}
		})();
	}

	getImage() {
		const state = this.getState();
		if (state.dead) return this.image.dead;
		if (state.turning) return this.image.turning;
		if (state.starving) return this.image.hungry;

		return this.image.default;
	}
}

export default createFish;
