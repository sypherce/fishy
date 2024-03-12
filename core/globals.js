'use strict';
const DATA_PATH = './Insaniquarium Deluxe';
const canvas = ((width = 640, height = 480) => {
	const element = document.createElement('canvas');
	element.width = width;
	element.height = height;
	document.body.appendChild(element);

	return element;
})();

const context = ((parentCanvas) => {
	const element = parentCanvas.getContext('2d');

	return element;
})(canvas);

function randomNumber(max) {
	const number = Math.floor(Math.random() * max) + 1;

	return number === 1 ? '' : `${number}`;
}

export { DATA_PATH, canvas, context, randomNumber };
