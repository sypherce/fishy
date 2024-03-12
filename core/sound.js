'use strict';

/**
 * Plays the specified music file.
 * @param {string} filename - The path to the music file.
 * @returns {Howl} - The Howl instance representing the playing music.
 */
function playMusic(filename) {
	const music = new Howl({
		src: filename,
		loop: true,
	});
	music.play();
	return music;
}
/**
 * Plays a sound file.
 * @param {string} filename - The path or URL of the sound file to be played.
 * @returns {Howl} - The Howl instance representing the playing sound.
 */
function playSound(filename) {
	const sound = new Howl({
		src: filename,
	});
	sound.play();
	return sound;
}

export { playMusic, playSound };
