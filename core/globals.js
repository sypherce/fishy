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

export { DATA_PATH, canvas, context };
