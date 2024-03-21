'use strict';
const DATA_PATH = './Insaniquarium Deluxe';

/**The canvas element used for rendering graphics.
 * @type {HTMLCanvasElement}
 */
const canvas = ((width = 640, height = 480) => {
	const element = document.createElement('canvas');
	element.width = width;
	element.height = height;
	document.body.appendChild(element);

	return element;
})();

/**The 2D rendering context of the parent canvas.
 * @type {CanvasRenderingContext2D}
 */
const context = ((parentCanvas) => {
	const element = parentCanvas.getContext('2d');

	return element;
})(canvas);

/**Generates a random number between 1 and the specified maximum value.
 *
 * @param {number} max - The maximum value for the random number.
 * @returns {string} - The generated random number as a string, or an empty string if the number is 1.
 */
function randomNumber(max) {
	const number = Math.floor(Math.random() * max) + 1;

	return number === 1 ? '' : `${number}`;
}

export { DATA_PATH, canvas, context, randomNumber };
