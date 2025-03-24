// Trailer Factory Module
import { TRAILER_PROPERTIES } from '../config/constants.js';
import { 
  createTrailerSideTexture, 
  createTrailerBackTexture, 
  createPlainTexture 
} from './textures.js';

/**
 * Create a trailer with the specified type
 * @param {string} trailerType - Type of trailer to create ('dryVan', 'flatbed')
 * @param {THREE.Group} truckGroup - The truck group to attach the trailer to
 * @param {THREE.Scene} scene - The scene to add the trailer to
 * @returns {THREE.Group} The updated truck group with trailer
 */
export function createTrailer(trailerType, truckGroup, scene) {
  // Create the trailer based on the type
  switch (trailerType) {
    case 'dryVan':
      createDryVanTrailer(truckGroup);
      break;
    case 'flatbed':
      createFlatbedTrailer(truckGroup);
      break;
    default:
      console.warn(`Unknown trailer type: ${trailerType}, creating default trailer`);
      createDryVanTrailer(truckGroup);
  }
  
  // Store the trailer type with the truck group
  if (truckGroup.userData) {
    truckGroup.userData.trailerType = trailerType;
    truckGroup.userData.trailerProperties = TRAILER_PROPERTIES[trailerType] || TRAILER_PROPERTIES.dryVan;
  }
  
  return truckGroup;
}

/**
 * Create a dry van trailer (enclosed box trailer)
 * @param {THREE.Group} truckGroup - The truck group to add the trailer to
 */
function createDryVanTrailer(truckGroup) {
  // Define textures
  const trailerSideTexture = createTrailerSideTexture('#FFFFFF', true);
  const trailerBackTexture = createTrailerBackTexture('#FFFFFF');
  const trailerTopTexture = createPlainTexture('#FFFFFF');
  
  const materials = [
    new THREE.MeshLambertMaterial({ map: trailerSideTexture }), // right side
    new THREE.MeshLambertMaterial({ map: trailerSideTexture }), // left side
    new THREE.MeshLambertMaterial({ map: trailerTopTexture }), // top
    new THREE.MeshLambertMaterial({ map: createPlainTexture('#EEEEEE') }), // bottom
    new THREE.MeshLambertMaterial({ map: createPlainTexture('#EEEEEE') }), // front
    new THREE.MeshLambertMaterial({ map: trailerBackTexture }) // back
  ];
  
  // Create the trailer geometry
  const trailerGeometry = new THREE.BoxGeometry(2.4, 2.8, 8);
  const trailer = new THREE.Mesh(trailerGeometry, materials);
  trailer.position.y = 1.9;
  trailer.position.z = -7;
  trailer.castShadow = true;
  trailer.receiveShadow = true;
  
  // Create the fifth wheel connection
  const connectionGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.5);
  const connection = new THREE.Mesh(
    connectionGeometry,
    new THREE.MeshLambertMaterial({ color: 0x444444 })
  );
  connection.position.y = 0.5;
  connection.position.z = -3;
  
  // Add components to the group
  truckGroup.add(trailer);
  truckGroup.add(connection);
  
  return truckGroup;
}

/**
 * Create a flatbed trailer (open bed for hauling large loads)
 * @param {THREE.Group} truckGroup - The truck group to add the trailer to
 */
function createFlatbedTrailer(truckGroup) {
  // Create the flatbed platform
  const bedGeometry = new THREE.BoxGeometry(2.4, 0.3, 8);
  const bed = new THREE.Mesh(
    bedGeometry,
    new THREE.MeshLambertMaterial({ color: 0x444444 })
  );
  bed.position.y = 0.65;
  bed.position.z = -7;
  bed.castShadow = true;
  bed.receiveShadow = true;
  
  // Create side rails
  const railGeometry = new THREE.BoxGeometry(0.1, 0.2, 8);
  const leftRail = new THREE.Mesh(
    railGeometry,
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  );
  leftRail.position.set(-1.15, 0.9, -7);
  
  const rightRail = new THREE.Mesh(
    railGeometry,
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  );
  rightRail.position.set(1.15, 0.9, -7);
  
  // Create the fifth wheel connection
  const connectionGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.5);
  const connection = new THREE.Mesh(
    connectionGeometry,
    new THREE.MeshLambertMaterial({ color: 0x444444 })
  );
  connection.position.y = 0.5;
  connection.position.z = -3;
  
  // Add cargo (wooden crates)
  const crateGeometry1 = new THREE.BoxGeometry(1.8, 1.2, 2);
  const crate1 = new THREE.Mesh(
    crateGeometry1,
    new THREE.MeshLambertMaterial({ color: 0x8B4513 })
  );
  crate1.position.set(-0.2, 1.3, -5.5);
  crate1.castShadow = true;
  
  const crateGeometry2 = new THREE.BoxGeometry(1.6, 0.9, 2.5);
  const crate2 = new THREE.Mesh(
    crateGeometry2,
    new THREE.MeshLambertMaterial({ color: 0x8B4513 })
  );
  crate2.position.set(0.3, 1.15, -8);
  crate2.castShadow = true;
  
  // Add tie-down straps (simple black lines)
  const strapGeometry1 = new THREE.BoxGeometry(2.4, 0.05, 0.1);
  const strap1 = new THREE.Mesh(
    strapGeometry1,
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  strap1.position.y = 1.8;
  strap1.position.z = -5.5;
  
  const strapGeometry2 = new THREE.BoxGeometry(2.4, 0.05, 0.1);
  const strap2 = new THREE.Mesh(
    strapGeometry2,
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  strap2.position.y = 1.6;
  strap2.position.z = -8;
  
  // Add components to the group
  truckGroup.add(bed);
  truckGroup.add(leftRail);
  truckGroup.add(rightRail);
  truckGroup.add(connection);
  truckGroup.add(crate1);
  truckGroup.add(crate2);
  truckGroup.add(strap1);
  truckGroup.add(strap2);
  
  return truckGroup;
}

// Export the trailer creation functions
export { createDryVanTrailer, createFlatbedTrailer }; 