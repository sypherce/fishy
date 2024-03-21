'use strict';
import createObject from './object.js';

/**Represents an object with the specified properties.
 * @class
 * @extends createObject
 */
class createStationary extends createObject {
	/**Creates a new object.
	 * @constructor
	 * @param {number} x - The x-coordinate of the object.
	 * @param {number} y - The y-coordinate of the object.
	 */
	constructor(img, x, y) {
		super('stationary', img, x, y);
	}

	update(delta) {}
}

export default createStationary;
