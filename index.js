'use strict';
import { entryArray, entryIntersects } from './core/entry.js';
import { DATA_PATH, canvas, context } from './core/globals.js';
import { applyAlphaMask, loadImage, loadSpriteSheet } from './core/image.js';
import { playMusic, playSound } from './core/sound.js';
import createEnemy from './objects/createEnemy.js';
import createFish from './objects/createFish.js';
import createFood from './objects/createFood.js';
import createStationary from './objects/createStationary.js';

const init = (() => {
	let currentMoney = 300;
	let weaponQuality = 30;
	let maxFood = 1;
	let foodQuality = 1;
	const buttonPositions = [18, 88, 144, 217, 290, 363, 436];
	const buttonEnabled = [true, true, true, false, false, false, false];

	function randomNumber(max) {
		const number = Math.floor(Math.random() * max) + 1;

		return number === 1 ? '' : `${number}`;
	}
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
				entryArray.push(await createFish(Math.random() * canvas.width, Math.random() * canvas.height));
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
			return;
		}

		// Handle clicked money
		const money = entryIntersects('money', x, y);
		if (money !== -1) {
			const moneyQuality = money.handleRemoval();
			currentMoney += moneyQuality;
			playSound(`${DATA_PATH}/sounds/POINTS${randomNumber(4)}.ogg`);
			return;
		}

		// Handle clicked enemy
		const enemy = entryIntersects('enemy', x, y);
		if (enemy !== -1) {
			enemy.hp -= weaponQuality;
			console.log(`enemy.hp: ${enemy.hp}`);
			return;
		}

		// If nothing else is clicked, create food
		const foodArray = entryArray.filter((entry) => entry.type === 'food');
		if (foodArray.length < maxFood && enoughMoney(FOOD_COST)) {
			currentMoney -= FOOD_COST;
			entryArray.push(await createFood(x, y, foodQuality));
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

	async function addEnemy() {
		const ENEMY_RESWPAN_TIME = 60 * 1000;
		if (entryArray.filter((entry) => entry.type === 'enemy').length === 0) entryArray.push(await createEnemy(1, 10));
		return setTimeout(addEnemy, ENEMY_RESWPAN_TIME);
	}
	let images = [];
	(async () => {
		playMusic(`${DATA_PATH}/music/converted/Insaniq2.mp3`);

		await addEnemy();

		for (let i = 0; i < 10; i++) {
			entryArray.push(await createFish(Math.random() * canvas.width, Math.random() * canvas.height));
		}
		images['background'] = await loadImage(`${DATA_PATH}/images/aquarium2.jpg`);
		images['menuBar'] = await applyAlphaMask(`${DATA_PATH}/images/menubar.gif`);
		images['menuButton'] = await applyAlphaMask(`${DATA_PATH}/images/mbuttonu.gif`);
		images['menuButtonReflection'] = await applyAlphaMask(`${DATA_PATH}/images/_MBREFLECTION.gif`);

		images['buttonSprite0'] = await createStationary(
			{
				default: {
					data: await loadSpriteSheet(`${DATA_PATH}/images/smallswim.gif`, 5, 10),
					rows: 5,
					columns: 10,
				},
			},
			buttonPositions[0] - 13,
			-15
		);
		images['buttonSprite1'] = await createStationary(
			{
				default: {
					data: await loadSpriteSheet(`${DATA_PATH}/images/food.gif`, 5, 10),
					rows: 5,
					columns: 10,
				},
			},
			buttonPositions[1] + 10,
			+10
		);
		images['buttonSprite2'] = await createStationary(
			{
				default: {
					data: await loadSpriteSheet(`${DATA_PATH}/images/food.gif`, 5, 10),
					rows: 5,
					columns: 10,
				},
			},
			buttonPositions[2] + 10,
			+10
		);
	})();

	function updateAllLoop(timestamp) {
		if (typeof images['background'] === 'undefined') {
			setTimeout(updateAllLoop, 1000);
			return;
		}

		//handle hud
		(() => {
			const drawButton = (i) => {
				if (buttonEnabled[i]) {
					context.drawImage(images['menuButton'], buttonPositions[i], 3);
					if (images[`buttonSprite${i}`]) images[`buttonSprite${i}`].draw();
					context.drawImage(images['menuButtonReflection'], buttonPositions[i], 3);
				}

				return buttonEnabled[i];
			};
			context.drawImage(images['background'], 0, 0, canvas.width, canvas.height);
			context.drawImage(images['menuBar'], 0, 0);
			if (drawButton(0)) {
				//draw fish
			}

			if (drawButton(1)) {
				//draw food
			}
			if (drawButton(2)) {
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
			entry.update(timestamp);
			entry.draw(timestamp);
		});

		//draw text
		(() => {
			context.fillStyle = 'yellow';
			context.font = '20px serif';
			context.fillText(`$:${currentMoney}`, 550, 55);
		})();
		window.requestAnimationFrame(updateAllLoop);
	}
	updateAllLoop();
})();