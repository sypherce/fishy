'use strict';
import createObject from '../objects/object.js';

const entryArray = [];

/**Finds an entry in the entryArray that intersects with the given coordinates.
 *
 * @param {string} type - The type of entry to search for.
 * @param {number} x - The x-coordinate to check for intersection.
 * @param {number} y - The y-coordinate to check for intersection.
 * @returns {createObject} - The found entry object, or an empty one if no intersection is found.
 */
function entryIntersects(type, x, y) {
	let foundEntry = {};
	const typeArray = entryArray.filter((entry) => entry.type === type);
	typeArray.some((entry) => {
		const xIntersect = entry.x < x && entry.x + entry.width > x;
		const yIntersect = entry.y < y && entry.y + entry.height > y;

		if (xIntersect && yIntersect) {
			foundEntry = entry;
			return true;
		}
	});
	return foundEntry;
}

/**Finds the nearest entry of a given type to the specified coordinates.
 *
 * @param {string} type - The type of entry to search for.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {{ entry: Object, distance: number }} - The nearest entry and its distance from the specified coordinates.
 */
function findNearestEntry(type, x, y) {
	const typeArray = entryArray.filter((entry) => entry.type === type);

	const NearestEntry = typeArray.reduce(
		(nearest, entry) => {
			const distance = Math.sqrt(Math.pow(x - entry.x, 2) + Math.pow(y - entry.y, 2));
			if (distance < nearest.distance) {
				return { entry, distance };
			}
			return nearest;
		},
		{ entry: null, distance: Infinity }
	);
	return NearestEntry;
}

export { entryArray, entryIntersects, findNearestEntry };
