// Controls Module
import { GAME_SETTINGS } from '../config/constants.js';

// State variables
let gameState = null;
let keyState = {};
let touchStartX = 0;
let touchMoveThreshold = 50; // Minimum swipe distance
let isMobile = false;

/**
 * Initialize the controls
 * @param {Object} state - Global game state
 */
export function initControls(state) {
  gameState = state;
  
  // Detect if mobile device
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Set up keyboard controls
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  // Set up touch controls for mobile
  if (isMobile) {
    initTouchControls();
  }
  
  console.log("Controls initialized, mobile:", isMobile);
}

/**
 * Handle keydown events
 * @param {Event} event - Keyboard event
 */
function handleKeyDown(event) {
  keyState[event.key] = true;
  
  // Process immediate actions
  switch (event.key) {
    case 'ArrowLeft':
      if (gameState && gameState.isRunning && !gameState.isPaused) {
        moveLeft();
      }
      break;
      
    case 'ArrowRight':
      if (gameState && gameState.isRunning && !gameState.isPaused) {
        moveRight();
      }
      break;
      
    case 'p':
    case 'P':
      if (gameState && gameState.isRunning) {
        togglePause();
      }
      break;
  }
}

/**
 * Handle keyup events
 * @param {Event} event - Keyboard event
 */
function handleKeyUp(event) {
  keyState[event.key] = false;
}

/**
 * Initialize touch controls for mobile
 */
function initTouchControls() {
  // Add touch event listeners to the game container
  const gameContainer = document.getElementById('game');
  
  if (gameContainer) {
    gameContainer.addEventListener('touchstart', handleTouchStart);
    gameContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameContainer.addEventListener('touchend', handleTouchEnd);
    
    // Create mobile control buttons
    createMobileControls();
  } else {
    console.error("Game container not found for touch controls");
  }
}

/**
 * Create mobile control buttons
 */
function createMobileControls() {
  // Create mobile control elements if they don't exist
  if (!document.getElementById('mobile-controls')) {
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'mobile-controls';
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.bottom = '20px';
    controlsContainer.style.left = '0';
    controlsContainer.style.right = '0';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'space-between';
    controlsContainer.style.padding = '0 20px';
    controlsContainer.style.zIndex = '1000';
    
    // Left button
    const leftBtn = document.createElement('button');
    leftBtn.innerText = '←';
    leftBtn.style.width = '80px';
    leftBtn.style.height = '80px';
    leftBtn.style.fontSize = '36px';
    leftBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    leftBtn.style.color = 'white';
    leftBtn.style.border = 'none';
    leftBtn.style.borderRadius = '50%';
    leftBtn.style.outline = 'none';
    leftBtn.addEventListener('touchstart', moveLeft);
    
    // Right button
    const rightBtn = document.createElement('button');
    rightBtn.innerText = '→';
    rightBtn.style.width = '80px';
    rightBtn.style.height = '80px';
    rightBtn.style.fontSize = '36px';
    rightBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    rightBtn.style.color = 'white';
    rightBtn.style.border = 'none';
    rightBtn.style.borderRadius = '50%';
    rightBtn.style.outline = 'none';
    rightBtn.addEventListener('touchstart', moveRight);
    
    // Pause button
    const pauseBtn = document.createElement('button');
    pauseBtn.innerText = '❚❚';
    pauseBtn.style.width = '60px';
    pauseBtn.style.height = '60px';
    pauseBtn.style.fontSize = '24px';
    pauseBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    pauseBtn.style.color = 'white';
    pauseBtn.style.border = 'none';
    pauseBtn.style.borderRadius = '50%';
    pauseBtn.style.outline = 'none';
    pauseBtn.style.position = 'absolute';
    pauseBtn.style.top = '20px';
    pauseBtn.style.right = '20px';
    pauseBtn.addEventListener('touchstart', togglePause);
    
    // Add buttons to the container
    controlsContainer.appendChild(leftBtn);
    controlsContainer.appendChild(rightBtn);
    document.body.appendChild(controlsContainer);
    document.body.appendChild(pauseBtn);
  }
}

/**
 * Handle touch start event
 * @param {Event} event - Touch event
 */
function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
}

/**
 * Handle touch move event
 * @param {Event} event - Touch event
 */
function handleTouchMove(event) {
  // Prevent page scrolling when swiping in game
  if (gameState && gameState.isRunning && !gameState.isPaused) {
    event.preventDefault();
  }
}

/**
 * Handle touch end event
 * @param {Event} event - Touch event
 */
function handleTouchEnd(event) {
  if (!gameState || !gameState.isRunning || gameState.isPaused) return;
  
  const touchEndX = event.changedTouches[0].clientX;
  const diffX = touchEndX - touchStartX;
  
  // Detect swipe direction if above threshold
  if (Math.abs(diffX) > touchMoveThreshold) {
    if (diffX > 0) {
      moveRight();
    } else {
      moveLeft();
    }
  }
}

/**
 * Move the truck left
 */
export function moveLeft() {
  if (!gameState || !gameState.isRunning || gameState.isPaused) return;
  
  // Only move if not in leftmost lane
  if (gameState.currentLane > 0) {
    gameState.targetLane = gameState.currentLane - 1;
  }
}

/**
 * Move the truck right
 */
export function moveRight() {
  if (!gameState || !gameState.isRunning || gameState.isPaused) return;
  
  // Only move if not in rightmost lane
  if (gameState.currentLane < GAME_SETTINGS.NUM_LANES - 1) {
    gameState.targetLane = gameState.currentLane + 1;
  }
}

/**
 * Toggle pause state
 */
export function togglePause() {
  if (!gameState || !gameState.isRunning) return;
  
  gameState.isPaused = !gameState.isPaused;
  
  // Show/hide pause message
  const pauseMessage = document.getElementById('pause-message');
  if (pauseMessage) {
    pauseMessage.style.display = gameState.isPaused ? 'block' : 'none';
  } else if (gameState.isPaused) {
    // Create pause message if it doesn't exist
    const message = document.createElement('div');
    message.id = 'pause-message';
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.background = 'rgba(0, 0, 0, 0.8)';
    message.style.color = 'white';
    message.style.padding = '20px';
    message.style.borderRadius = '10px';
    message.style.zIndex = '1000';
    message.innerText = 'PAUSED - Press P to resume';
    document.body.appendChild(message);
  }
  
  // Additional pause logic would be handled by the game loop
}

/**
 * Check if a key is currently pressed
 * @param {string} key - The key to check
 * @returns {boolean} Whether the key is pressed
 */
export function isKeyPressed(key) {
  return keyState[key] === true;
}

/**
 * Clean up event listeners
 */
export function cleanup() {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  
  const gameContainer = document.getElementById('game');
  if (gameContainer) {
    gameContainer.removeEventListener('touchstart', handleTouchStart);
    gameContainer.removeEventListener('touchmove', handleTouchMove);
    gameContainer.removeEventListener('touchend', handleTouchEnd);
  }
}

// Export control functions
export { initTouchControls }; 