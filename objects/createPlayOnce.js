'use strict';
import createObject from './object.js';

/**Represents an object with the specified properties.
 * @class
 * @extends createObject
 */

class createPlayOnce extends createObject {
	/**Creates a new object.
	 * @constructor
	 * @param {number} x - The x-coordinate of the object.
	 * @param {number} y - The y-coordinate of the object.
	 */
 	constructor(img, x, y) {
		super('playOnce', img, x, y);
		this.drawFPS = 60;
	}


	/**Draws the object on the canvas.
	 * @param {number} delta - The time difference between the current and previous frame.
	 */
	draw(delta) {
		// Initialize previousFrame on first draw
		this.previousFrame ??= this.currentFrame;

		if (this.previousFrame > this.currentFrame) {
			this.handleRemoval();
			return;
		}
		this.previousFrame = this.currentFrame;
		super.draw(delta);
	}

	update(delta) {}
}

export default createPlayOnce;
