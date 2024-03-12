'use strict';
import { DATA_PATH } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import createObject from './object.js';

/**Creates a food object with the specified properties.
 *
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @param {number} width - The width of the object.
 * @param {number} height - The height of the object.
 * @param {string} src - The source URL of the image for the object.
 * @returns {Promise<Object>} - The created object.
 */
const createFood = async (x, y, quality = 1, width, height) => {
	const defaultFilename = `${DATA_PATH}/images/food.gif`;
	const rows = 5;
	const columns = 10;
	const img = {
		default: await loadSpriteSheet(defaultFilename, rows, columns),
	};
	if (typeof width === 'undefined' || typeof height === 'undefined') {
		width = img.default.data[0].width;
		height = img.default.data[0].height;
	}
	const object = createObject('food', img, x, y, width, height);
	object.quality = 100 * quality;
	object.drawCounter = columns * (object.quality / 100 - 1);

	return object;
};

export default createFood;
