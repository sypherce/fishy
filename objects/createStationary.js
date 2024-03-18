'use strict';
import createObject from './object.js';

/**Creates a stationary object with the specified properties.
 * @param {string} img - The image of the stationary object.
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @returns {ImageObject} - The created object.
 */
const createStationary = (img, x, y) => {
	const object = createObject('stationary', img, x, y);
	object.setAnimationIndex(object.quality / 100 - 1);
	object.getState = function () {
		const state = {
			mirrored: this.x <= Math.round(this.targetX),
		};
		return state;
	};
	object.update = function () {};
	object.getImage = function () {
		return object.image.default;
	};

	return object;
};

export default createStationary;
