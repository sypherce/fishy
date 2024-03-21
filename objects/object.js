'use strict';
import { entryArray, findNearestEntry } from '../core/entry.js';
import { canvas, context } from '../core/globals.js';

const BAR_HEIGHT = 75;
const FLOOR_HEIGHT = 40;
const FPS_60 = 1000.0 / 60.0;

/**Represents an object in the game.
 * @class
 */
class createObject {
	/**Creates a new object.
	 * @constructor
	 * @param {string} type - The type of the object.
	 * @param {string} img - The image of the object.
	 * @param {number} x - The x-coordinate of the object.
	 * @param {number} y - The y-coordinate of the object.
	 */
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

	/**Sets the #isEating flag
	 */
	eat() {
		this.#isEating = true;
	}

	/**Get the width of the object from the current image.
	 * @returns {number} The width of the object.
	 */
	get width() {
		return this.image.data[0].width;
	}

	/**Get the height of the object from the current image.
	 * @returns {number} The height of the object.
	 */
	get height() {
		return this.image.data[0].height;
	}

	/**Updates the object's position based on the given delta time.
	 * If the object goes below the floor, it will be removed.
	 *
	 * @param {number} delta - The time elapsed since the last update.
	 */
	update(delta) {
		//move the object
		this.y += delta / FPS_60;

		//remove the object if it is below the floor
		if (this.y >= canvas.height - FLOOR_HEIGHT) this.handleRemoval();
	}

	/**Get the state of the object.
	 * @returns {Object} The state of the object.
	 */
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
	set state(args) {
		if (args.mirrored !== undefined) this.#isMirrored = args.mirrored;
		if (args.turning !== undefined) this.#isTurning = args.turning;
		if (args.eating !== undefined) this.#isEating = args.eating;
	}

	/**Get the animation index.
	 * @returns {number} The animation index.
	 */
	get animationIndex() {
		return this.#animationIndex;
	}
	/**Set the animation index to the nearest integer and update the current frame accordingly.
	 * @param {number} value - The new animation index value.
	 */
	set animationIndex(value) {
		//Round the value down to the nearest integer
		value = Math.floor(value);
		if (this.#animationIndex !== value) {
			this.#animationIndex = value;
			//Set the current frame to the first frame of the new animation
			this.currentFrame = value * this.image.columns;
		}
	}

	/**Get the image for the object based on its current state.
	 * @returns {Object} The image object.
	 */
	get image() {
		const state = this.state;
		const image = this.imageGroup;
		this.animationIndex = this.quality / 100 - 1;

		return image.default;
	}

	/**Draws the object on the canvas.
	 * @param {number} delta - The time difference between the current and previous frame.
	 */
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

	/**Removes the current object from the entryArray and returns its quality.
	 * @returns {number} The quality of the removed object.
	 */
	handleRemoval() {
		entryArray.splice(entryArray.indexOf(this), 1);
		return this.quality;
	}
	/**Moves the object towards its target position.
	 * @param {number} delta - The time elapsed since the last frame.
	 */
	moveTowardsTarget(delta) {
		if (this.state.turning || this.state.eating) return;

		const deltaSpeed = (delta / FPS_60) * this.speed;
		this.x = Math.abs(this.targetX - this.x) <= deltaSpeed ? this.targetX : this.x + Math.sign(this.targetX - this.x) * deltaSpeed;
		this.y = Math.abs(this.targetY - this.y) <= deltaSpeed ? this.targetY : this.y + Math.sign(this.targetY - this.y) * deltaSpeed;
	}

	/**Sets a random target location for the object.
	 * @param {boolean} horizontalOnly - Indicates whether the target location should be restricted to the horizontal axis only.
	 */
	targetRandomLocation(horizontalOnly) {
		const isWithinSpeedDistance = Math.abs(this.x - this.targetX) <= this.speed && Math.abs(this.y - this.targetY) <= this.speed;
		const isTargetSetToNegativeOne = this.targetX === -1 && this.targetY === -1;
		if (isTargetSetToNegativeOne || isWithinSpeedDistance) {
			const x = Math.random() * (canvas.width - this.width);
			const y = horizontalOnly ? this.y : Math.random() * (canvas.height - BAR_HEIGHT - this.height - FLOOR_HEIGHT) + BAR_HEIGHT;
			this.setTarget(x, y);
		}
	}

	/**Targets the nearest entry of a specified type within a given radius.
	 * @param {string} type - The type of entry to target.
	 * @param {number} radius - The radius within which to search for the nearest entry.
	 * @param {boolean} horizontalOnly - Indicates whether the target location should be restricted to the horizontal axis only.
	 * @returns {boolean} - Returns true if the nearest entry was found and successfully reached and ate it, false otherwise.
	 */
	targetNearestEntry(type, radius, horizontalOnly) {
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

	/**Sets the target coordinates for the object.
	 * @param {number} x - The x-coordinate of the target.
	 * @param {number} y - The y-coordinate of the target.
	 */
	setTarget(x, y) {
		this.targetX = x;
		this.targetY = y;
	}
}

export default createObject;
