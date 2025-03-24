// Physics Module
import { GAME_SETTINGS } from '../config/constants.js';

// State variables
let physicsWorld = null;
let gameState = null;
let collisionCallbacks = {
  powerup: [],
  obstacle: [],
  environment: []
};

/**
 * Initialize the physics engine
 * @param {Object} state - Global game state
 */
export function initPhysics(state) {
  gameState = state;
  
  // Initialize CANNON.js world if using it
  if (window.CANNON) {
    physicsWorld = new CANNON.World();
    physicsWorld.gravity.set(0, -9.82, 0);
    physicsWorld.broadphase = new CANNON.NaiveBroadphase();
    physicsWorld.solver.iterations = 10;
  } else {
    console.warn("CANNON.js not loaded, using simplified collision detection");
  }
  
  console.log("Physics system initialized");
}

/**
 * Register a collision callback
 * @param {string} type - The type of collision to listen for ('powerup', 'obstacle', 'environment')
 * @param {Function} callback - Function to call when collision occurs
 */
export function registerCollisionCallback(type, callback) {
  if (collisionCallbacks[type]) {
    collisionCallbacks[type].push(callback);
  } else {
    console.error(`Unknown collision type: ${type}`);
  }
}

/**
 * Update the physics world
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updatePhysics(deltaTime) {
  if (physicsWorld) {
    physicsWorld.step(1/60, deltaTime, 3);
  }
  
  // Check for collisions if not using a physics engine
  if (!physicsWorld && gameState) {
    checkCollisions();
  }
}

/**
 * Add a body to the physics world
 * @param {Object} body - CANNON.js body
 * @param {Object} object - THREE.js object
 * @param {Object} params - Additional parameters
 */
export function addBody(body, object, params = {}) {
  if (!physicsWorld) return;
  
  physicsWorld.addBody(body);
  
  // Store reference to the THREE.js object
  body.userData = { 
    object, 
    type: params.type || 'generic',
    ...params 
  };
}

/**
 * Remove a body from the physics world
 * @param {Object} body - CANNON.js body
 */
export function removeBody(body) {
  if (!physicsWorld) return;
  
  physicsWorld.removeBody(body);
}

/**
 * Check for collisions between the truck and other objects
 * This is a simplified collision detection if not using a physics engine
 */
export function checkCollisions() {
  if (!gameState || !gameState.truck) return;
  
  const truckPosition = gameState.truck.position;
  const truckBoundingBox = getObjectBoundingBox(gameState.truck);
  
  // Check for power-up collisions
  if (gameState.powerups) {
    for (let i = gameState.powerups.length - 1; i >= 0; i--) {
      const powerup = gameState.powerups[i];
      const powerupBoundingBox = getObjectBoundingBox(powerup);
      
      if (boundingBoxesIntersect(truckBoundingBox, powerupBoundingBox)) {
        // Trigger powerup collision callbacks
        for (const callback of collisionCallbacks.powerup) {
          callback(powerup);
        }
        
        // Remove the powerup
        gameState.powerups.splice(i, 1);
        gameState.scene.remove(powerup);
      }
    }
  }
  
  // Check for obstacle collisions (only if not invincible)
  if (!gameState.activePowerups.includes('zaps') && gameState.obstacles) {
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
      const obstacle = gameState.obstacles[i];
      const obstacleBoundingBox = getObjectBoundingBox(obstacle);
      
      if (boundingBoxesIntersect(truckBoundingBox, obstacleBoundingBox)) {
        // Trigger obstacle collision callbacks
        for (const callback of collisionCallbacks.obstacle) {
          callback(obstacle);
        }
        
        // Remove the obstacle
        gameState.obstacles.splice(i, 1);
        gameState.scene.remove(obstacle);
      }
    }
  }
  
  // Optionally check for environment collisions like boundaries
  // (This would depend on the game design)
}

/**
 * Get a simple bounding box for an object
 * @param {Object} object - THREE.js object
 * @returns {Object} Bounding box with min and max vectors
 */
function getObjectBoundingBox(object) {
  if (object.userData && object.userData.boundingBox) {
    return object.userData.boundingBox;
  }
  
  // Create a simple bounding box based on position and an estimated size
  const position = object.position;
  const size = object.userData && object.userData.size ? object.userData.size : { x: 2, y: 2, z: 2 };
  
  return {
    min: {
      x: position.x - size.x / 2,
      y: position.y - size.y / 2,
      z: position.z - size.z / 2
    },
    max: {
      x: position.x + size.x / 2,
      y: position.y + size.y / 2,
      z: position.z + size.z / 2
    }
  };
}

/**
 * Check if two bounding boxes intersect
 * @param {Object} box1 - First bounding box
 * @param {Object} box2 - Second bounding box
 * @returns {boolean} True if boxes intersect
 */
function boundingBoxesIntersect(box1, box2) {
  return (
    box1.min.x <= box2.max.x &&
    box1.max.x >= box2.min.x &&
    box1.min.y <= box2.max.y &&
    box1.max.y >= box2.min.y &&
    box1.min.z <= box2.max.z &&
    box1.max.z >= box2.min.z
  );
}

/**
 * Create a physical body for an object
 * @param {Object} object - THREE.js object
 * @param {string} type - Type of body ('box', 'sphere', etc.)
 * @param {Object} params - Additional parameters
 * @returns {Object} CANNON.js body
 */
export function createBody(object, type = 'box', params = {}) {
  if (!physicsWorld) return null;
  
  let shape;
  const position = object.position;
  const quaternion = object.quaternion;
  const size = params.size || { x: 1, y: 1, z: 1 };
  
  // Create shape based on type
  switch (type) {
    case 'box':
      shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
      break;
    case 'sphere':
      shape = new CANNON.Sphere(size.radius || 1);
      break;
    default:
      console.error(`Unsupported body type: ${type}`);
      return null;
  }
  
  // Create body
  const body = new CANNON.Body({
    mass: params.mass || 0,
    position: new CANNON.Vec3(position.x, position.y, position.z),
    quaternion: new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w),
    shape: shape,
    material: params.material
  });
  
  // Add body to world
  addBody(body, object, params);
  
  return body;
}

// Export physics update function
export { updatePhysics }; 