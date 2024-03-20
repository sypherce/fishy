'use strict';
import createObject from './object.js';

/**Creates a playOnce object with the specified properties.
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @returns {ImageObject} - The created object.
 */
class createPlayOnce extends createObject {
	constructor(img, x, y) {
		super('playOnce', img, x, y);
		this.animationIndex = this.quality / 100 - 1;
		this.drawFPS = 60;
	}

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
