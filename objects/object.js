'use strict';
import { entryArray, findNearestEntry } from '../core/entry.js';
import { canvas, context } from '../core/globals.js';

/** Creates an object with specified properties.
 * @param {string} type - The type of the object.
 * @param {number} x - The x-coordinate of the object.
 * @param {number} y - The y-coordinate of the object.
 * @param {number} width - The width of the object.
 * @param {number} height - The height of the object.
 * @param {object} img - The image object associated with the object.
 * @returns {object} - The created object.
 */
const createObject = (type, img, x, y, width, height) => {
	const BAR_HEIGHT = 75;
	const FLOOR_HEIGHT = 40;
	const fps60 = 1000.0 / 60.0;
	const ImageObject = {
		type: type,
		x: x,
		y: y,
		width: width,
		height: height,
		image: img,
		context: context,
		targetX: -1,
		targetY: -1,
		speed: 0,
		currentFrame: 0,
		drawFPS: 8,
		animationIndex: 0,

		quality: 100, //0.0-100.0 0 is bad, 100 is good
		update(delta) {
			//move the object
			this.y += delta / fps60;

			//remove the object if it is below the floor
			if (this.y >= canvas.height - FLOOR_HEIGHT) this.handleRemoval();
		},

		state() {
			const state = {
				mirrored: this.x <= Math.round(this.targetX),
			};
			return state;
		},
		getImage() {
			return this.image.default;
		},
		draw(delta) {
			if (typeof delta === 'undefined' || isNaN(delta)) return;
			const image = this.getImage();
			const BASE_FRAME = this.animationIndex * image.columns;
			if (this.state().mirrored) {
				context.save();
				context.scale(-1, 1);
				context.drawImage(image.data[Math.floor(this.currentFrame)], -this.x - this.width, this.y, this.width, this.height);
				context.restore();
			} else {
				context.drawImage(image.data[Math.floor(this.currentFrame)], this.x, this.y, this.width, this.height);
			}

			this.currentFrame += (delta / 1000) * this.drawFPS;
			if (this.currentFrame >= BASE_FRAME + image.columns) this.currentFrame = BASE_FRAME;
		},

		handleRemoval() {
			entryArray.splice(entryArray.indexOf(this), 1);
			return this.quality;
		},
		//move the object towards the target
		moveTowardsTarget(delta) {
			if (typeof delta === 'undefined' || isNaN(delta)) return;
			const deltaSpeed = (delta / fps60) * this.speed;
			this.x = Math.abs(this.targetX - this.x) <= deltaSpeed ? this.targetX : this.x + Math.sign(this.targetX - this.x) * deltaSpeed;
			this.y = Math.abs(this.targetY - this.y) <= deltaSpeed ? this.targetY : this.y + Math.sign(this.targetY - this.y) * deltaSpeed;
		},
		moveToRandomLocation() {
			const isWithinSpeedDistance = Math.abs(this.x - this.targetX) <= this.speed && Math.abs(this.y - this.targetY) <= this.speed;
			const isTargetSetToNegativeOne = this.targetX === -1 && this.targetY === -1;
			if (isTargetSetToNegativeOne || isWithinSpeedDistance) {
				//set a new target
				this.targetX = Math.random() * (canvas.width - this.width);
				this.targetY = Math.random() * (canvas.height - BAR_HEIGHT - this.height - FLOOR_HEIGHT) + BAR_HEIGHT;
			}
		},
		moveTowardsNearestEntry(type, radius) {
			const nearest = findNearestEntry(type, this.x, this.y);

			//if there is a Nearest entry; move towards it
			if (nearest.entry) {
				this.targetX = nearest.entry.x;
				this.targetY = nearest.entry.y;
				//move towards the entry
				//this.moveTowardsTarget();

				//if close enough to the entry
				if (nearest.distance < radius) {
					const quality = nearest.entry.handleRemoval();
					this.eat(quality);
					return true;
				}
			}
			return false;
		},
	};

	return ImageObject;
};

export default createObject;
