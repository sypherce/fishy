'use strict';
import { entryArray, findNearestEntry } from '../core/entry.js';
import { canvas, context } from '../core/globals.js';

const BAR_HEIGHT = 75;
const FLOOR_HEIGHT = 40;
const FPS_60 = 1000.0 / 60.0;

/** Creates an object with specified properties.
 * @param {string} type - The type of the object.
 * @param {object} img - The image object associated with the object.
 * @param {number} x - The x-coordinate of the object.
 * @returns {ImageObject} - The created object.
 */
class createObject {
	constructor(type, img, x, y) {
		this.type = type;
		this.x = x;
		this.y = y;
		this.imageGroup = img;
		this.context = context;
		this.targetX = -1;
		this.targetY = -1;
		this.speed = 0;
		this.currentFrame = 0;
		this.drawFPS = 8;
		this.quality = 100; //0.0-100.0 0 is bad, 100 is good
	}
	#animationIndex = 0;
	#isMirrored = false;
	#isEating = false;
	#isTurning = false;
	#lastState = {
		mirrored: false,
		eating: false,
		turning: false,
	};

	eat() {
		this.#isEating = true;
	}

	get width() {
		return this.image.data[0].width;
	}

	get height() {
		return this.image.data[0].height;
	}

	update(delta) {
		//move the object
		this.y += delta / FPS_60;

		//remove the object if it is below the floor
		if (this.y >= canvas.height - FLOOR_HEIGHT) this.handleRemoval();
	}

	set state(args) {
		if (args.mirrored !== undefined) this.#isMirrored = args.mirrored;
		if (args.turning !== undefined) this.#isTurning = args.turning;
		if (args.eating !== undefined) this.#isEating = args.eating;
	}

	get state() {
		//determine if the object is mirrored
		if (this.targetX < this.x) this.#isMirrored = false;
		else if (this.targetX > this.x) this.#isMirrored = true;
		//else this.#isMirrored = this.#isMirrored;

		//determine if the object is turning
		if (this.#lastState.mirrored !== this.#isMirrored) this.#isTurning = true;

		const state = {
			mirrored: this.#isMirrored,
			turning: this.#isTurning,
			eating: this.#isEating,
		};
		this.#lastState = state;
		return state;
	}

	/**
	 * @param {number} value
	 */
	get animationIndex() {
		return this.#animationIndex;
	}
	set animationIndex(value) {
		if (this.#animationIndex !== value) {
			this.#animationIndex = value;
			this.currentFrame = value * this.image.columns;
		}
	}

	get image() {
		return this.imageGroup.default;
	}

	draw(delta) {
		const image = this.image;
		const state = this.state;

		const isMirroredNotTurning = state.mirrored && !state.turning;
		const isMirroredAndTurning = state.turning && this.x >= Math.round(this.targetX);
		if (isMirroredNotTurning || isMirroredAndTurning) {
			context.save();
			context.scale(-1, 1);
			context.drawImage(image.data[Math.floor(this.currentFrame)], -this.x - this.width, this.y, this.width, this.height);
			context.restore();
		} else {
			context.drawImage(image.data[Math.floor(this.currentFrame)], this.x, this.y, this.width, this.height);
		}

		//update the current frame
		this.currentFrame = (() => {
			const BASE_FRAME = this.animationIndex * image.columns;
			const LAST_FRAME = BASE_FRAME + image.columns - 1;

			this.currentFrame += (delta / 1000) * this.drawFPS;

			if (this.currentFrame >= LAST_FRAME) {
				if (image.type == 'once') {
					this.state = { turning: false, eating: false };
					return LAST_FRAME;
				}

				return BASE_FRAME;
			}
			return this.currentFrame;
		})();
	}

	handleRemoval() {
		entryArray.splice(entryArray.indexOf(this), 1);
		return this.quality;
	}
	//move the object towards the target
	moveTowardsTarget(delta) {
		if (this.state.turning || this.state.eating) return;

		const deltaSpeed = (delta / FPS_60) * this.speed;
		this.x = Math.abs(this.targetX - this.x) <= deltaSpeed ? this.targetX : this.x + Math.sign(this.targetX - this.x) * deltaSpeed;
		this.y = Math.abs(this.targetY - this.y) <= deltaSpeed ? this.targetY : this.y + Math.sign(this.targetY - this.y) * deltaSpeed;
	}

	targetRandomLocation(horizontalOnly) {
		const isWithinSpeedDistance = Math.abs(this.x - this.targetX) <= this.speed && Math.abs(this.y - this.targetY) <= this.speed;
		const isTargetSetToNegativeOne = this.targetX === -1 && this.targetY === -1;
		if (isTargetSetToNegativeOne || isWithinSpeedDistance) {
			const x = Math.random() * (canvas.width - this.width);
			const y = horizontalOnly ? this.y : Math.random() * (canvas.height - BAR_HEIGHT - this.height - FLOOR_HEIGHT) + BAR_HEIGHT;
			this.setTarget(x, y);
		}
	}

	targetNearestEntry(type, radius, horizontalOnly = false) {
		const nearest = findNearestEntry(type, this.x, this.y);

		//if there is a Nearest entry; move towards it
		if (nearest.entry) {
			this.setTarget(nearest.entry.x, horizontalOnly ? this.y : nearest.entry.y);

			//if close enough to the entry
			if (nearest.distance < radius) {
				const quality = nearest.entry.handleRemoval();
				this.eat(quality);
				return true;
			}
		}
		return false;
	}

	setTarget(x, y) {
		this.targetX = x;
		this.targetY = y;
	}
}

export default createObject;
