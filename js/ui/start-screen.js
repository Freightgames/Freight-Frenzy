// Start Screen UI Module
import { VEHICLE_PROPERTIES, TRAILER_PROPERTIES } from '../config/constants.js';

// State tracking
let selectedTruck = null;
let selectedTrailer = null;
let selectedDifficulty = 'medium';
let gameStartHandler = null;

/**
 * Initialize the start screen
 * @param {Function} onGameStart - Callback when game starts
 */
export function initStartScreen(onGameStart) {
  gameStartHandler = onGameStart;
  
  // Set up event listeners
  setupTruckSelection();
  setupTrailerSelection();
  setupDifficultySelection();
  setupStartButton();
  
  // Default selections
  selectTruck('flipFlopSpecial');
  selectTrailer('dryVan');
  setDifficulty('medium');
  
  // Show the start screen
  document.getElementById('start-screen').style.display = 'block';
  
  console.log("Start screen initialized");
}

/**
 * Set up truck selection functionality
 */
function setupTruckSelection() {
  const truckOptions = document.querySelectorAll('#truck-selection .option');
  
  truckOptions.forEach(option => {
    option.addEventListener('click', () => {
      const truckType = option.getAttribute('data-truck-type');
      if (truckType) {
        selectTruck(truckType);
      }
    });
  });
}

/**
 * Select a truck type
 * @param {string} truckType - The truck type to select
 */
export function selectTruck(truckType) {
  // Remove selected class from all options
  const truckOptions = document.querySelectorAll('#truck-selection .option');
  truckOptions.forEach(option => option.classList.remove('selected'));
  
  // Add selected class to the chosen option
  const selectedOption = document.querySelector(`#truck-selection .option[data-truck-type="${truckType}"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
  }
  
  selectedTruck = truckType;
  console.log(`Selected truck: ${truckType}`);
}

/**
 * Set up trailer selection functionality
 */
function setupTrailerSelection() {
  const trailerOptions = document.querySelectorAll('#trailer-selection .option');
  
  trailerOptions.forEach(option => {
    option.addEventListener('click', () => {
      const trailerType = option.getAttribute('data-trailer-type');
      if (trailerType) {
        selectTrailer(trailerType);
      }
    });
  });
}

/**
 * Select a trailer type
 * @param {string} trailerType - The trailer type to select
 */
export function selectTrailer(trailerType) {
  // Remove selected class from all options
  const trailerOptions = document.querySelectorAll('#trailer-selection .option');
  trailerOptions.forEach(option => option.classList.remove('selected'));
  
  // Add selected class to the chosen option
  const selectedOption = document.querySelector(`#trailer-selection .option[data-trailer-type="${trailerType}"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
  }
  
  selectedTrailer = trailerType;
  console.log(`Selected trailer: ${trailerType}`);
}

/**
 * Set up difficulty selection
 */
function setupDifficultySelection() {
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  
  difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const difficulty = button.getAttribute('data-difficulty');
      if (difficulty) {
        setDifficulty(difficulty);
      }
    });
  });
}

/**
 * Set the game difficulty
 * @param {string} difficulty - The difficulty level ('easy', 'medium', 'hard')
 */
export function setDifficulty(difficulty) {
  // Remove active class from all buttons
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  difficultyButtons.forEach(button => button.classList.remove('active'));
  
  // Add active class to the chosen button
  const selectedButton = document.querySelector(`.difficulty-btn[data-difficulty="${difficulty}"]`);
  if (selectedButton) {
    selectedButton.classList.add('active');
  }
  
  selectedDifficulty = difficulty;
  console.log(`Selected difficulty: ${difficulty}`);
}

/**
 * Set up the start button
 */
function setupStartButton() {
  const startButton = document.getElementById('start-btn');
  
  if (startButton) {
    startButton.addEventListener('click', startGame);
  } else {
    console.error("Start button not found");
  }
}

/**
 * Handle the start game action
 */
function startGame() {
  const playerNameInput = document.getElementById('player-name');
  const playerName = playerNameInput ? playerNameInput.value.trim() : '';
  
  // Validate player name
  if (!playerName) {
    alert('Please enter your trucker name before starting.');
    return;
  }
  
  // Validate selections
  if (!selectedTruck || !selectedTrailer || !selectedDifficulty) {
    alert('Please make sure you have selected a truck, trailer, and difficulty.');
    return;
  }
  
  // Hide the start screen
  document.getElementById('start-screen').style.display = 'none';
  
  // Get truck and trailer properties
  const truckProperties = VEHICLE_PROPERTIES[selectedTruck] || VEHICLE_PROPERTIES.flipFlopSpecial;
  const trailerProperties = TRAILER_PROPERTIES[selectedTrailer] || TRAILER_PROPERTIES.dryVan;
  
  // Call the game start handler with all the configuration
  if (gameStartHandler) {
    gameStartHandler({
      playerName,
      truckType: selectedTruck,
      trailerType: selectedTrailer,
      difficulty: selectedDifficulty,
      truckProperties,
      trailerProperties
    });
  } else {
    console.error("Game start handler not set");
  }
}

/**
 * Show the start screen
 */
export function showStartScreen() {
  document.getElementById('start-screen').style.display = 'block';
  document.getElementById('game-over').style.display = 'none';
  document.getElementById('ui').style.display = 'none';
  document.getElementById('truckstop-ui').style.display = 'none';
}

/**
 * Hide the start screen
 */
export function hideStartScreen() {
  document.getElementById('start-screen').style.display = 'none';
}

// Expose functions needed by HTML
window.selectTruck = selectTruck;
window.selectTrailer = selectTrailer;
window.setDifficulty = setDifficulty; 