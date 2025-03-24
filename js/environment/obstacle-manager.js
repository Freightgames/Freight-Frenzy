// Obstacle Manager Module
import * as THREE from 'three';
import { GAME_SETTINGS, OBSTACLES, POWERUPS } from '../config/constants.js';

// Obstacle state
let obstacles = [];
let powerups = [];
let activePowerups = {};
let obstacleCounter = 0;
let lastObstacleZ = 0;
let difficultyMultiplier = 1.0;

/**
 * Initialize the obstacle manager
 * @param {Object} difficulty - Difficulty settings
 * @returns {Object} - Obstacle manager instance
 */
export function initObstacleManager(difficulty = 'normal') {
  // Clear obstacles and powerups
  obstacles = [];
  powerups = [];
  activePowerups = {};
  obstacleCounter = 0;
  lastObstacleZ = 0;
  
  // Set difficulty multiplier
  setDifficulty(difficulty);
  
  console.log("Obstacle manager initialized");
  
  return {
    getObstacles: () => obstacles,
    getPowerups: () => powerups,
    getActivePowerups: () => activePowerups,
    update: (playerPosition, scene, playerSpeed) => 
      updateObstacles(playerPosition, scene, playerSpeed),
    setDifficulty: (difficulty) => setDifficulty(difficulty),
    addObstacle: (scene, position, type) => addObstacle(scene, position, type),
    addPowerup: (scene, position, type) => addPowerup(scene, position, type),
    checkCollisions: (playerPosition, playerSize) => 
      checkCollisions(playerPosition, playerSize),
    activatePowerup: (type) => activatePowerup(type),
    updatePowerupTimers: (deltaTime) => updatePowerupTimers(deltaTime),
    clearAll: (scene) => clearAll(scene)
  };
}

/**
 * Set the difficulty level for obstacle generation
 * @param {string} difficulty - Difficulty level ('easy', 'normal', 'hard')
 */
function setDifficulty(difficulty) {
  switch (difficulty) {
    case 'easy':
      difficultyMultiplier = 0.7;
      break;
    case 'hard':
      difficultyMultiplier = 1.3;
      break;
    case 'normal':
    default:
      difficultyMultiplier = 1.0;
      break;
  }
}

/**
 * Update obstacles based on player position
 * @param {THREE.Vector3} playerPosition - Player position
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {number} playerSpeed - Current player speed
 */
function updateObstacles(playerPosition, scene, playerSpeed) {
  if (!scene) return;
  
  const playerDistanceZ = playerPosition.z;
  const spawnDistance = GAME_SETTINGS.OBSTACLE_SPAWN_DISTANCE;
  const despawnDistance = GAME_SETTINGS.OBSTACLE_DESPAWN_DISTANCE;
  
  // Remove obstacles that are too far behind
  obstacles = obstacles.filter(obstacle => {
    if (obstacle.position.z < playerDistanceZ + despawnDistance) {
      scene.remove(obstacle.mesh);
      return false;
    }
    return true;
  });
  
  // Remove powerups that are too far behind
  powerups = powerups.filter(powerup => {
    if (powerup.position.z < playerDistanceZ + despawnDistance) {
      scene.remove(powerup.mesh);
      return false;
    }
    return true;
  });
  
  // Check if we need to spawn more obstacles
  if (lastObstacleZ < playerDistanceZ + spawnDistance) {
    spawnObstaclesAhead(scene, playerDistanceZ, playerSpeed);
  }
}

/**
 * Spawn obstacles ahead of the player
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {number} playerDistanceZ - Player's z position
 * @param {number} playerSpeed - Current player speed
 */
function spawnObstaclesAhead(scene, playerDistanceZ, playerSpeed) {
  const spawnDistance = GAME_SETTINGS.OBSTACLE_SPAWN_DISTANCE;
  const roadWidth = GAME_SETTINGS.ROAD_WIDTH;
  const laneWidth = GAME_SETTINGS.LANE_WIDTH;
  const numLanes = roadWidth / laneWidth;
  
  // Calculate spawn range
  const startZ = Math.max(lastObstacleZ, playerDistanceZ + 100);
  const endZ = playerDistanceZ + spawnDistance;
  
  // Determine obstacle spacing based on player speed
  const minSpacing = 30 + playerSpeed / 2; // More space at higher speeds
  const maxSpacing = 80 + playerSpeed;
  
  // Spawn obstacles in the range
  let z = startZ;
  while (z < endZ) {
    // Determine if we should spawn an obstacle
    if (Math.random() < 0.3 * difficultyMultiplier) {
      // Choose a random lane
      const lane = Math.floor(Math.random() * numLanes) - Math.floor(numLanes / 2);
      const x = lane * laneWidth;
      
      // Choose obstacle type with weighted probability
      const obstacleType = chooseObstacleType();
      
      // Add the obstacle
      addObstacle(scene, new THREE.Vector3(x, 0, z), obstacleType);
    }
    
    // Determine if we should spawn a powerup
    else if (Math.random() < GAME_SETTINGS.POWERUP_CHANCE) {
      // Choose a random lane
      const lane = Math.floor(Math.random() * numLanes) - Math.floor(numLanes / 2);
      const x = lane * laneWidth;
      
      // Choose powerup type randomly
      const powerupTypes = Object.keys(POWERUPS);
      const powerupType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
      
      // Add the powerup
      addPowerup(scene, new THREE.Vector3(x, 1.5, z), powerupType);
    }
    
    // Increment z position for next obstacle
    const spacing = minSpacing + Math.random() * (maxSpacing - minSpacing);
    z += spacing;
  }
  
  lastObstacleZ = endZ;
}

/**
 * Choose an obstacle type based on probability weights
 * @returns {string} - Obstacle type
 */
function chooseObstacleType() {
  // Calculate total probability
  let totalProbability = 0;
  for (const type in OBSTACLES) {
    totalProbability += OBSTACLES[type].probability;
  }
  
  // Choose based on weighted probability
  let random = Math.random() * totalProbability;
  for (const type in OBSTACLES) {
    random -= OBSTACLES[type].probability;
    if (random <= 0) {
      return type;
    }
  }
  
  // Default fallback
  return 'pothole';
}

/**
 * Add an obstacle to the scene
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Vector3} position - Position for the obstacle
 * @param {string} type - Type of obstacle
 */
function addObstacle(scene, position, type) {
  if (!scene) return;
  
  const obstacleType = OBSTACLES[type] || OBSTACLES.pothole;
  
  // Create obstacle mesh based on type
  let mesh;
  
  switch (type) {
    case 'pothole':
      mesh = createPothole(obstacleType);
      break;
    case 'debris':
      mesh = createDebris(obstacleType);
      break;
    case 'roadwork':
      mesh = createRoadwork(obstacleType);
      break;
    case 'trafficJam':
      mesh = createTrafficJam(obstacleType);
      break;
    case 'brokenTruck':
      mesh = createBrokenTruck(obstacleType);
      break;
    default:
      mesh = createPothole(obstacleType);
  }
  
  // Position the obstacle
  mesh.position.copy(position);
  
  // Add to scene
  scene.add(mesh);
  
  // Create obstacle object
  const obstacle = {
    id: `obstacle-${obstacleCounter++}`,
    type,
    position,
    width: obstacleType.width,
    height: obstacleType.height,
    depth: obstacleType.depth,
    damage: obstacleType.damage,
    blocksLane: obstacleType.blocksLane || false,
    slowsTraffic: obstacleType.slowsTraffic || false,
    mesh
  };
  
  // Add to obstacles array
  obstacles.push(obstacle);
  
  return obstacle;
}

/**
 * Create a pothole obstacle
 * @param {Object} config - Pothole configuration
 * @returns {THREE.Mesh} - Pothole mesh
 */
function createPothole(config) {
  // Create a simple pothole using a cylinder
  const geometry = new THREE.CylinderGeometry(
    config.width / 2, 
    config.width / 2, 
    config.depth,
    16
  );
  
  const material = new THREE.MeshLambertMaterial({
    color: new THREE.Color(config.color)
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2; // Rotate to lie flat on road
  mesh.position.y = -config.depth / 2 + 0.05; // Slightly above road surface
  
  // Set up shadows
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  return mesh;
}

/**
 * Create road debris obstacle
 * @param {Object} config - Debris configuration
 * @returns {THREE.Group} - Debris mesh group
 */
function createDebris(config) {
  const group = new THREE.Group();
  
  // Create multiple debris pieces
  const numPieces = 3 + Math.floor(Math.random() * 4);
  
  for (let i = 0; i < numPieces; i++) {
    // Randomize piece size and shape
    const size = 0.3 + Math.random() * 0.5;
    
    // Choose random geometry
    let geometry;
    const geometryType = Math.floor(Math.random() * 3);
    
    switch (geometryType) {
      case 0:
        geometry = new THREE.BoxGeometry(size, size * 0.5, size * 1.5);
        break;
      case 1:
        geometry = new THREE.ConeGeometry(size * 0.7, size, 4);
        break;
      case 2:
        geometry = new THREE.SphereGeometry(size * 0.6, 8, 8);
        break;
    }
    
    // Create material with slight color variation
    const hue = Math.random() * 0.1;
    const material = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(hue, 0.1, 0.3 + Math.random() * 0.2)
    });
    
    const piece = new THREE.Mesh(geometry, material);
    
    // Position within the group
    const spread = config.width * 0.4;
    piece.position.set(
      (Math.random() - 0.5) * spread,
      size / 2,
      (Math.random() - 0.5) * spread
    );
    
    // Random rotation
    piece.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    // Set up shadows
    piece.castShadow = true;
    piece.receiveShadow = true;
    
    group.add(piece);
  }
  
  return group;
}

/**
 * Create roadwork obstacle
 * @param {Object} config - Roadwork configuration
 * @returns {THREE.Group} - Roadwork mesh group
 */
function createRoadwork(config) {
  const group = new THREE.Group();
  
  // Create cone material
  const coneMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color(config.color)
  });
  
  // Create reflective material for stripes
  const stripeMaterial = new THREE.MeshLambertMaterial({
    color: 0xFFFFFF,
    emissive: 0x333333
  });
  
  // Create multiple cones
  const numCones = 5;
  const spacing = config.width / (numCones - 1);
  
  for (let i = 0; i < numCones; i++) {
    // Create cone
    const coneGeometry = new THREE.ConeGeometry(0.5, 1.5, 16);
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    
    // Position cone
    cone.position.set(
      (i - (numCones - 1) / 2) * spacing,
      0.75, // Half height
      0
    );
    
    // Add reflective stripes
    const stripeGeometry = new THREE.TorusGeometry(0.55, 0.1, 8, 16);
    const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe.position.y = 0.3;
    stripe.rotation.x = Math.PI / 2;
    
    const stripe2 = stripe.clone();
    stripe2.position.y = -0.2;
    
    cone.add(stripe);
    cone.add(stripe2);
    
    // Set up shadows
    cone.castShadow = true;
    cone.receiveShadow = true;
    
    group.add(cone);
  }
  
  // Create caution tape between cones
  const tapeGeometry = new THREE.BoxGeometry(config.width, 0.1, 0.05);
  const tapeMaterial = new THREE.MeshLambertMaterial({
    color: 0x000000,
    emissive: 0xFFFF00,
    emissiveIntensity: 0.5
  });
  
  // Create striped pattern
  const tapeCanvas = document.createElement('canvas');
  tapeCanvas.width = 512;
  tapeCanvas.height = 64;
  
  const ctx = tapeCanvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, tapeCanvas.width, tapeCanvas.height);
  
  // Draw diagonal stripes
  ctx.fillStyle = '#FFFF00';
  for (let i = -tapeCanvas.width; i < tapeCanvas.width * 2; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 20, 0);
    ctx.lineTo(i + 50, tapeCanvas.height);
    ctx.lineTo(i + 30, tapeCanvas.height);
    ctx.closePath();
    ctx.fill();
  }
  
  const tapeTexture = new THREE.CanvasTexture(tapeCanvas);
  tapeTexture.wrapS = THREE.RepeatWrapping;
  tapeTexture.repeat.set(4, 1);
  
  tapeMaterial.map = tapeTexture;
  
  // Create two rows of tape
  const tape1 = new THREE.Mesh(tapeGeometry, tapeMaterial);
  tape1.position.y = 0.5;
  
  const tape2 = tape1.clone();
  tape2.position.y = 1.0;
  
  group.add(tape1);
  group.add(tape2);
  
  return group;
}

/**
 * Create traffic jam obstacle
 * @param {Object} config - Traffic jam configuration
 * @returns {THREE.Group} - Traffic jam mesh group
 */
function createTrafficJam(config) {
  const group = new THREE.Group();
  
  // Create simple cars in a jam
  const numCars = 3;
  const spacing = config.width / numCars;
  
  for (let i = 0; i < numCars; i++) {
    // Create car body
    const bodyGeometry = new THREE.BoxGeometry(1.8, 1.2, 4);
    
    // Random car color
    const carColors = [0xE63946, 0x457B9D, 0x1D3557, 0xF1FAEE, 0xA8DADC];
    const carColor = carColors[Math.floor(Math.random() * carColors.length)];
    
    const bodyMaterial = new THREE.MeshLambertMaterial({
      color: carColor
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6; // Half height
    
    // Create wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshLambertMaterial({
      color: 0x333333
    });
    
    // Position wheels
    const wheels = [];
    for (let w = 0; w < 4; w++) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(
        (w % 2 === 0 ? -1 : 1) * 0.8, // Left or right
        -0.4, // Bottom of car
        (w < 2 ? 1 : -1) * 1.2 // Front or back
      );
      wheels.push(wheel);
      body.add(wheel);
    }
    
    // Create windows
    const windowMaterial = new THREE.MeshLambertMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.7
    });
    
    const windshieldGeometry = new THREE.BoxGeometry(1.7, 0.7, 0.1);
    const windshield = new THREE.Mesh(windshieldGeometry, windowMaterial);
    windshield.position.set(0, 0.4, 1.5);
    body.add(windshield);
    
    // Create brake lights
    if (Math.random() < 0.7) { // Some cars have brake lights on
      const lightGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.1);
      const lightMaterial = new THREE.MeshLambertMaterial({
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 0.8
      });
      
      const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
      leftLight.position.set(-0.6, 0.1, -2);
      
      const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
      rightLight.position.set(0.6, 0.1, -2);
      
      body.add(leftLight);
      body.add(rightLight);
    }
    
    // Set up shadows
    body.castShadow = true;
    body.receiveShadow = true;
    
    // Position car within the traffic jam
    body.position.z = -i * spacing + config.width / 2 - spacing / 2;
    body.position.x = (Math.random() - 0.5) * 0.8; // Slight lateral variation
    
    // Random rotation for some cars
    if (Math.random() < 0.3) {
      body.rotation.y = (Math.random() - 0.5) * 0.3;
    }
    
    group.add(body);
  }
  
  return group;
}

/**
 * Create broken truck obstacle
 * @param {Object} config - Broken truck configuration
 * @returns {THREE.Group} - Broken truck mesh group
 */
function createBrokenTruck(config) {
  const group = new THREE.Group();
  
  // Create cab
  const cabGeometry = new THREE.BoxGeometry(2.5, 2.8, 5);
  const cabMaterial = new THREE.MeshLambertMaterial({
    color: 0x1565C0
  });
  
  const cab = new THREE.Mesh(cabGeometry, cabMaterial);
  cab.position.set(0, 1.4, 0);
  
  // Create trailer
  const trailerGeometry = new THREE.BoxGeometry(2.5, 2.8, 12);
  const trailerMaterial = new THREE.MeshLambertMaterial({
    color: 0xCCCCCC
  });
  
  const trailer = new THREE.Mesh(trailerGeometry, trailerMaterial);
  trailer.position.set(0, 1.4, -8.5);
  
  // Create wheels
  const wheelGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 16);
  const wheelMaterial = new THREE.MeshLambertMaterial({
    color: 0x333333
  });
  
  // Add wheels to cab
  for (let i = 0; i < 6; i++) {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    
    const row = Math.floor(i / 2);
    const side = i % 2 === 0 ? -1 : 1;
    
    wheel.position.set(
      side * 1.3, // Left or right
      -1.3, // Bottom of truck
      -row * 1.5 + 1.5 // Position along length
    );
    
    cab.add(wheel);
  }
  
  // Add wheels to trailer
  for (let i = 0; i < 8; i++) {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    
    const row = Math.floor(i / 2);
    const side = i % 2 === 0 ? -1 : 1;
    
    wheel.position.set(
      side * 1.3, // Left or right
      -1.3, // Bottom of trailer
      -row * 1.8 + 1 // Position along length
    );
    
    trailer.add(wheel);
  }
  
  // Add smoke effect
  const smokeGeometry = new THREE.SphereGeometry(1, 8, 8);
  const smokeMaterial = new THREE.MeshBasicMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 0.7
  });
  
  for (let i = 0; i < 5; i++) {
    const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
    smoke.position.set(
      (Math.random() - 0.5) * 2,
      2 + Math.random() * 3,
      -1 + (Math.random() - 0.5) * 2
    );
    
    smoke.scale.set(
      0.7 + Math.random() * 0.6,
      0.7 + Math.random() * 0.6,
      0.7 + Math.random() * 0.6
    );
    
    // Animate smoke (we'll just use scale here as an example)
    smoke.userData.animation = {
      speed: 0.001 + Math.random() * 0.002,
      offset: Math.random() * 2 * Math.PI
    };
    
    cab.add(smoke);
  }
  
  // Add hazard sign
  const signGeometry = new THREE.BoxGeometry(1, 1, 0.1);
  const signMaterial = new THREE.MeshLambertMaterial({
    color: 0xFF8800,
    emissive: 0xFF8800,
    emissiveIntensity: 0.3
  });
  
  const sign = new THREE.Mesh(signGeometry, signMaterial);
  sign.position.set(0, 0, -14.5);
  
  // Create warning pattern on sign
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 128;
  signCanvas.height = 128;
  
  const ctx = signCanvas.getContext('2d');
  ctx.fillStyle = '#FF8800';
  ctx.fillRect(0, 0, signCanvas.width, signCanvas.height);
  
  // Draw warning triangle
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(signCanvas.width / 2, 20);
  ctx.lineTo(signCanvas.width - 20, signCanvas.height - 20);
  ctx.lineTo(20, signCanvas.height - 20);
  ctx.closePath();
  ctx.fill();
  
  // Draw exclamation mark
  ctx.fillStyle = '#FF8800';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', signCanvas.width / 2, signCanvas.height / 2 + 10);
  
  const signTexture = new THREE.CanvasTexture(signCanvas);
  signMaterial.map = signTexture;
  
  // Set up random truck angle (jackknifed truck)
  if (Math.random() < 0.5) {
    cab.rotation.y = (Math.random() - 0.5) * Math.PI * 0.4;
    group.position.x += (Math.random() - 0.5) * 2;
  }
  
  // Set up shadows
  cab.castShadow = true;
  cab.receiveShadow = true;
  trailer.castShadow = true;
  trailer.receiveShadow = true;
  sign.castShadow = true;
  sign.receiveShadow = true;
  
  group.add(cab);
  group.add(trailer);
  group.add(sign);
  
  return group;
}

/**
 * Add a powerup to the scene
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Vector3} position - Position for the powerup
 * @param {string} type - Type of powerup
 */
function addPowerup(scene, position, type) {
  if (!scene) return;
  
  const powerupInfo = POWERUPS[type];
  if (!powerupInfo) return;
  
  // Create powerup mesh
  const group = new THREE.Group();
  
  // Create a base shape
  const baseGeometry = new THREE.SphereGeometry(1, 16, 16);
  const baseMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color(powerupInfo.color),
    transparent: true,
    opacity: 0.8
  });
  
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  group.add(base);
  
  // Create powerup icon
  const iconCanvas = document.createElement('canvas');
  iconCanvas.width = 128;
  iconCanvas.height = 128;
  
  const ctx = iconCanvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(powerupInfo.icon, iconCanvas.width / 2, iconCanvas.height / 2);
  
  const iconTexture = new THREE.CanvasTexture(iconCanvas);
  
  // Create icon plane
  const iconGeometry = new THREE.PlaneGeometry(1.5, 1.5);
  const iconMaterial = new THREE.MeshBasicMaterial({
    map: iconTexture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  
  const icon = new THREE.Mesh(iconGeometry, iconMaterial);
  group.add(icon);
  
  // Add outer glow
  const glowGeometry = new THREE.SphereGeometry(1.2, 16, 16);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(powerupInfo.color),
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
  });
  
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  group.add(glow);
  
  // Set up animation data
  group.userData.animation = {
    rotationSpeed: 0.02,
    bounceSpeed: 0.01,
    bounceHeight: 0.5,
    time: Math.random() * Math.PI * 2
  };
  
  // Position powerup
  group.position.copy(position);
  
  // Add to scene
  scene.add(group);
  
  // Create powerup object
  const powerup = {
    id: `powerup-${obstacleCounter++}`,
    type,
    position,
    width: 2,
    height: 2,
    depth: 2,
    mesh: group
  };
  
  // Add to powerups array
  powerups.push(powerup);
  
  return powerup;
}

/**
 * Check for collisions between player and obstacles/powerups
 * @param {THREE.Vector3} playerPosition - Player position
 * @param {Object} playerSize - Player size {width, height, depth}
 * @returns {Object} - Collision results
 */
function checkCollisions(playerPosition, playerSize) {
  const result = {
    collided: false,
    obstacle: null,
    powerup: null
  };
  
  // Create player bounding box
  const playerHalfWidth = playerSize.width / 2;
  const playerHalfHeight = playerSize.height / 2;
  const playerHalfDepth = playerSize.depth / 2;
  
  const playerMin = new THREE.Vector3(
    playerPosition.x - playerHalfWidth,
    playerPosition.y - playerHalfHeight,
    playerPosition.z - playerHalfDepth
  );
  
  const playerMax = new THREE.Vector3(
    playerPosition.x + playerHalfWidth,
    playerPosition.y + playerHalfHeight,
    playerPosition.z + playerHalfDepth
  );
  
  // Check collisions with obstacles
  for (const obstacle of obstacles) {
    // Create obstacle bounding box
    const obstacleHalfWidth = obstacle.width / 2;
    const obstacleHalfHeight = obstacle.height / 2;
    const obstacleHalfDepth = obstacle.depth / 2;
    
    const obstacleMin = new THREE.Vector3(
      obstacle.position.x - obstacleHalfWidth,
      obstacle.position.y - obstacleHalfHeight,
      obstacle.position.z - obstacleHalfDepth
    );
    
    const obstacleMax = new THREE.Vector3(
      obstacle.position.x + obstacleHalfWidth,
      obstacle.position.y + obstacleHalfHeight,
      obstacle.position.z + obstacleHalfDepth
    );
    
    // Check for collision
    if (
      playerMin.x <= obstacleMax.x && playerMax.x >= obstacleMin.x &&
      playerMin.y <= obstacleMax.y && playerMax.y >= obstacleMin.y &&
      playerMin.z <= obstacleMax.z && playerMax.z >= obstacleMin.z
    ) {
      result.collided = true;
      result.obstacle = obstacle;
      return result; // Return on first collision
    }
  }
  
  // Check collisions with powerups
  for (let i = 0; i < powerups.length; i++) {
    const powerup = powerups[i];
    
    // Create powerup bounding box
    const powerupHalfWidth = powerup.width / 2;
    const powerupHalfHeight = powerup.height / 2;
    const powerupHalfDepth = powerup.depth / 2;
    
    const powerupMin = new THREE.Vector3(
      powerup.position.x - powerupHalfWidth,
      powerup.position.y - powerupHalfHeight,
      powerup.position.z - powerupHalfDepth
    );
    
    const powerupMax = new THREE.Vector3(
      powerup.position.x + powerupHalfWidth,
      powerup.position.y + powerupHalfHeight,
      powerup.position.z + powerupHalfDepth
    );
    
    // Check for collision
    if (
      playerMin.x <= powerupMax.x && playerMax.x >= powerupMin.x &&
      playerMin.y <= powerupMax.y && playerMax.y >= powerupMin.y &&
      playerMin.z <= powerupMax.z && playerMax.z >= powerupMin.z
    ) {
      // Collect powerup
      result.powerup = powerup;
      
      // Remove from scene and array
      if (powerup.mesh.parent) {
        powerup.mesh.parent.remove(powerup.mesh);
      }
      powerups.splice(i, 1);
      
      return result;
    }
  }
  
  return result;
}

/**
 * Activate a powerup
 * @param {string} type - Powerup type
 * @returns {Object} - Activated powerup info
 */
function activatePowerup(type) {
  const powerupInfo = POWERUPS[type];
  if (!powerupInfo) return null;
  
  // Deactivate existing powerup of same type if exists
  if (activePowerups[type]) {
    activePowerups[type].active = false;
  }
  
  // Create active powerup
  const activePowerup = {
    type,
    name: powerupInfo.name,
    effect: powerupInfo.effect,
    duration: powerupInfo.duration,
    timeRemaining: powerupInfo.duration,
    active: true,
    speedMultiplier: powerupInfo.speedMultiplier || 1.0,
    fuelMultiplier: powerupInfo.fuelMultiplier || 1.0
  };
  
  // Add to active powerups
  activePowerups[type] = activePowerup;
  
  return activePowerup;
}

/**
 * Update powerup timers
 * @param {number} deltaTime - Time since last update in seconds
 * @returns {Array} - Expired powerups
 */
function updatePowerupTimers(deltaTime) {
  const expiredPowerups = [];
  
  for (const type in activePowerups) {
    const powerup = activePowerups[type];
    
    if (powerup.active) {
      powerup.timeRemaining -= deltaTime;
      
      if (powerup.timeRemaining <= 0) {
        powerup.active = false;
        expiredPowerups.push(powerup);
        delete activePowerups[type];
      }
    }
  }
  
  return expiredPowerups;
}

/**
 * Clear all obstacles and powerups
 * @param {THREE.Scene} scene - The Three.js scene
 */
function clearAll(scene) {
  if (!scene) return;
  
  // Remove all obstacles from scene
  obstacles.forEach(obstacle => {
    scene.remove(obstacle.mesh);
  });
  
  // Remove all powerups from scene
  powerups.forEach(powerup => {
    scene.remove(powerup.mesh);
  });
  
  // Clear arrays
  obstacles = [];
  powerups = [];
  activePowerups = {};
  obstacleCounter = 0;
  lastObstacleZ = 0;
}

/**
 * Update animations for obstacles and powerups
 * @param {number} deltaTime - Time since last update in seconds
 */
export function updateObstacleAnimations(deltaTime) {
  // Animate powerups
  powerups.forEach(powerup => {
    const mesh = powerup.mesh;
    if (mesh && mesh.userData.animation) {
      const anim = mesh.userData.animation;
      
      // Update time
      anim.time += deltaTime;
      
      // Rotation animation
      mesh.rotation.y += anim.rotationSpeed;
      
      // Bouncing animation
      mesh.position.y = powerup.position.y + Math.sin(anim.time * anim.bounceSpeed * 10) * anim.bounceHeight;
      
      // Pulse glow animation
      if (mesh.children[2]) {
        const glow = mesh.children[2];
        glow.scale.setScalar(1 + 0.1 * Math.sin(anim.time * 5));
      }
    }
  });
  
  // Animate obstacles with smoke/fire effects
  obstacles.forEach(obstacle => {
    if (obstacle.type === 'brokenTruck') {
      // Animate smoke
      obstacle.mesh.traverse(child => {
        if (child.userData.animation) {
          child.scale.x = 1 + 0.2 * Math.sin(Date.now() * child.userData.animation.speed + child.userData.animation.offset);
          child.scale.y = 1 + 0.2 * Math.sin(Date.now() * child.userData.animation.speed + child.userData.animation.offset + 1);
          child.scale.z = 1 + 0.2 * Math.sin(Date.now() * child.userData.animation.speed + child.userData.animation.offset + 2);
        }
      });
    }
  });
}

/**
 * Reset the obstacle manager
 * @param {THREE.Scene} scene - The Three.js scene
 */
export function resetObstacleManager(scene) {
  clearAll(scene);
} 