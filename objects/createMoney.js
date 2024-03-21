'use strict';
import { DATA_PATH } from '../core/globals.js';
import { loadSpriteSheet } from '../core/image.js';
import createObject from './object.js';

/**Represents an object with the specified properties.
 * @class
 * @extends createObject
 */
class createMoney extends createObject {
	/**Creates a new object.
	 * @constructor
	 * @param {number} x - The x-coordinate of the object.
	 * @param {number} y - The y-coordinate of the object.
	 * @param {number} [quality=100] - The quality of the object (default is 100).
	 */
	constructor(x, y, quality = 100) {
		super('money', {}, x, y);
		this.quality = quality;
	}

	/**Initializes the object.
	 * @async
	 * @returns {Promise<createMoney>} The initialized object.
	 */
	async init() {
		const defaultFilename = `${DATA_PATH}/images/money.gif`;
		const rows = 6;
		const columns = 10;
		this.imageGroup = {
			default: await loadSpriteSheet(defaultFilename, rows, columns),
		};
		return this;
	}
}

export default createMoney;
