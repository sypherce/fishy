'use strict';
import { DATA_PATH } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import createObject from './object.js';

/**Creates a money object with the specified properties.
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @returns {Promise<ImageObject>} - The created object.
 */
const createMoney = async (x, y) => {
	const defaultFilename = `${DATA_PATH}/images/money.gif`;
	const rows = 5;
	const columns = 10;
	const img = {
		default: await loadSpriteSheet(defaultFilename, rows, columns),
	};

	const object = createObject('money', img, x, y);
	object.setAnimationIndex(object.quality / 100 - 1);

	return object;
};

export default createMoney;
