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
const createFish = async (x, y) => {
	const defaultFilename = `${DATA_PATH}/images/smallswim.gif`;
	const hungryFilename = `${DATA_PATH}/images/hungryswim.gif`;
	const deadFilename = `${DATA_PATH}/images/smalldie.gif`;
	const rows = 5;
	const columns = 10;
	const img = {
		default: await loadSpriteSheet(defaultFilename, rows, columns),
		hungry: await loadSpriteSheet(hungryFilename, rows, columns),
		dead: await loadSpriteSheet(deadFilename, rows, columns, 'once'),
	};

	const object = createObject('fish', img, x, y);
	object.setAnimationIndex(object.quality / 100 - 1);
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
			hungry: this.hp <= 75 && this.hp > 50,
			starving: this.hp <= 50 && this.hp > 0,
			dead: this.hp <= 0,
			mirrored: this.x <= Math.round(this.targetX),
		};
		return state;
	};
	object.update = function (delta) {
		const fps60 = 1000.0 / 60.0;
		const state = this.state();
		if (state.dead) {
			if (typeof this.alreadyDead === 'undefined') {
				playSound(`${DATA_PATH}/sounds/DIE.ogg`);
				this.alreadyDead = true;
			}
			if (this.y > 400) {
				this.handleRemoval();
			}
			this.y += delta / fps60;
			return;
		} else if (state.hungry || state.starving) {
			const entryFound = this.moveTowardsNearestEntry('food', 50);
			if (!entryFound) this.moveToRandomLocation();
		} else {
			this.moveToRandomLocation();
		}
		this.moveTowardsTarget(delta);
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
		const state = this.state();
		if (state.dead) return object.image.dead;
		if (state.starving) return object.image.hungry;

		return object.image.default;
	};

	return object;
};

export default createFish;
