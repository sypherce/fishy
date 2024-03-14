'use strict';
import { DATA_PATH } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import createObject from './object.js';

/**Creates a playOnce object with the specified properties.
 *
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @param {number} width - The width of the object.
 * @param {number} height - The height of the object.
 * @param {string} src - The source URL of the image for the object.
 * @returns {Promise<Object>} - The created object.
 */
const createPlayOnce = async (img, x, y) => {
	const width = img.default.data[0].width;
	const height = img.default.data[0].height;
	const object = createObject('playOnce', img, x, y, width, height);
	object.drawCounter = object.image.default.columns * (object.quality / 100 - 1);
	object.state = function () {
		const state = {
			mirrored: this.x <= Math.round(this.targetX),
		};
		return state;
	};
	object.savedDraw = object.draw;
	object.drawFPS = 60;
	object.draw = function (delta) {
		if (typeof object.lastDrawCounter == 'undefined') {
			object.lastDrawCounter = this.drawCounter;
		}
		if (object.lastDrawCounter > this.drawCounter) {
			this.handleRemoval();
			return;
		}
		object.lastDrawCounter = this.drawCounter;
		object.savedDraw(delta);
	};
	object.update = function () {};
	object.getImage = function () {
		return object.image.default;
	};

	return object;
};

export default createPlayOnce;
