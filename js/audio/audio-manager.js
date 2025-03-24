// Audio Manager Module
import { AUDIO } from '../config/constants.js';

// Audio state
let musicEnabled = true;
let sfxEnabled = true;
let volume = AUDIO.defaultVolume;
let currentMusic = null;
let audioContext = null;
let soundEffects = {};
let musicTracks = {};

/**
 * Initialize the audio manager
 * @param {boolean} musicOn - Initial music enabled state
 * @param {boolean} sfxOn - Initial sound effects enabled state
 * @param {number} initialVolume - Initial volume (0-1)
 */
export function initAudio(musicOn = true, sfxOn = true, initialVolume = AUDIO.defaultVolume) {
  musicEnabled = musicOn;
  sfxEnabled = sfxOn;
  volume = initialVolume;
  
  // Create audio context on user interaction (needed for browser autoplay policies)
  document.addEventListener('click', initAudioContext, { once: true });
  document.addEventListener('keydown', initAudioContext, { once: true });
  
  // Preload sound effects
  preloadSoundEffects();
  
  // Preload music tracks
  preloadMusicTracks();
  
  console.log("Audio manager initialized");
  
  return {
    musicEnabled,
    sfxEnabled,
    volume
  };
}

/**
 * Initialize the audio context
 */
function initAudioContext() {
  if (audioContext) return;
  
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    
    // Create a gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    
    console.log("Audio context initialized");
  } catch (error) {
    console.error("Error initializing audio context:", error);
  }
}

/**
 * Preload all sound effects
 */
function preloadSoundEffects() {
  Object.entries(AUDIO.soundEffects).forEach(([key, path]) => {
    const audio = new Audio(path);
    audio.load();
    soundEffects[key] = audio;
  });
}

/**
 * Preload all music tracks
 */
function preloadMusicTracks() {
  AUDIO.musicTracks.forEach((path, index) => {
    const audio = new Audio(path);
    audio.loop = true;
    audio.volume = volume;
    audio.load();
    musicTracks[`track${index + 1}`] = audio;
  });
}

/**
 * Play a sound effect
 * @param {string} name - Sound effect name
 * @param {number} volume - Volume override (0-1)
 */
export function playSoundEffect(name, volumeOverride = null) {
  if (!sfxEnabled) return;
  
  const sfx = soundEffects[name];
  if (!sfx) {
    console.warn(`Sound effect '${name}' not found`);
    return;
  }
  
  // Create a clone to allow playing multiple instances simultaneously
  const sfxClone = sfx.cloneNode();
  
  if (volumeOverride !== null) {
    sfxClone.volume = volumeOverride;
  } else {
    sfxClone.volume = volume;
  }
  
  sfxClone.play().catch(err => {
    console.warn(`Error playing sound effect '${name}':`, err);
  });
}

/**
 * Play a music track
 * @param {string} trackKey - Track key (track1, track2, etc.) or 'random'
 */
export function playMusic(trackKey = 'random') {
  if (!musicEnabled) return;
  
  // Stop current music if playing
  stopMusic();
  
  let track;
  
  if (trackKey === 'random') {
    // Select a random track
    const tracks = Object.values(musicTracks);
    const randomIndex = Math.floor(Math.random() * tracks.length);
    track = tracks[randomIndex];
  } else {
    track = musicTracks[trackKey];
  }
  
  if (!track) {
    console.warn(`Music track '${trackKey}' not found`);
    return;
  }
  
  track.volume = volume;
  track.play().catch(err => {
    console.warn(`Error playing music track:`, err);
  });
  
  currentMusic = track;
}

/**
 * Stop the currently playing music
 */
export function stopMusic() {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic = null;
  }
}

/**
 * Set the music enabled state
 * @param {boolean} enabled - Whether music should be enabled
 */
export function setMusicEnabled(enabled) {
  musicEnabled = enabled;
  
  if (!musicEnabled) {
    stopMusic();
  } else if (currentMusic) {
    currentMusic.play().catch(err => {
      console.warn(`Error resuming music:`, err);
    });
  } else {
    playMusic('random');
  }
  
  return musicEnabled;
}

/**
 * Set the sound effects enabled state
 * @param {boolean} enabled - Whether sound effects should be enabled
 */
export function setSfxEnabled(enabled) {
  sfxEnabled = enabled;
  return sfxEnabled;
}

/**
 * Set the master volume
 * @param {number} newVolume - Volume level (0-1)
 */
export function setVolume(newVolume) {
  volume = Math.max(0, Math.min(1, newVolume));
  
  // Update current music volume if playing
  if (currentMusic) {
    currentMusic.volume = volume;
  }
  
  return volume;
}

/**
 * Play engine sound with parameters based on speed
 * @param {number} speed - Current speed (0-100)
 */
export function updateEngineSound(speed) {
  if (!sfxEnabled) return;
  
  const engineSound = soundEffects.engine;
  if (!engineSound) return;
  
  // Adjust playback rate based on speed
  if (engineSound._isPlaying) {
    const minRate = 0.5;
    const maxRate = 1.5;
    const normalizedSpeed = Math.min(1, speed / 80); // Normalize speed to 0-1 range
    const playbackRate = minRate + normalizedSpeed * (maxRate - minRate);
    
    engineSound.playbackRate = playbackRate;
  } else {
    // Start engine sound if not playing
    engineSound.loop = true;
    engineSound.volume = volume * 0.4; // Engine sound at 40% of master volume
    engineSound._isPlaying = true;
    
    engineSound.play().catch(err => {
      console.warn(`Error playing engine sound:`, err);
      engineSound._isPlaying = false;
    });
  }
}

/**
 * Stop engine sound
 */
export function stopEngineSound() {
  const engineSound = soundEffects.engine;
  if (engineSound && engineSound._isPlaying) {
    engineSound.pause();
    engineSound.currentTime = 0;
    engineSound._isPlaying = false;
  }
}

/**
 * Play horn sound
 */
export function playHorn() {
  playSoundEffect('horn', volume * 1.2); // Horn slightly louder than master volume
}

/**
 * Play crash sound
 */
export function playCrash() {
  stopEngineSound(); // Stop engine on crash
  playSoundEffect('crash', volume * 1.5); // Crash sound louder than master volume
}

/**
 * Play powerup sound
 */
export function playPowerup() {
  playSoundEffect('powerup');
}

/**
 * Play fuel low warning sound
 */
export function playFuelLow() {
  playSoundEffect('fuelLow');
}

/**
 * Play truckstop arrival sound
 */
export function playTruckstopSound() {
  playSoundEffect('truckstop');
} 