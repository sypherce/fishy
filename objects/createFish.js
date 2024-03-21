'use strict';
import { entryArray } from '../core/entry.js';
import { DATA_PATH, randomNumber } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import { playSound } from '../core/sound.js';
import createMoney from './createMoney.js';
import createObject from './object.js';

/**Represents a fish object with the specified properties.
 * @class
 * @extends createObject
 */
class createFish extends createObject {
	/**Creates a new fish object.
	 * @constructor
	 * @param {number} x - The x-coordinate of the fish object.
	 * @param {number} y - The y-coordinate of the fish object.
	 */
	constructor(x, y) {
		super('fish', {}, x, y);
		this.hp = 100;
		this.moneyGenerationLevel = 0;
		this.speed = 2;
	}

	/**Initializes the fish object.
	 * @async
	 * @returns {Promise<createFish>} The initialized fish object.
	 */
	async init() {
		const IMAGE_PATH = `${DATA_PATH}/images`;
		const rows = 5;
		const columns = 10;
		this.imageGroup = {
			default: await loadSpriteSheet(`${IMAGE_PATH}/smallswim.gif`, rows, columns),
			hungry: await loadSpriteSheet(`${IMAGE_PATH}/hungryswim.gif`, rows, columns),
			hungryTurn: await loadSpriteSheet(`${IMAGE_PATH}/hungryturn.gif`, rows, columns, 'once'),
			hungryEat: await loadSpriteSheet(`${IMAGE_PATH}/hungryeat.gif`, rows, columns, 'once'),
			dead: await loadSpriteSheet(`${IMAGE_PATH}/smalldie.gif`, rows, columns, 'once'),
			turning: await loadSpriteSheet(`${IMAGE_PATH}/smallturn.gif`, rows, columns, 'once'),
			eating: await loadSpriteSheet(`${IMAGE_PATH}/smalleat.gif`, rows, columns, 'once'),
		};
		return this;
	}

	/**Increases the fish's health points (hp) by the specified quality.
	 * If the resulting hp exceeds 100, it is capped at 100.
	 * @param {number} quality - The quality of the food consumed.
	 */
	eat(quality) {
		super.eat();
		playSound(`${DATA_PATH}/sounds/SLURP${randomNumber(3)}.ogg`);
		this.hp = Math.min(this.hp + quality, 100);
		//this will need changed when feeding the "king potion"
		this.quality = Math.min(this.quality + quality, 300);
	}

	/**Gets the state of the fish.
	 * @returns {Object} The state of the fish.
	 */
	get state() {
		const state = {
			...super.state,
			hungry: this.hp <= 75 && this.hp > 50,
			starving: this.hp <= 50 && this.hp > 0,
			dead: this.hp <= 0,
		};
		return state;
	}
	set state(args) {
		super.state = args;
	}

	/**Updates the fish's state and behavior based on the given delta time.
	 * @param {number} delta - The time elapsed since the last update in milliseconds.
	 */
	update(delta) {
		const FPS_60 = 1000.0 / 60.0;
		const state = this.state;
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
				entryArray.push(await new createMoney(this.x, this.y, this.quality).init());
			}
		})();
	}

	/**Gets the image object for the fish based on its current state.
	 * @returns {Object} The image object of the fish.
	 */
	get image() {
		const state = this.state;
		const image = this.imageGroup;
		this.animationIndex = this.quality / 100 - 1;
		if (state.dead) return image.dead;
		if (state.eating) return state.starving ? image.hungryEat : image.eating;
		if (state.turning) return state.starving ? image.hungryTurn : image.turning;
		if (state.starving) return image.hungry;

		return image.default;
	}
}

export default createFish;
