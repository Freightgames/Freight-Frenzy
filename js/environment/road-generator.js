// Road Generator Module
import * as THREE from 'three';
import { GAME_SETTINGS } from '../config/constants.js';

// Road state
let roadSegments = [];
let currentRoadType = 'straight';
let totalRoadDistance = 0;

/**
 * Initialize the road generator
 * @param {THREE.Scene} scene - The Three.js scene
 * @returns {Object} - Road generator instance
 */
export function initRoadGenerator(scene) {
  if (!scene) {
    console.error("Scene is required for road generator");
    return null;
  }
  
  // Create initial road segments
  createInitialRoad(scene);
  
  console.log("Road generator initialized");
  
  return {
    getRoadSegments: () => roadSegments,
    getTotalDistance: () => totalRoadDistance,
    update: (playerPosition, scene) => updateRoad(playerPosition, scene)
  };
}

/**
 * Create the initial road segments
 * @param {THREE.Scene} scene - The Three.js scene
 */
function createInitialRoad(scene) {
  // Clear any existing road segments
  roadSegments.forEach(segment => {
    if (segment.mesh && scene) {
      scene.remove(segment.mesh);
    }
  });
  
  roadSegments = [];
  totalRoadDistance = 0;
  
  // Create initial straight road
  for (let i = 0; i < 20; i++) {
    const segment = createRoadSegment('straight', totalRoadDistance);
    roadSegments.push(segment);
    totalRoadDistance += segment.length;
    
    if (scene) {
      scene.add(segment.mesh);
    }
  }
}

/**
 * Create a road segment
 * @param {string} type - Type of road segment ('straight', 'curve-left', 'curve-right', 'hill')
 * @param {number} startDistance - Start distance of this segment
 * @returns {Object} - Road segment object
 */
function createRoadSegment(type, startDistance) {
  const segmentLength = 100; // Length of a road segment in world units
  const roadWidth = GAME_SETTINGS.ROAD_WIDTH;
  
  // Create road segment geometry
  const geometry = new THREE.PlaneGeometry(roadWidth, segmentLength);
  
  // Create appropriate material based on road type
  const material = new THREE.MeshLambertMaterial({
    color: 0x333333, // Dark gray for asphalt
    side: THREE.DoubleSide
  });
  
  // Create lane markings
  const lanesTexture = createLanesTexture();
  if (lanesTexture) {
    material.map = lanesTexture;
  }
  
  // Create mesh and position it
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2; // Rotate to lie flat on the ground
  
  // Position based on segment type and start distance
  let position = new THREE.Vector3(0, 0, startDistance + segmentLength / 2);
  let rotation = new THREE.Euler(-Math.PI / 2, 0, 0);
  
  switch (type) {
    case 'curve-left':
      // Implement curved road logic here
      break;
    case 'curve-right':
      // Implement curved road logic here
      break;
    case 'hill':
      // Implement hill road logic here
      break;
    case 'straight':
    default:
      // Straight road is default
      break;
  }
  
  mesh.position.copy(position);
  mesh.rotation.copy(rotation);
  
  // Create road shoulders/edges
  const leftShoulder = createRoadShoulder(segmentLength, position, rotation, -roadWidth / 2);
  const rightShoulder = createRoadShoulder(segmentLength, position, rotation, roadWidth / 2);
  
  // Group all road elements
  const roadGroup = new THREE.Group();
  roadGroup.add(mesh);
  roadGroup.add(leftShoulder);
  roadGroup.add(rightShoulder);
  
  // Return segment data
  return {
    type,
    length: segmentLength,
    width: roadWidth,
    startDistance,
    endDistance: startDistance + segmentLength,
    position,
    rotation,
    mesh: roadGroup
  };
}

/**
 * Create road shoulder/edge
 * @param {number} length - Length of the road segment
 * @param {THREE.Vector3} roadPosition - Position of the road segment
 * @param {THREE.Euler} roadRotation - Rotation of the road segment
 * @param {number} offset - Lateral offset from road center
 * @returns {THREE.Mesh} - Road shoulder mesh
 */
function createRoadShoulder(length, roadPosition, roadRotation, offset) {
  const shoulderWidth = 1;
  
  // Create shoulder geometry
  const geometry = new THREE.PlaneGeometry(shoulderWidth, length);
  
  // Create shoulder material
  const material = new THREE.MeshLambertMaterial({
    color: 0xFFFFFF, // White for road edge
    side: THREE.DoubleSide
  });
  
  // Create mesh
  const mesh = new THREE.Mesh(geometry, material);
  
  // Position shoulder alongside road
  mesh.rotation.copy(roadRotation);
  mesh.position.copy(roadPosition);
  mesh.position.x += offset + (offset > 0 ? shoulderWidth / 2 : -shoulderWidth / 2);
  
  return mesh;
}

/**
 * Create a texture with lane markings
 * @returns {THREE.Texture} - Lane markings texture
 */
function createLanesTexture() {
  // Create a canvas for the lane texture
  const canvas = document.createElement('canvas');
  const roadWidth = GAME_SETTINGS.ROAD_WIDTH;
  const segmentLength = 100;
  
  canvas.width = 512;
  canvas.height = 512;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  // Fill with asphalt color
  ctx.fillStyle = '#333333';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw lane markings
  ctx.fillStyle = '#FFFFFF';
  
  // Center line (dashed)
  const dashLength = canvas.height / 20;
  const gapLength = dashLength;
  let y = 0;
  
  while (y < canvas.height) {
    ctx.fillRect(canvas.width / 2 - 2, y, 4, dashLength);
    y += dashLength + gapLength;
  }
  
  // Side lane markings (solid)
  const laneWidth = roadWidth / 3; // Assuming 3 lanes
  const lanePosition1 = (canvas.width / 2) - (canvas.width / roadWidth) * laneWidth;
  const lanePosition2 = (canvas.width / 2) + (canvas.width / roadWidth) * laneWidth;
  
  ctx.fillRect(lanePosition1 - 2, 0, 4, canvas.height);
  ctx.fillRect(lanePosition2 - 2, 0, 4, canvas.height);
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 10); // Repeat the texture along the road
  
  return texture;
}

/**
 * Update the road based on player position
 * @param {THREE.Vector3} playerPosition - Current player position
 * @param {THREE.Scene} scene - The Three.js scene
 */
function updateRoad(playerPosition, scene) {
  if (!scene) return;
  
  const playerDistanceZ = playerPosition.z;
  const renderDistance = GAME_SETTINGS.RENDER_DISTANCE;
  
  // Remove segments too far behind the player
  while (roadSegments.length > 0 && roadSegments[0].endDistance < playerDistanceZ - 200) {
    const segment = roadSegments.shift();
    scene.remove(segment.mesh);
  }
  
  // Add new segments ahead if needed
  const lastSegment = roadSegments[roadSegments.length - 1];
  const furthestDistance = lastSegment ? lastSegment.endDistance : 0;
  
  if (furthestDistance < playerDistanceZ + renderDistance) {
    // Decide what type of segment to add next
    let nextType = decideNextRoadType();
    
    // Create and add new segment
    const newSegment = createRoadSegment(nextType, furthestDistance);
    roadSegments.push(newSegment);
    scene.add(newSegment.mesh);
    
    // Update total road distance
    totalRoadDistance = newSegment.endDistance;
  }
}

/**
 * Decide what type of road segment to generate next
 * @returns {string} - Road segment type
 */
function decideNextRoadType() {
  // Simple logic for road variety
  // In a more complex implementation, you would handle transitions between 
  // different road types more carefully
  
  // 70% chance to continue with the same road type
  if (Math.random() < 0.7) {
    return currentRoadType;
  }
  
  // Otherwise, choose a new road type
  const roadTypes = ['straight', 'curve-left', 'curve-right', 'hill'];
  let newType;
  
  do {
    const randomIndex = Math.floor(Math.random() * roadTypes.length);
    newType = roadTypes[randomIndex];
  } while (newType === currentRoadType);
  
  currentRoadType = newType;
  return newType;
}

/**
 * Reset the road generator
 * @param {THREE.Scene} scene - The Three.js scene
 */
export function resetRoadGenerator(scene) {
  createInitialRoad(scene);
} 