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
const createFood = async (x, y, quality = 1) => {
	const defaultFilename = `${DATA_PATH}/images/food.gif`;
	const rows = 5;
	const columns = 10;
	const img = {
		default: await loadSpriteSheet(defaultFilename, rows, columns),
	};

	const object = createObject('food', img, x, y);
	object.quality = 100 * quality;
	object.setAnimationIndex(object.quality / 100 - 1);

	return object;
};

export default createFood;
