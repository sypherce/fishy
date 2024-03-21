'use strict';

let musicVolume = 1.0;
let soundVolume = 1.0;
let music;
let sounds = [];

/**Plays the specified music file.
 * @param {string} filename - The path to the music file.
 * @returns {Howl} - The Howl instance representing the playing music.
 */
function playMusic(filename) {
	if (music) music.unload();
	music = new Howl({
		src: filename,
		volume: musicVolume,
		loop: true,
	});
	music.play();
	return music;
}

/**Plays a sound file.
 * @param {string} filename - The path or URL of the sound file to be played.
 * @returns {Howl} - The Howl instance representing the playing sound.
 */
function playSound(filename) {
	const sound = new Howl({
		src: filename,
		volume: soundVolume,
	});
	sound.on('end', function () {
		sounds.splice(sounds.indexOf(this), 1);
		this.unload();
	});
	sounds.push(sound);

	sound.play();
	return sound;
}

/**Retrieves the current music volume.
 * @returns {number} The music volume.
 */
function getMusicVolume() {
	return musicVolume;
}

/**Sets the volume of the music.
 * @param {number} volume - The volume level to set.
 */
function setMusicVolume(volume) {
	musicVolume = volume;
	if (music) music.volume(volume);
}

/**Sets the volume of all sounds.
 * @param {number} volume - The volume level to set.
 */
function setSoundVolume(volume) {
	soundVolume = volume;
	sounds.forEach((sound) => {
		sound.volume(volume);
		console.log(`sound ${sound._src} volume`, sound.volume());
	});
}

export { playMusic, playSound, getMusicVolume, setMusicVolume, setSoundVolume };
