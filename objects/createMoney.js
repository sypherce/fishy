'use strict';
import { DATA_PATH } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import createObject from './object.js';

/**Creates a money object with the specified properties.
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @returns {Promise<ImageObject>} - The created object.
 */
class createMoney extends createObject {
	constructor(x, y) {
		super('money', {}, x, y);
		this.setAnimationIndex(this.quality / 100 - 1);
	}

	async init() {
		const defaultFilename = `${DATA_PATH}/images/money.gif`;
		const rows = 5;
		const columns = 10;
		this.image = {
			default: await loadSpriteSheet(defaultFilename, rows, columns),
		};
		return this;
	}
}

export default createMoney;
