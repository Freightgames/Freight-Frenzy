// Truckstop Manager Module
import * as THREE from 'three';
import { GAME_SETTINGS, TRUCKSTOP } from '../config/constants.js';

// Truckstop state
let truckstops = [];
let lastTruckstopZ = 0;
let truckstopCounter = 0;
let difficultyMultiplier = 1.0;

/**
 * Initialize the truckstop manager
 * @param {string} difficulty - Difficulty level
 * @returns {Object} - Truckstop manager instance
 */
export function initTruckstopManager(difficulty = 'normal') {
  // Clear truckstops
  truckstops = [];
  truckstopCounter = 0;
  lastTruckstopZ = 0;
  
  // Set difficulty
  setDifficulty(difficulty);
  
  console.log("Truckstop manager initialized");
  
  return {
    getTruckstops: () => truckstops,
    update: (playerPosition, scene) => updateTruckstops(playerPosition, scene),
    checkTruckstopProximity: (playerPosition) => checkTruckstopProximity(playerPosition),
    setDifficulty: (difficulty) => setDifficulty(difficulty),
    clearAll: (scene) => clearAll(scene)
  };
}

/**
 * Set the difficulty level for truckstop generation
 * @param {string} difficulty - Difficulty level ('easy', 'normal', 'hard')
 */
function setDifficulty(difficulty) {
  switch (difficulty) {
    case 'easy':
      difficultyMultiplier = 1.3; // More truckstops in easy mode
      break;
    case 'hard':
      difficultyMultiplier = 0.7; // Fewer truckstops in hard mode
      break;
    case 'normal':
    default:
      difficultyMultiplier = 1.0;
      break;
  }
}

/**
 * Update truckstops based on player position
 * @param {THREE.Vector3} playerPosition - Player position
 * @param {THREE.Scene} scene - The Three.js scene
 */
function updateTruckstops(playerPosition, scene) {
  if (!scene) return;
  
  const playerDistanceZ = playerPosition.z;
  const spawnDistance = GAME_SETTINGS.RENDER_DISTANCE;
  const despawnDistance = GAME_SETTINGS.OBSTACLE_DESPAWN_DISTANCE;
  
  // Remove truckstops that are too far behind
  truckstops = truckstops.filter(truckstop => {
    if (truckstop.position.z < playerDistanceZ + despawnDistance) {
      scene.remove(truckstop.mesh);
      return false;
    }
    return true;
  });
  
  // Check if we need to spawn more truckstops
  if (truckstops.length === 0 || 
      truckstops[truckstops.length - 1].position.z < playerDistanceZ + spawnDistance) {
    spawnTruckstopsAhead(scene, playerDistanceZ);
  }
}

/**
 * Spawn truckstops ahead of the player
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {number} playerDistanceZ - Player's z position
 */
function spawnTruckstopsAhead(scene, playerDistanceZ) {
  const spawnDistance = GAME_SETTINGS.RENDER_DISTANCE;
  const roadWidth = GAME_SETTINGS.ROAD_WIDTH;
  
  // Determine where to spawn the next truckstop
  const minDistance = GAME_SETTINGS.MIN_DISTANCE_BETWEEN_TRUCKSTOPS * difficultyMultiplier;
  const maxDistance = GAME_SETTINGS.MAX_DISTANCE_BETWEEN_TRUCKSTOPS * difficultyMultiplier;
  
  // Calculate start position for the next truckstop
  const startZ = Math.max(
    lastTruckstopZ + minDistance,
    playerDistanceZ + 100 // Ensure truckstop isn't too close to player
  );
  
  // Determine position within allowed range
  const truckstopZ = startZ + Math.random() * (maxDistance - minDistance);
  
  // Ensure it's within the spawn distance
  if (truckstopZ < playerDistanceZ + spawnDistance) {
    // Choose side of road (left/right)
    const side = Math.random() < 0.5 ? -1 : 1;
    const truckstopX = side * (roadWidth / 2 + 15); // Position off the side of the road
    
    // Create and add truckstop
    addTruckstop(scene, new THREE.Vector3(truckstopX, 0, truckstopZ));
    
    lastTruckstopZ = truckstopZ;
  }
}

/**
 * Add a truckstop to the scene
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Vector3} position - Position for the truckstop
 */
function addTruckstop(scene, position) {
  if (!scene) return;
  
  // Create truckstop mesh
  const mesh = createTruckstopMesh();
  
  // Position the truckstop
  mesh.position.copy(position);
  
  // Rotate to face the road
  if (position.x < 0) {
    mesh.rotation.y = Math.PI / 2; // Left side of road
  } else {
    mesh.rotation.y = -Math.PI / 2; // Right side of road
  }
  
  // Add to scene
  scene.add(mesh);
  
  // Create truckstop object
  const truckstop = {
    id: `truckstop-${truckstopCounter++}`,
    position,
    width: 30,
    height: 15,
    depth: 40,
    mesh,
    detectionRadius: 50 // How close the player needs to be to interact
  };
  
  // Add to truckstops array
  truckstops.push(truckstop);
  
  return truckstop;
}

/**
 * Create a truckstop mesh
 * @returns {THREE.Group} - Truckstop mesh group
 */
function createTruckstopMesh() {
  const group = new THREE.Group();
  
  // Create main building
  const buildingGeometry = new THREE.BoxGeometry(20, 10, 30);
  const buildingMaterial = new THREE.MeshLambertMaterial({
    color: 0xF5F5F5 // White/light gray
  });
  
  const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
  building.position.set(0, 5, 0);
  
  // Create roof
  const roofGeometry = new THREE.BoxGeometry(22, 2, 32);
  const roofMaterial = new THREE.MeshLambertMaterial({
    color: 0xD32F2F // Red
  });
  
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.set(0, 11, 0);
  
  // Create fuel canopy
  const canopyGeometry = new THREE.BoxGeometry(20, 1, 15);
  const canopyMaterial = new THREE.MeshLambertMaterial({
    color: 0xD32F2F // Red
  });
  
  const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
  canopy.position.set(0, 8, 20);
  
  // Create canopy supports
  const supportGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
  const supportMaterial = new THREE.MeshLambertMaterial({
    color: 0xE0E0E0 // Light gray
  });
  
  const support1 = new THREE.Mesh(supportGeometry, supportMaterial);
  support1.position.set(-8, 4, 16);
  
  const support2 = new THREE.Mesh(supportGeometry, supportMaterial);
  support2.position.set(8, 4, 16);
  
  const support3 = new THREE.Mesh(supportGeometry, supportMaterial);
  support3.position.set(-8, 4, 24);
  
  const support4 = new THREE.Mesh(supportGeometry, supportMaterial);
  support4.position.set(8, 4, 24);
  
  // Create fuel pumps
  const pumpGeometry = new THREE.BoxGeometry(2, 4, 2);
  const pumpMaterial = new THREE.MeshLambertMaterial({
    color: 0xD32F2F // Red
  });
  
  const pump1 = new THREE.Mesh(pumpGeometry, pumpMaterial);
  pump1.position.set(-5, 2, 20);
  
  const pump2 = new THREE.Mesh(pumpGeometry, pumpMaterial);
  pump2.position.set(5, 2, 20);
  
  // Create parking lot
  const parkingLotGeometry = new THREE.PlaneGeometry(30, 40);
  const parkingLotMaterial = new THREE.MeshLambertMaterial({
    color: 0x424242, // Dark gray
    side: THREE.DoubleSide
  });
  
  const parkingLot = new THREE.Mesh(parkingLotGeometry, parkingLotMaterial);
  parkingLot.rotation.x = -Math.PI / 2;
  parkingLot.position.set(0, 0.05, 0); // Slightly above ground
  
  // Create signage
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 128;
  
  const ctx = signCanvas.getContext('2d');
  ctx.fillStyle = '#D32F2F';
  ctx.fillRect(0, 0, signCanvas.width, signCanvas.height);
  
  // Draw text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 64px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BIG RIG REST STOP', signCanvas.width / 2, signCanvas.height / 2);
  
  const signTexture = new THREE.CanvasTexture(signCanvas);
  
  const signGeometry = new THREE.PlaneGeometry(15, 4);
  const signMaterial = new THREE.MeshBasicMaterial({
    map: signTexture,
    side: THREE.DoubleSide
  });
  
  const sign = new THREE.Mesh(signGeometry, signMaterial);
  sign.position.set(0, 13, 0);
  
  // Add a parking indicator
  const parkingSpotGeometry = new THREE.PlaneGeometry(10, 20);
  const parkingSpotMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x2E7D32, // Green
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  
  const parkingSpot = new THREE.Mesh(parkingSpotGeometry, parkingSpotMaterial);
  parkingSpot.rotation.x = -Math.PI / 2;
  parkingSpot.position.set(0, 0.1, -12); // In front of store
  
  // Add logo for brand recognition
  const logoCanvas = document.createElement('canvas');
  logoCanvas.width = 256;
  logoCanvas.height = 256;
  
  const logoCtx = logoCanvas.getContext('2d');
  
  // Draw logo background
  logoCtx.fillStyle = '#FFFFFF';
  logoCtx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
  
  // Draw truck icon
  logoCtx.fillStyle = '#D32F2F';
  logoCtx.beginPath();
  logoCtx.moveTo(50, 150);
  logoCtx.lineTo(50, 120);
  logoCtx.lineTo(100, 100);
  logoCtx.lineTo(160, 100);
  logoCtx.lineTo(180, 120);
  logoCtx.lineTo(200, 120);
  logoCtx.lineTo(200, 150);
  logoCtx.closePath();
  logoCtx.fill();
  
  // Draw wheels
  logoCtx.fillStyle = '#000000';
  logoCtx.beginPath();
  logoCtx.arc(80, 150, 15, 0, Math.PI * 2);
  logoCtx.fill();
  
  logoCtx.beginPath();
  logoCtx.arc(170, 150, 15, 0, Math.PI * 2);
  logoCtx.fill();
  
  const logoTexture = new THREE.CanvasTexture(logoCanvas);
  
  const logoGeometry = new THREE.PlaneGeometry(8, 8);
  const logoMaterial = new THREE.MeshBasicMaterial({
    map: logoTexture,
    side: THREE.DoubleSide
  });
  
  const logo = new THREE.Mesh(logoGeometry, logoMaterial);
  logo.position.set(0, 6, 15.1); // On front of building
  
  // Add all elements to the group
  group.add(building);
  group.add(roof);
  group.add(canopy);
  group.add(support1);
  group.add(support2);
  group.add(support3);
  group.add(support4);
  group.add(pump1);
  group.add(pump2);
  group.add(parkingLot);
  group.add(sign);
  group.add(parkingSpot);
  group.add(logo);
  
  // Set up shadows
  group.traverse(object => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  
  return group;
}

/**
 * Check if player is near a truckstop
 * @param {THREE.Vector3} playerPosition - Player position
 * @returns {Object|null} - Nearest truckstop within detection radius or null
 */
function checkTruckstopProximity(playerPosition) {
  let nearestTruckstop = null;
  let nearestDistance = Infinity;
  
  for (const truckstop of truckstops) {
    const distance = playerPosition.distanceTo(truckstop.position);
    
    if (distance < truckstop.detectionRadius && distance < nearestDistance) {
      nearestTruckstop = truckstop;
      nearestDistance = distance;
    }
  }
  
  return nearestTruckstop;
}

/**
 * Clear all truckstops
 * @param {THREE.Scene} scene - The Three.js scene
 */
function clearAll(scene) {
  if (!scene) return;
  
  // Remove all truckstops from scene
  truckstops.forEach(truckstop => {
    scene.remove(truckstop.mesh);
  });
  
  // Clear array
  truckstops = [];
  truckstopCounter = 0;
  lastTruckstopZ = 0;
}

/**
 * Reset the truckstop manager
 * @param {THREE.Scene} scene - The Three.js scene
 */
export function resetTruckstopManager(scene) {
  clearAll(scene);
} 