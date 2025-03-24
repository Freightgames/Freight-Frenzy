// Game Interactions Module
import { initTruckstopUI } from '../ui/truckstop-ui.js';

// Game state references
let gameState = null;
let environment = null;
let scene = null;
let audio = null;

// UI references
let truckstopUI = null;

// State tracking
let lastTruckstopCheck = 0;
let truckstopCheckInterval = 500; // Check every 500ms
let isInteractingWithTruckstop = false;
let nearbyTruckstop = null;

/**
 * Initialize the interactions module
 * @param {Object} state - Game state reference
 * @param {Object} env - Environment components
 * @param {THREE.Scene} sceneRef - Three.js scene reference
 * @param {Object} audioManager - Audio manager reference
 * @returns {Object} - Interactions module interface
 */
export function initInteractions(state, env, sceneRef, audioManager) {
  gameState = state;
  environment = env;
  scene = sceneRef;
  audio = audioManager;
  
  // Initialize truckstop UI
  truckstopUI = initTruckstopUI(gameState, handleTruckstopExit);
  
  console.log("Interactions module initialized");
  
  return {
    update: (deltaTime) => update(deltaTime),
    checkInteractions: () => checkInteractions(),
    showTruckstopPrompt: () => showTruckstopPrompt(),
    hideTruckstopPrompt: () => hideTruckstopPrompt(),
    isInteracting: () => isInteractingWithTruckstop
  };
}

/**
 * Update interactions based on player state and position
 * @param {number} deltaTime - Time since last frame in seconds
 */
function update(deltaTime) {
  if (!gameState || !environment || gameState.isPaused) return;
  
  // Only check for truckstops periodically to improve performance
  lastTruckstopCheck += deltaTime * 1000;
  if (lastTruckstopCheck >= truckstopCheckInterval) {
    checkTruckstopProximity();
    lastTruckstopCheck = 0;
  }
}

/**
 * Check for interactions based on player state
 */
function checkInteractions() {
  if (!gameState || gameState.isPaused) return;
  
  // Check for truckstop interaction when player presses the interaction key
  if (nearbyTruckstop) {
    interactWithTruckstop();
  }
}

/**
 * Check if player is near a truckstop
 */
function checkTruckstopProximity() {
  if (!gameState || !environment || !environment.truckstops) return;
  
  const playerPosition = gameState.player.position;
  
  // Get truckstop proximity from truckstop manager
  const truckstop = environment.truckstops.checkTruckstopProximity(playerPosition);
  
  if (truckstop && !nearbyTruckstop) {
    // Player just entered a truckstop proximity
    nearbyTruckstop = truckstop;
    showTruckstopPrompt();
    
    // Play notification sound
    if (audio && audio.playSound) {
      audio.playSound('truckstopArrival');
    }
  } else if (!truckstop && nearbyTruckstop) {
    // Player just left truckstop proximity
    nearbyTruckstop = null;
    hideTruckstopPrompt();
  }
}

/**
 * Show truckstop interaction prompt
 */
function showTruckstopPrompt() {
  const promptElement = document.getElementById('interaction-prompt');
  if (!promptElement) {
    // Create prompt if it doesn't exist
    const prompt = document.createElement('div');
    prompt.id = 'interaction-prompt';
    prompt.className = 'interaction-prompt';
    prompt.innerHTML = 'Press <span class="key-prompt">E</span> to enter truck stop';
    document.body.appendChild(prompt);
  } else {
    promptElement.style.display = 'block';
    promptElement.classList.add('visible');
  }
}

/**
 * Hide truckstop interaction prompt
 */
function hideTruckstopPrompt() {
  const promptElement = document.getElementById('interaction-prompt');
  if (promptElement) {
    promptElement.classList.remove('visible');
    
    // Hide after animation
    setTimeout(() => {
      promptElement.style.display = 'none';
    }, 300);
  }
}

/**
 * Interact with a truckstop
 */
function interactWithTruckstop() {
  if (isInteractingWithTruckstop) return;
  
  // Hide the prompt
  hideTruckstopPrompt();
  
  // Set interaction state
  isInteractingWithTruckstop = true;
  
  // Slow down and stop the truck
  const originalSpeed = gameState.speed;
  const slowdown = setInterval(() => {
    if (gameState.speed > 0) {
      gameState.speed = Math.max(0, gameState.speed - 5);
    } else {
      clearInterval(slowdown);
      
      // Show the truckstop UI
      showTruckstopUI();
    }
  }, 100);
}

/**
 * Show the truckstop UI
 */
function showTruckstopUI() {
  if (!truckstopUI) return;
  
  // Show UI
  truckstopUI.show();
  
  // Play ambient sound
  if (audio && audio.playMusic) {
    audio.playMusic('truckstopMusic');
  }
}

/**
 * Handle exit from truckstop
 */
function handleTruckstopExit() {
  // Reset interaction state
  isInteractingWithTruckstop = false;
  
  // Return to regular game music
  if (audio && audio.playMusic) {
    audio.playMusic('gameplayMusic');
  }
}

/**
 * Reset the interactions module
 */
export function resetInteractions() {
  // Reset state
  lastTruckstopCheck = 0;
  isInteractingWithTruckstop = false;
  nearbyTruckstop = null;
  
  // Hide any visible UI
  hideTruckstopPrompt();
  if (truckstopUI) {
    truckstopUI.hide();
  }
} 