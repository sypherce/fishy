'use strict';
import { DATA_PATH } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import createObject from './object.js';

/**Creates a stationary object with the specified properties.
 *
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @param {number} width - The width of the object.
 * @param {number} height - The height of the object.
 * @param {string} src - The source URL of the image for the object.
 * @returns {Promise<Object>} - The created object.
 */
const createStationary = async (img, x, y) => {
	const width = img.default.data[0].width;
	const height = img.default.data[0].height;
	const object = createObject('stationary', img, x, y, width, height);
	object.animationIndex = object.quality / 100 - 1;
	object.state = function () {
		const state = {
			mirrored: this.x <= Math.round(this.targetX),
		};
		return state;
	};
	object.update = function (delta) {};
	object.getImage = function () {
		return object.image.default;
	};

	return object;
};

export default createStationary;
