// Environment Module Index - Export all environment-related modules

export * from './road-generator.js';
export * from './environment-generator.js';
export * from './obstacle-manager.js';
export * from './truckstop-manager.js';

/**
 * Initialize the environment
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {string} difficulty - Game difficulty
 * @returns {Object} - Environment components
 */
export function initEnvironment(scene, difficulty = 'normal') {
  // Initialize road
  const road = initRoadGenerator(scene);
  
  // Initialize environment generator
  const environment = initEnvironmentGenerator(scene);
  
  // Initialize obstacle manager
  const obstacles = initObstacleManager(difficulty);
  
  // Initialize truckstop manager
  const truckstops = initTruckstopManager(difficulty);
  
  console.log("Environment initialized");
  
  return {
    road,
    environment,
    obstacles,
    truckstops
  };
}

/**
 * Update the environment
 * @param {Object} environment - Environment components
 * @param {THREE.Vector3} playerPosition - Player position
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {number} playerSpeed - Current player speed
 */
export function updateEnvironment(environment, playerPosition, scene, playerSpeed) {
  if (!environment) return;
  
  // Update road
  if (environment.road) {
    environment.road.update(playerPosition, scene);
  }
  
  // Update environment objects
  if (environment.environment) {
    environment.environment.update(playerPosition, scene);
  }
  
  // Update obstacles
  if (environment.obstacles) {
    environment.obstacles.update(playerPosition, scene, playerSpeed);
  }
  
  // Update truckstops
  if (environment.truckstops) {
    environment.truckstops.update(playerPosition, scene);
  }
}

/**
 * Reset the environment
 * @param {Object} environment - Environment components
 * @param {THREE.Scene} scene - The Three.js scene 
 */
export function resetEnvironment(environment, scene) {
  if (!environment) return;
  
  // Reset road
  if (environment.road) {
    resetRoadGenerator(scene);
  }
  
  // Reset environment
  if (environment.environment) {
    resetEnvironmentGenerator(scene);
  }
  
  // Reset obstacles
  if (environment.obstacles) {
    resetObstacleManager(scene);
  }
  
  // Reset truckstops
  if (environment.truckstops) {
    resetTruckstopManager(scene);
  }
} 