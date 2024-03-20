'use strict';
import { DATA_PATH } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import createObject from './object.js';

/**Creates a food object with the specified properties.
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @param {number} [quality=1] - The quality of the food object (default is 1).
 * @returns {Promise<ImageObject>} - The created object.
 */
class createFood extends createObject {
	constructor(x, y, quality = 1) {
		super('food', {}, x, y);
		this.quality = 100 * quality;
		this.animationIndex = this.quality / 100 - 1;
	}

	async init() {
		const defaultFilename = `${DATA_PATH}/images/food.gif`;
		const rows = 5;
		const columns = 10;
		this.imageGroup = {
			default: await loadSpriteSheet(defaultFilename, rows, columns),
		};
		return this;
	}
}

export default createFood;
