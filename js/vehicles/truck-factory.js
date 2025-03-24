// Truck Factory Module
import { VEHICLE_PROPERTIES } from '../config/constants.js';
import { 
  createCabFrontTexture, 
  createCabSideTexture, 
  createPlainTexture 
} from './textures.js';

/**
 * Create a truck with the specified type
 * @param {string} truckType - Type of truck to create ('flipFlopSpecial', 'oldTimer', 'strongSoloSergey')
 * @param {THREE.Scene} scene - The scene to add the truck to
 * @returns {THREE.Group} The truck group
 */
export function createTruck(truckType, scene) {
  // Create a group to hold the truck
  const truckGroup = new THREE.Group();
  
  // Set the truck's initial position
  truckGroup.position.x = 0;
  truckGroup.position.y = 0;
  truckGroup.position.z = 0;
  
  // Create the truck based on the type
  switch (truckType) {
    case 'flipFlopSpecial':
      createFlipFlopSpecialCab(truckGroup);
      break;
    case 'oldTimer':
      createOldTimerCab(truckGroup);
      break;
    case 'strongSoloSergey':
      createStrongSoloSergeyCab(truckGroup);
      break;
    default:
      console.warn(`Unknown truck type: ${truckType}, creating default truck`);
      createFlipFlopSpecialCab(truckGroup);
  }
  
  // Store the truck type with the group
  truckGroup.userData = {
    type: truckType,
    properties: VEHICLE_PROPERTIES[truckType] || VEHICLE_PROPERTIES.flipFlopSpecial,
    isPlayer: true,
  };
  
  // Add the truck to the scene
  if (scene) {
    scene.add(truckGroup);
  }
  
  return truckGroup;
}

/**
 * Create the Flip Flop Special cab (modern aerodynamic Volvo-style truck)
 * @param {THREE.Group} truckGroup - The group to add the cab to
 */
function createFlipFlopSpecialCab(truckGroup) {
  // Define materials
  const cabFrontTexture = createCabFrontTexture('#0066cc');
  const cabSideTexture = createCabSideTexture('#0066cc');
  const cabTopTexture = createPlainTexture('#0066cc');
  
  const materials = [
    new THREE.MeshLambertMaterial({ map: cabSideTexture }), // right side
    new THREE.MeshLambertMaterial({ map: cabSideTexture }), // left side
    new THREE.MeshLambertMaterial({ map: cabTopTexture }), // top
    new THREE.MeshLambertMaterial({ map: createPlainTexture('#0055aa') }), // bottom
    new THREE.MeshLambertMaterial({ map: cabFrontTexture }), // front
    new THREE.MeshLambertMaterial({ map: createPlainTexture('#0055aa') }) // back
  ];
  
  // Create the cab geometry (slightly aerodynamic)
  const cabGeometry = new THREE.BoxGeometry(2, 2.5, 4);
  const cab = new THREE.Mesh(cabGeometry, materials);
  cab.position.y = 1.5;
  cab.position.z = -1;
  cab.castShadow = true;
  cab.receiveShadow = true;
  
  // Create the aerodynamic roof fairing
  const fairingGeometry = new THREE.BoxGeometry(1.8, 0.8, 1.5);
  const fairing = new THREE.Mesh(fairingGeometry, new THREE.MeshLambertMaterial({ color: 0x0077dd }));
  fairing.position.y = 2.45;
  fairing.position.z = -2.25;
  fairing.castShadow = true;
  
  // Add cabin lights
  const headlightGeometry = new THREE.CircleGeometry(0.3, 16);
  const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  
  // Left headlight
  const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  leftHeadlight.position.set(-0.6, 0.9, 1);
  leftHeadlight.rotation.y = Math.PI;
  
  // Right headlight
  const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  rightHeadlight.position.set(0.6, 0.9, 1);
  rightHeadlight.rotation.y = Math.PI;
  
  // Add components to the group
  truckGroup.add(cab);
  truckGroup.add(fairing);
  truckGroup.add(leftHeadlight);
  truckGroup.add(rightHeadlight);
  
  return truckGroup;
}

/**
 * Create the Old Timer cab (classic Mack-style truck with long hood)
 * @param {THREE.Group} truckGroup - The group to add the cab to
 */
function createOldTimerCab(truckGroup) {
  // Define materials with a classic red color
  const cabFrontTexture = createCabFrontTexture('#cc0000');
  const cabSideTexture = createCabSideTexture('#cc0000');
  const cabTopTexture = createPlainTexture('#cc0000');
  
  const materials = [
    new THREE.MeshLambertMaterial({ map: cabSideTexture }), // right side
    new THREE.MeshLambertMaterial({ map: cabSideTexture }), // left side
    new THREE.MeshLambertMaterial({ map: cabTopTexture }), // top
    new THREE.MeshLambertMaterial({ map: createPlainTexture('#aa0000') }), // bottom
    new THREE.MeshLambertMaterial({ map: cabFrontTexture }), // front
    new THREE.MeshLambertMaterial({ map: createPlainTexture('#aa0000') }) // back
  ];
  
  // Create the cab geometry (more boxy, traditional)
  const cabGeometry = new THREE.BoxGeometry(2.2, 2.2, 2.5);
  const cab = new THREE.Mesh(cabGeometry, materials);
  cab.position.y = 1.5;
  cab.position.z = -1.2;
  cab.castShadow = true;
  cab.receiveShadow = true;
  
  // Create the long hood
  const hoodGeometry = new THREE.BoxGeometry(2, 1.5, 3);
  const hood = new THREE.Mesh(hoodGeometry, new THREE.MeshLambertMaterial({ color: 0xdd0000 }));
  hood.position.y = 1.15;
  hood.position.z = 1;
  hood.castShadow = true;
  
  // Add exhaust stacks
  const stackGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.8, 8);
  const stackMaterial = new THREE.MeshLambertMaterial({ color: 0xdddddd });
  
  // Left stack
  const leftStack = new THREE.Mesh(stackGeometry, stackMaterial);
  leftStack.position.set(-0.7, 2.4, -1);
  
  // Right stack
  const rightStack = new THREE.Mesh(stackGeometry, stackMaterial);
  rightStack.position.set(0.7, 2.4, -1);
  
  // Add headlights
  const headlightGeometry = new THREE.CircleGeometry(0.25, 16);
  const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  
  // Left headlight
  const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  leftHeadlight.position.set(-0.7, 1.1, 2.5);
  leftHeadlight.rotation.y = Math.PI;
  
  // Right headlight
  const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  rightHeadlight.position.set(0.7, 1.1, 2.5);
  rightHeadlight.rotation.y = Math.PI;
  
  // Add components to the group
  truckGroup.add(cab);
  truckGroup.add(hood);
  truckGroup.add(leftStack);
  truckGroup.add(rightStack);
  truckGroup.add(leftHeadlight);
  truckGroup.add(rightHeadlight);
  
  return truckGroup;
}

/**
 * Create the Strong Solo Sergey cab (worn Freightliner)
 * @param {THREE.Group} truckGroup - The group to add the cab to
 */
function createStrongSoloSergeyCab(truckGroup) {
  // Define materials with a worn gray color
  const cabFrontTexture = createCabFrontTexture('#666666');
  const cabSideTexture = createCabSideTexture('#666666');
  const cabTopTexture = createPlainTexture('#666666');
  
  const materials = [
    new THREE.MeshLambertMaterial({ map: cabSideTexture }), // right side
    new THREE.MeshLambertMaterial({ map: cabSideTexture }), // left side
    new THREE.MeshLambertMaterial({ map: cabTopTexture }), // top
    new THREE.MeshLambertMaterial({ map: createPlainTexture('#555555') }), // bottom
    new THREE.MeshLambertMaterial({ map: cabFrontTexture }), // front
    new THREE.MeshLambertMaterial({ map: createPlainTexture('#555555') }) // back
  ];
  
  // Create the cab geometry (standard shape)
  const cabGeometry = new THREE.BoxGeometry(2.1, 2.3, 3);
  const cab = new THREE.Mesh(cabGeometry, materials);
  cab.position.y = 1.5;
  cab.position.z = -1;
  cab.castShadow = true;
  cab.receiveShadow = true;
  
  // Create the hood (medium length)
  const hoodGeometry = new THREE.BoxGeometry(2, 1.4, 2.5);
  const hood = new THREE.Mesh(hoodGeometry, new THREE.MeshLambertMaterial({ color: 0x777777 }));
  hood.position.y = 1.1;
  hood.position.z = 0.75;
  hood.castShadow = true;
  
  // Add rust spots
  const rustGeometry1 = new THREE.CircleGeometry(0.3, 8);
  const rustGeometry2 = new THREE.PlaneGeometry(0.5, 0.3);
  const rustMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  
  // First rust spot
  const rustSpot1 = new THREE.Mesh(rustGeometry1, rustMaterial);
  rustSpot1.position.set(-1.05, 1.2, -0.5);
  rustSpot1.rotation.y = Math.PI / 2;
  
  // Second rust spot
  const rustSpot2 = new THREE.Mesh(rustGeometry2, rustMaterial);
  rustSpot2.position.set(1.05, 1.8, -1.2);
  rustSpot2.rotation.y = -Math.PI / 2;
  
  // Third rust spot on hood
  const rustSpot3 = new THREE.Mesh(rustGeometry1, rustMaterial);
  rustSpot3.position.set(0.6, 1.3, 1.2);
  rustSpot3.rotation.y = Math.PI;
  rustSpot3.scale.set(0.7, 0.7, 0.7);
  
  // Add headlights (one dimmer than the other)
  const headlightGeometry = new THREE.CircleGeometry(0.25, 16);
  const brightHeadlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  const dimHeadlightMaterial = new THREE.MeshBasicMaterial({ color: 0xeeee99 });
  
  // Left headlight (bright)
  const leftHeadlight = new THREE.Mesh(headlightGeometry, brightHeadlightMaterial);
  leftHeadlight.position.set(-0.7, 1.0, 2);
  leftHeadlight.rotation.y = Math.PI;
  
  // Right headlight (dim)
  const rightHeadlight = new THREE.Mesh(headlightGeometry, dimHeadlightMaterial);
  rightHeadlight.position.set(0.7, 1.0, 2);
  rightHeadlight.rotation.y = Math.PI;
  
  // Add components to the group
  truckGroup.add(cab);
  truckGroup.add(hood);
  truckGroup.add(rustSpot1);
  truckGroup.add(rustSpot2);
  truckGroup.add(rustSpot3);
  truckGroup.add(leftHeadlight);
  truckGroup.add(rightHeadlight);
  
  return truckGroup;
}

// Export the truck creation functions
export { createFlipFlopSpecialCab, createOldTimerCab, createStrongSoloSergeyCab }; 