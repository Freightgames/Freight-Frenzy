// Game Loop Module
import { GAME_SETTINGS } from '../config/constants.js';

// Game state
let isRunning = false;
let isPaused = false;
let lastTime = 0;
let animationFrameId = null;

// References to other game components
let gameState = null;
let updateCallbacks = [];
let renderCallbacks = [];

/**
 * Initialize the game loop
 * @param {Object} state - The global game state object
 */
export function initGameLoop(state) {
  gameState = state;
  isRunning = false;
  isPaused = false;
  console.log("Game loop initialized");
}

/**
 * Register update callbacks
 * @param {Function} callback - Function to call during update phase
 */
export function registerUpdateCallback(callback) {
  updateCallbacks.push(callback);
}

/**
 * Register render callbacks
 * @param {Function} callback - Function to call during render phase
 */
export function registerRenderCallback(callback) {
  renderCallbacks.push(callback);
}

/**
 * Start the game loop
 */
export function startGameLoop() {
  if (isRunning) return;
  
  isRunning = true;
  isPaused = false;
  lastTime = performance.now();
  
  // Start the animation loop
  animationFrameId = requestAnimationFrame(animate);
  console.log("Game loop started");
}

/**
 * Stop the game loop
 */
export function stopGameLoop() {
  if (!isRunning) return;
  
  isRunning = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  console.log("Game loop stopped");
}

/**
 * Pause the game loop
 */
export function pauseGameLoop() {
  isPaused = true;
  console.log("Game loop paused");
}

/**
 * Resume the game loop
 */
export function resumeGameLoop() {
  isPaused = false;
  lastTime = performance.now();
  console.log("Game loop resumed");
}

/**
 * The main animation loop
 */
function animate(time) {
  if (!isRunning) return;
  
  animationFrameId = requestAnimationFrame(animate);
  
  if (isPaused) return;
  
  // Calculate delta time
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;
  
  // Call update phase
  for (const callback of updateCallbacks) {
    callback(deltaTime, gameState);
  }
  
  // Call render phase
  for (const callback of renderCallbacks) {
    callback(deltaTime, gameState);
  }
}

/**
 * The endless runner game loop
 * This will be registered as an update callback
 * @param {number} deltaTime - Time since last frame in seconds
 * @param {Object} state - Game state object
 */
export function endlessRunnerLoop(deltaTime, state) {
  if (!state.isRunning || state.isPaused) return;
  
  // Update game elements
  updatePlayerVehicle(deltaTime, state);
  updateEnvironment(deltaTime, state);
  checkCollisions(state);
  updateGameState(deltaTime, state);
}

/**
 * Update the player vehicle position and state
 */
function updatePlayerVehicle(deltaTime, state) {
  if (!state.truck) return;
  
  // Move the truck forward
  state.truck.position.z -= state.speed * deltaTime;
  
  // Apply lane changes
  if (state.targetLane !== state.currentLane) {
    const targetX = (state.targetLane - 1) * GAME_SETTINGS.LANE_WIDTH;
    const moveStep = GAME_SETTINGS.LANE_WIDTH * 3 * deltaTime;
    const distanceToTarget = Math.abs(state.truck.position.x - targetX);
    
    if (distanceToTarget < moveStep) {
      state.truck.position.x = targetX;
      state.currentLane = state.targetLane;
    } else {
      const direction = state.truck.position.x > targetX ? -1 : 1;
      state.truck.position.x += direction * moveStep;
    }
  }
  
  // Consume fuel
  if (!state.activePowerups.includes('fuelCan')) {
    let fuelRate = GAME_SETTINGS.FUEL_CONSUMPTION_RATE;
    if (state.upgrades.defDelete) {
      fuelRate *= 0.8; // DEF Delete reduces fuel consumption
    }
    state.fuel = Math.max(0, state.fuel - (fuelRate * deltaTime));
    
    // Game over if out of fuel
    if (state.fuel <= 0) {
      state.isGameOver = true;
    }
  }
}

/**
 * Update the environment elements
 */
function updateEnvironment(deltaTime, state) {
  // Update position of all game elements
  if (state.segments) {
    for (const segment of state.segments) {
      segment.position.z += state.speed * deltaTime;
    }
  }
  
  // Update position of power-ups and obstacles
  if (state.powerups) {
    for (const powerup of state.powerups) {
      powerup.position.z += state.speed * deltaTime;
    }
  }
  
  if (state.obstacles) {
    for (const obstacle of state.obstacles) {
      obstacle.position.z += state.speed * deltaTime;
    }
  }
  
  // Remove objects that are too far behind
  // This would be handled in the respective object managers
  
  // Update distance traveled
  state.distance += state.speed * deltaTime;
  
  // Update money earned
  let moneyRate = GAME_SETTINGS.MONEY_PER_METER * deltaTime * state.speed;
  
  // Apply difficulty multiplier
  moneyRate *= state.difficultySettings.moneyMultiplier;
  
  // Apply power-up multipliers
  if (state.activePowerups.includes('zaps')) {
    moneyRate *= 2;
  }
  
  // Apply upgrades
  if (state.upgrades.bluetooth) {
    moneyRate *= 1.2;
  }
  
  state.money += moneyRate;
}

/**
 * Check for collisions between player and game objects
 */
function checkCollisions(state) {
  // This is a placeholder - would need to call into physics module
  // for actual collision detection
  console.log("Checking collisions - implement in physics module");
}

/**
 * Update overall game state
 */
function updateGameState(deltaTime, state) {
  // Update power-up timers
  for (const powerup of state.activePowerupTimers) {
    powerup.timeLeft -= deltaTime * 1000;
    if (powerup.timeLeft <= 0) {
      // Remove expired power-up
      const index = state.activePowerups.indexOf(powerup.type);
      if (index !== -1) {
        state.activePowerups.splice(index, 1);
      }
      
      // Remove from timers
      const timerIndex = state.activePowerupTimers.indexOf(powerup);
      if (timerIndex !== -1) {
        state.activePowerupTimers.splice(timerIndex, 1);
      }
    }
  }
  
  // Update UI
  // This would be done by the UI manager
}

// Export the game loop function that will be registered as an update callback
export { endlessRunnerLoop }; 