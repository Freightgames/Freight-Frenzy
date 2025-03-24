// Pause Menu UI Module

// State
let isPaused = false;
let gameState = null;
let resumeHandler = null;
let restartHandler = null;
let quitHandler = null;
let musicToggleHandler = null;
let sfxToggleHandler = null;

/**
 * Initialize the pause menu UI
 * @param {Object} state - Game state object
 * @param {Function} onResume - Function to call when resuming the game
 * @param {Function} onRestart - Function to call when restarting the game
 * @param {Function} onQuit - Function to call when quitting the game
 * @param {Function} onMusicToggle - Function to call when toggling music
 * @param {Function} onSfxToggle - Function to call when toggling sound effects
 */
export function initPauseMenu(state, onResume, onRestart, onQuit, onMusicToggle, onSfxToggle) {
  gameState = state;
  resumeHandler = onResume;
  restartHandler = onRestart;
  quitHandler = onQuit;
  musicToggleHandler = onMusicToggle;
  sfxToggleHandler = onSfxToggle;
  
  // Add event listener for escape key
  window.addEventListener('keydown', handleKeydown);
  
  // Set up button event listeners
  setupButtons();
  
  console.log("Pause menu initialized");
}

/**
 * Handle keydown events for pause menu
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeydown(event) {
  if (event.key === 'Escape') {
    togglePause();
  }
}

/**
 * Set up pause menu button event listeners
 */
function setupButtons() {
  // Resume button
  const resumeBtn = document.querySelector('#pause-menu .resume-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', resumeGame);
  }
  
  // Restart button
  const restartBtn = document.querySelector('#pause-menu .restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', restartGame);
  }
  
  // Quit button
  const quitBtn = document.querySelector('#pause-menu .quit-btn');
  if (quitBtn) {
    quitBtn.addEventListener('click', quitGame);
  }
  
  // Music toggle
  const musicToggle = document.querySelector('#pause-menu .music-toggle');
  if (musicToggle) {
    musicToggle.addEventListener('change', toggleMusic);
  }
  
  // SFX toggle
  const sfxToggle = document.querySelector('#pause-menu .sfx-toggle');
  if (sfxToggle) {
    sfxToggle.addEventListener('change', toggleSfx);
  }
}

/**
 * Toggle the pause state
 */
export function togglePause() {
  if (isPaused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

/**
 * Pause the game
 */
function pauseGame() {
  if (isPaused) return;
  
  isPaused = true;
  
  // Show pause menu
  const pauseMenu = document.getElementById('pause-menu');
  if (pauseMenu) {
    pauseMenu.style.display = 'flex';
    
    // Update toggle states
    const musicToggle = document.querySelector('#pause-menu .music-toggle');
    if (musicToggle && gameState) {
      musicToggle.checked = gameState.settings.musicEnabled;
    }
    
    const sfxToggle = document.querySelector('#pause-menu .sfx-toggle');
    if (sfxToggle && gameState) {
      sfxToggle.checked = gameState.settings.sfxEnabled;
    }
  }
  
  // Add blur to game container
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.classList.add('blurred');
  }
  
  console.log("Game paused");
}

/**
 * Resume the game
 */
function resumeGame() {
  if (!isPaused) return;
  
  isPaused = false;
  
  // Hide pause menu
  const pauseMenu = document.getElementById('pause-menu');
  if (pauseMenu) {
    pauseMenu.style.display = 'none';
  }
  
  // Remove blur from game container
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.classList.remove('blurred');
  }
  
  // Call resume handler
  if (resumeHandler) {
    resumeHandler();
  } else {
    console.error("Resume handler not set");
  }
  
  console.log("Game resumed");
}

/**
 * Restart the game
 */
function restartGame() {
  // Hide pause menu
  const pauseMenu = document.getElementById('pause-menu');
  if (pauseMenu) {
    pauseMenu.style.display = 'none';
  }
  
  // Remove blur from game container
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.classList.remove('blurred');
  }
  
  // Call restart handler
  if (restartHandler) {
    restartHandler();
  } else {
    console.error("Restart handler not set");
  }
  
  isPaused = false;
  console.log("Game restarted");
}

/**
 * Quit the game and return to start screen
 */
function quitGame() {
  // Call quit handler
  if (quitHandler) {
    quitHandler();
  } else {
    console.error("Quit handler not set");
  }
  
  isPaused = false;
  console.log("Game quit, returning to start screen");
}

/**
 * Toggle game music
 * @param {Event} event - Change event
 */
function toggleMusic(event) {
  if (!gameState) return;
  
  const isEnabled = event.target.checked;
  gameState.settings.musicEnabled = isEnabled;
  
  // Call music toggle handler
  if (musicToggleHandler) {
    musicToggleHandler(isEnabled);
  } else {
    console.error("Music toggle handler not set");
  }
  
  console.log(`Music ${isEnabled ? 'enabled' : 'disabled'}`);
}

/**
 * Toggle game sound effects
 * @param {Event} event - Change event
 */
function toggleSfx(event) {
  if (!gameState) return;
  
  const isEnabled = event.target.checked;
  gameState.settings.sfxEnabled = isEnabled;
  
  // Call SFX toggle handler
  if (sfxToggleHandler) {
    sfxToggleHandler(isEnabled);
  } else {
    console.error("SFX toggle handler not set");
  }
  
  console.log(`Sound effects ${isEnabled ? 'enabled' : 'disabled'}`);
}

/**
 * Check if the game is currently paused
 * @returns {boolean} - True if the game is paused
 */
export function isGamePaused() {
  return isPaused;
} 