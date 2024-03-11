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
		drawCounter: 0,
		drawDelay: 0,

		quality: 100, //0.0-100.0 0 is bad, 100 is good

		update() {
			this.x;
			this.y++;
			if (this.y >= canvas.height) this.handleRemoval();
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
		draw() {
			if (typeof this.baseFrame === 'undefined') this.baseFrame = this.drawCounter;
			const image = this.getImage();
			if (this.state().mirrored) {
				context.save();
				context.scale(-1, 1);
				context.drawImage(image.data[this.drawCounter], -this.x - this.width, this.y, this.width, this.height);
				context.restore();
			} else {
				context.drawImage(image.data[this.drawCounter], this.x, this.y, this.width, this.height);
			}

			if (this.drawDelay > 10) {
				this.drawDelay = 0;
				this.drawCounter++;
				if (this.drawCounter >= this.baseFrame + image.columns) this.drawCounter = this.baseFrame;
			} else {
				this.drawDelay++;
			}
		},

		handleRemoval() {
			entryArray.splice(entryArray.indexOf(this), 1);
			return this.quality;
		},
		//move the object towards the target
		moveTowardsTarget() {
			this.x = Math.abs(this.targetX - this.x) <= this.speed ? this.targetX : this.x + Math.sign(this.targetX - this.x) * this.speed;
			this.y = Math.abs(this.targetY - this.y) <= this.speed ? this.targetY : this.y + Math.sign(this.targetY - this.y) * this.speed;
		},
		moveToRandomLocation() {
			const isWithinSpeedDistance = Math.abs(this.x - this.targetX) <= this.speed && Math.abs(this.y - this.targetY) <= this.speed;
			const isTargetSetToNegativeOne = this.targetX === -1 && this.targetY === -1;
			if (isTargetSetToNegativeOne || isWithinSpeedDistance) {
				//set a new target
				this.targetX = Math.random() * (canvas.width - this.width);
				this.targetY = Math.random() * (canvas.height - this.height);
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
