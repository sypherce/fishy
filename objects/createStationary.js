'use strict';
import createObject from './object.js';

/**Creates a stationary object with the specified properties.
 * @param {string} img - The image of the stationary object.
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @returns {ImageObject} - The created object.
 */
class createStationary extends createObject {
	constructor(img, x, y) {
		super('stationary', img, x, y);
		this.animationIndex = this.quality / 100 - 1;
	}

	update(delta) {}
}

export default createStationary;
