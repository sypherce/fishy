'use strict';
import { DATA_PATH } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import createObject from './object.js';

/**Creates a money object with the specified properties.
 *
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @param {number} width - The width of the object.
 * @param {number} height - The height of the object.
 * @param {string} src - The source URL of the image for the object.
 * @returns {Promise<Object>} - The created object.
 */
const createMoney = async (x, y, width, height) => {
	const defaultFilename = `${DATA_PATH}/images/money.gif`;
	const rows = 5;
	const columns = 10;
	const img = {
		default: {
			data: await loadSpriteSheet(defaultFilename, rows, columns),
			rows: rows,
			columns: columns,
		},
	};
	if (typeof width === 'undefined' || typeof height === 'undefined') {
		width = img.default.data[0].width;
		height = img.default.data[0].height;
	}
	const object = createObject('money', img, x, y, width, height);
	object.drawCounter = columns * (object.quality / 100 - 1);

	return object;
};

export default createMoney;
