'use strict';
import { entryArray, findNearestEntry } from '../core/entry.js';
import { canvas, context } from '../core/globals.js';

/** Creates an object with specified properties.
 * @param {string} type - The type of the object.
 * @param {object} img - The image object associated with the object.
 * @param {number} x - The x-coordinate of the object.
 * @returns {ImageObject} - The created object.
 */
const createObject = (type, img, x, y) => {
	const BAR_HEIGHT = 75;
	const FLOOR_HEIGHT = 40;
	const fps60 = 1000.0 / 60.0;

	const ImageObject = {
		type: type,
		x: x,
		y: y,
		image: img,
		context: context,
		targetX: -1,
		targetY: -1,
		speed: 0,
		currentFrame: 0,
		drawFPS: 8,
		animationIndex: 0,

		quality: 100, //0.0-100.0 0 is bad, 100 is good
		getWidth() {
			return this.getImage().data[0].width;
		},
		getHeight() {
			return this.getImage().data[0].height;
		},
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
		setAnimationIndex(value) {
			if (this.animationIndex !== value) {
				this.animationIndex = value;
				this.currentFrame = value * this.image.default.columns;
			}
		},
		getImage() {
			return this.image.default;
		},
		draw(delta) {
			const image = this.getImage();

			if (this.state().mirrored) {
				context.save();
				context.scale(-1, 1);
				context.drawImage(image.data[Math.floor(this.currentFrame)], -this.x - this.getWidth(), this.y, this.getWidth(), this.getHeight());
				context.restore();
			} else {
				context.drawImage(image.data[Math.floor(this.currentFrame)], this.x, this.y, this.getWidth(), this.getHeight());
			}

			//update the current frame
			this.currentFrame = (() => {
				const BASE_FRAME = this.animationIndex * image.columns;
				const LAST_FRAME = BASE_FRAME + image.columns - 1;

				this.currentFrame += (delta / 1000) * this.drawFPS;

				if (this.currentFrame >= LAST_FRAME) {
					if (image.type == 'once') {
						return LAST_FRAME;
					}

					return BASE_FRAME;
				}
				return this.currentFrame;
			})();
		},

		handleRemoval() {
			entryArray.splice(entryArray.indexOf(this), 1);
			return this.quality;
		},
		//move the object towards the target
		moveTowardsTarget(delta) {
			const deltaSpeed = (delta / fps60) * this.speed;
			this.x = Math.abs(this.targetX - this.x) <= deltaSpeed ? this.targetX : this.x + Math.sign(this.targetX - this.x) * deltaSpeed;
			this.y = Math.abs(this.targetY - this.y) <= deltaSpeed ? this.targetY : this.y + Math.sign(this.targetY - this.y) * deltaSpeed;
		},
		moveToRandomLocation(horizontalOnly) {
			const isWithinSpeedDistance = Math.abs(this.x - this.targetX) <= this.speed && Math.abs(this.y - this.targetY) <= this.speed;
			const isTargetSetToNegativeOne = this.targetX === -1 && this.targetY === -1;
			if (isTargetSetToNegativeOne || isWithinSpeedDistance) {
				//set a new target
				this.targetX = Math.random() * (canvas.width - this.getWidth());
				this.targetY = horizontalOnly ? this.y : Math.random() * (canvas.height - BAR_HEIGHT - this.getHeight() - FLOOR_HEIGHT) + BAR_HEIGHT;
			}
		},
		moveTowardsNearestEntry(type, radius, horizontalOnly = false) {
			const nearest = findNearestEntry(type, this.x, this.y);

			//if there is a Nearest entry; move towards it
			if (nearest.entry) {
				this.targetX = nearest.entry.x;
				this.targetY = horizontalOnly ? this.y : nearest.entry.y;
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
