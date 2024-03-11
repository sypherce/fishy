'use strict';

/**Loads an image from the specified filename.
 * @param {string} filename - The path to the image file.
 * @returns {Promise<HTMLImageElement>} A promise that resolves to the loaded image.
 */
async function loadImage(filename) {
	if (typeof loadImage.cache == 'undefined') loadImage.cache = {};
	if (loadImage.cache[filename] !== undefined) return loadImage.cache[filename];

	loadImage.cache[filename] = new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject();
		image.src = filename;
	});

	return loadImage.cache[filename];
}

/**Applies an alpha mask to an image, or returns the original image if it is already an alpha image.
 *
 * @param {string} filename - The filename of the image to apply the alpha mask to.
 * @returns {Promise<HTMLCanvasElement>} A promise that resolves to the canvas element with the applied alpha mask.
 */
async function applyAlphaMask(filename) {
	async function urlExists(url) {
		return (await fetch(url)).status === 200;
	}
	const maskFilename = await (async () => {
		const baseFilename = filename.substring(filename.lastIndexOf('/') + 1, filename.lastIndexOf('.'));
		if (baseFilename.startsWith('_') || baseFilename.endsWith('_')) {
			return filename;
		}

		const filenameA = filename.substring(0, filename.lastIndexOf('.')) + '_.' + filename.substring(filename.lastIndexOf('.') + 1);
		const filenameB = filename.substring(0, filename.lastIndexOf('/')) + '/_' + filename.substring(filename.lastIndexOf('/') + 1);
		if (await urlExists(filenameA)) {
			return filenameA;
		} else if (await urlExists(filenameB)) {
			return filenameB;
		}

		return '';
	})();

	const image = await loadImage(filename);
	if (maskFilename === '') return image;

	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d', { willReadFrequently: true });
	canvas.width = image.width;
	canvas.height = image.height;
	context.drawImage(image, 0, 0);
	const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

	const mask = await loadImage(maskFilename);
	context.drawImage(mask, 0, 0);
	const maskData = context.getImageData(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < imageData.data.length; i += 4) {
		imageData.data[i + 3] = maskData.data[i];
	}

	context.putImageData(imageData, 0, 0);

	return canvas;
}

/**Loads an image and creates an array of sprites based on the specified row and column count.
 * @param {string} filename - The path or URL of the image file.
 * @param {number} rowCount - The number of rows in the sprite sheet.
 * @param {number} colCount - The number of columns in the sprite sheet.
 * @returns {Promise<HTMLCanvasElement[]>} A promise that resolves with an array of canvas elements representing the sprites.
 */
async function loadSpriteSheetByImage(image, rowCount = 1, colCount = 1) {
	const sprites = [];

	const spriteWidth = image.width / colCount;
	const spriteHeight = image.height / rowCount;

	for (let rowI = 0; rowI < rowCount; rowI++) {
		for (let colI = 0; colI < colCount; colI++) {
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			canvas.width = spriteWidth;
			canvas.height = spriteHeight;
			context.drawImage(image, colI * spriteWidth, rowI * spriteHeight, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);
			sprites.push(canvas);
		}
	}

	return sprites;
}

/**Loads an image and creates an array of sprites based on the specified row and column count.
 * @param {string} filename - The path or URL of the image file.
 * @param {number} rowCount - The number of rows in the sprite sheet.
 * @param {number} colCount - The number of columns in the sprite sheet.
 * @returns {Promise<HTMLCanvasElement[]>} A promise that resolves with an array of canvas elements representing the sprites.
 */
async function loadSpriteSheet(filename, rowCount = 1, colCount = 1) {
	if (typeof loadSpriteSheet.cache == 'undefined') loadSpriteSheet.cache = {};
	if (loadSpriteSheet.cache[filename] !== undefined) return loadSpriteSheet.cache[filename];

	const image = await applyAlphaMask(filename);
	loadSpriteSheet.cache[filename] = await loadSpriteSheetByImage(image, rowCount, colCount);
	return loadSpriteSheet.cache[filename];
}
export { applyAlphaMask, loadImage, loadSpriteSheet, loadSpriteSheetByImage };
