'use strict';
import { entryArray, entryIntersects } from './core/entry.js';
import { DATA_PATH, canvas, context, randomNumber } from './core/globals.js';
import { applyAlphaMask, loadImage, loadSpriteSheet } from './core/image.js';
import { playMusic, playSound, getMusicVolume, setMusicVolume, setSoundVolume } from './core/sound.js';
import createEnemy from './objects/createEnemy.js';
import createFish from './objects/createFish.js';
import createFood from './objects/createFood.js';
import createFriend from './objects/createFriend.js';
import createPlayOnce from './objects/createPlayOnce.js';
import createStationary from './objects/createStationary.js';

const init = (async () => {
	let currentMoney = 300;
	let weaponQuality = 30;
	let maxFood = 1;
	let foodQuality = 1;
	const buttonPositions = [18, 88, 144, 217, 290, 363, 436];
	const buttonEnabled = [true, true, true, false, false, false, false];

	async function handleClick(event) {
		const FOOD_COST = 25;

		// Get the adjusted mouse coordinates
		const x = event.clientX - canvas.offsetLeft;
		const y = event.clientY - canvas.offsetTop;

		const enoughMoney = (cost) => {
			const enough = currentMoney >= cost;
			if (!enough) playSound(`${DATA_PATH}/sounds/BUZZER.ogg`);
			return enough;
		};
		// Handle clicked menu
		if (y >= 4 && y <= 63) {
			const FISH_COST = 100;
			const FOOD_QUALITY_COST = 100;
			const MAX_FOOD_COST = 200;
			const buttonClicked = (i) => buttonEnabled[i] && x >= buttonPositions[i] && x <= buttonPositions[i] + 73;

			if (buttonClicked(0) && enoughMoney(FISH_COST)) {
				currentMoney -= FISH_COST;
				entryArray.push(await new createFish(Math.random() * canvas.width, Math.random() * canvas.height).init());
				playSound(`${DATA_PATH}/sounds/SPLASH${randomNumber(3)}.ogg`);
			} else if (buttonClicked(1) && enoughMoney(FOOD_QUALITY_COST) && foodQuality < 3) {
				currentMoney -= FOOD_QUALITY_COST;
				foodQuality++;
				playSound(`${DATA_PATH}/sounds/BUY.ogg`);
			} else if (buttonClicked(2) && enoughMoney(MAX_FOOD_COST) && maxFood < 10) {
				currentMoney -= MAX_FOOD_COST;
				maxFood++;
				playSound(`${DATA_PATH}/sounds/BUY.ogg`);
			} else if (buttonClicked(3)) {
				console.log('3 clicked');
			} else if (buttonClicked(4)) {
				console.log('4 clicked');
			} else if (buttonClicked(5)) {
				console.log('5 clicked');
			} else if (buttonClicked(6)) {
				console.log('6 clicked');
			}
			//menu button position
			else if (x >= 526 && x <= 622 && y <= 30) {
				if (getMusicVolume()) setMusicVolume(0.0);
				else setMusicVolume(1.0);
			}
			return;
		}
		const enemyPresent = entryArray.filter((entry) => entry.type === 'enemy').length > 0;
		if (enemyPresent) {
			playSound(`${DATA_PATH}/sounds/converted/zap.ogg`);
			const spriteSheet = await loadSpriteSheet(`${DATA_PATH}/images/lasers.gif`, 6, 10);
			entryArray.push(
				new createPlayOnce(
					{
						default: spriteSheet,
					},
					x - spriteSheet.data[0].width / 2,
					y - spriteSheet.data[0].height / 2
				)
			);
		}

		// Handle clicked enemy
		const enemy = entryIntersects('enemy', x, y);
		if (enemy !== -1) {
			enemy.attack(weaponQuality, x, y);
			return;
		}

		// Handle clicked money
		const money = entryIntersects('money', x, y);
		if (!enemyPresent && money !== -1) {
			const moneyQuality = money.handleRemoval();
			currentMoney += moneyQuality;
			playSound(`${DATA_PATH}/sounds/POINTS${randomNumber(4)}.ogg`);
			return;
		}

		// If nothing else is clicked, create food
		const foodArray = entryArray.filter((entry) => entry.type === 'food');
		if (!enemyPresent && foodArray.length < maxFood && enoughMoney(FOOD_COST)) {
			currentMoney -= FOOD_COST;
			entryArray.push(await new createFood(x, y, foodQuality).init());
			playSound(`${DATA_PATH}/sounds/DROPFOOD.ogg`);
		}
	}
	canvas.addEventListener('click', handleClick);

	async function handleKeyDown(event) {
		if (event.key === '1') {
		} else if (event.key === '2') {
		} else if (event.key === '3') {
		}
	}
	document.addEventListener('keydown', handleKeyDown);

	playMusic(`${DATA_PATH}/music/converted/Insaniq2.mp3`);
	setMusicVolume(0.0);

	async function addEnemy() {
		const ENEMY_RESWPAN_TIME = 60 * 1000;
		if (entryArray.filter((entry) => entry.type === 'enemy').length === 0) {
			playSound(`${DATA_PATH}/sounds/AWOOGA.ogg`);
			setTimeout(async () => {
				entryArray.push(await new createEnemy(1, 10).init());
				setTimeout(() => {
					playSound(`${DATA_PATH}/sounds/ROAR.ogg`);
				}, 500 + Math.random() * 500);
			}, 1000 + Math.random() * 500);
		}
		return setTimeout(addEnemy, ENEMY_RESWPAN_TIME);
	}
	await addEnemy();

	async function addFriend() {
		const stinky = await new createFriend(1, 400).init();
		stinky.addMoney = function (amount) {
			currentMoney += amount;
		};
		entryArray.push(stinky);
	}
	await addFriend();

	// add fish
	for (let i = 0; i < 3; i++) {
		entryArray.push(await new createFish(Math.random() * canvas.width, Math.random() * canvas.height).init());
	}

	//load other images
	let images = {
		background: await loadImage(`${DATA_PATH}/images/aquarium2.jpg`),
		menuBar: await applyAlphaMask(`${DATA_PATH}/images/menubar.gif`),
		menuButton: await applyAlphaMask(`${DATA_PATH}/images/mbuttonu.gif`),
		menuButtonReflection: await applyAlphaMask(`${DATA_PATH}/images/_MBREFLECTION.gif`),

		buttonSprite0: new createStationary(
			{
				default: await loadSpriteSheet(`${DATA_PATH}/images/smallswim.gif`, 5, 10),
			},
			buttonPositions[0] - 13,
			-15
		),
		buttonSprite1: new createStationary(
			{
				default: await loadSpriteSheet(`${DATA_PATH}/images/food.gif`, 5, 10),
			},
			buttonPositions[1] + 10,
			+10
		),
	};

	function updateAllLoop(timestamp) {
		//first run timestamp is NaN
		if (isNaN(timestamp)) {
			console.log(timestamp);
			window.requestAnimationFrame(updateAllLoop);
			return;
		}

		//initialize then timestamp
		updateAllLoop.then ??= timestamp;
		const delta = timestamp - updateAllLoop.then;

		updateAllLoop.then = timestamp;
		if (typeof images['background'] === 'undefined') {
			setTimeout(updateAllLoop, 1000);
			return;
		}

		//handle hud
		(() => {
			const drawButton = (i) => {
				if (buttonEnabled[i]) {
					context.drawImage(images['menuButton'], buttonPositions[i], 3);
					if (images[`buttonSprite${i}`]) images[`buttonSprite${i}`].draw(delta);
					context.drawImage(images['menuButtonReflection'], buttonPositions[i], 3);
				}

				return buttonEnabled[i];
			};
			context.drawImage(images['background'], 0, 0, canvas.width, canvas.height);
			context.drawImage(images['menuBar'], 0, 0);

			if (drawButton(0)) {
				context.fillStyle = 'lime';
				context.font = '8px serif';
				context.fillText(`$100`, buttonPositions[0] + 22, 58);
				//draw fish
			}

			if (drawButton(1)) {
				context.fillStyle = 'lime';
				context.font = '8px serif';
				context.fillText(`$100`, buttonPositions[1] + 22, 58);
				images['buttonSprite1'].quality = 300;
				images['buttonSprite1'].animationIndex = foodQuality - 1;
				//draw food
			}
			if (drawButton(2)) {
				context.fillStyle = 'lime';
				context.font = '8px serif';
				context.fillText(`$200`, buttonPositions[2] + 22, 58);

				context.fillStyle = 'lime';
				context.font = 'Bold 24px serif';
				context.fillText(maxFood, buttonPositions[2] + 22, 32);
				//draw counter
			}

			if (drawButton(3)) {
				//draw
			}

			if (drawButton(4)) {
				//draw
			}

			if (drawButton(5)) {
				//draw
			}

			if (drawButton(6)) {
				//draw
			}
		})();

		entryArray.forEach((entry) => {
			entry.update(delta);
			entry.draw(delta);
		});

		//draw text
		(() => {
			context.fillStyle = 'yellow';
			context.font = '20px serif';
			context.fillText(`$${currentMoney}`, 550, 55);
		})();
		window.requestAnimationFrame(updateAllLoop);
	}
	updateAllLoop();
})();
