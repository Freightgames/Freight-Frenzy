// Game Module Index - Export all game-related modules

export * from './interactions.js';

/**
 * Initialize the game modules
 * @param {Object} state - Game state reference
 * @param {Object} environment - Environment components
 * @param {THREE.Scene} scene - Three.js scene reference
 * @param {Object} audio - Audio manager reference
 * @returns {Object} - Game modules interface
 */
export function initGameModules(state, environment, scene, audio) {
  // Initialize interactions
  const interactions = initInteractions(state, environment, scene, audio);
  
  console.log("Game modules initialized");
  
  return {
    interactions
  };
}

/**
 * Update game modules
 * @param {Object} modules - Game modules
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateGameModules(modules, deltaTime) {
  if (!modules) return;
  
  // Update interactions
  if (modules.interactions) {
    modules.interactions.update(deltaTime);
  }
}

/**
 * Reset game modules
 * @param {Object} modules - Game modules
 */
export function resetGameModules(modules) {
  if (!modules) return;
  
  // Reset interactions
  if (modules.interactions) {
    resetInteractions();
  }
} 