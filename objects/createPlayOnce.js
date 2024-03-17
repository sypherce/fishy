'use strict';
import createObject from './object.js';

/**Creates a playOnce object with the specified properties.
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @returns {ImageObject} - The created object.
 */
const createPlayOnce = (img, x, y) => {
	const object = createObject('playOnce', img, x, y);
	object.setAnimationIndex(object.quality / 100 - 1);
	object.state = function () {
		const state = {
			mirrored: this.x <= Math.round(this.targetX),
		};
		return state;
	};
	object.drawFPS = 60;
	object.savedDraw = object.draw;
	object.draw = function (delta) {
		// Initialize previousFrame on first draw
		object.previousFrame ??= this.currentFrame;

		if (object.previousFrame > this.currentFrame) {
			this.handleRemoval();
			return;
		}
		object.previousFrame = this.currentFrame;
		object.savedDraw(delta);
	};
	object.update = function (delta) {};
	object.getImage = function () {
		return object.image.default;
	};

	return object;
};

export default createPlayOnce;
