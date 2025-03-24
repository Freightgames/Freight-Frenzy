// Wheel Factory Module
import { createTreadTexture, createRimTexture } from './textures.js';

/**
 * Add wheels to a truck and trailer
 * @param {THREE.Group} truckGroup - The truck group to add wheels to
 * @param {string} truckType - The type of truck ('flipFlopSpecial', 'oldTimer', 'strongSoloSergey')
 * @param {string} trailerType - The type of trailer ('dryVan', 'flatbed')
 * @returns {THREE.Group} The updated truck group with wheels
 */
export function addWheels(truckGroup, truckType, trailerType) {
  // Create wheel textures
  const treadTexture = createTreadTexture();
  const rimTexture = createRimTexture();
  
  // Materials for wheels
  const tireMaterial = new THREE.MeshLambertMaterial({ map: treadTexture });
  const rimMaterial = new THREE.MeshLambertMaterial({ map: rimTexture });
  
  // Add truck wheels based on truck type
  switch (truckType) {
    case 'flipFlopSpecial':
      addFlipFlopWheels(truckGroup, tireMaterial, rimMaterial);
      break;
    case 'oldTimer':
      addOldTimerWheels(truckGroup, tireMaterial, rimMaterial);
      break;
    case 'strongSoloSergey':
      addSergeysWheels(truckGroup, tireMaterial, rimMaterial);
      break;
    default:
      addFlipFlopWheels(truckGroup, tireMaterial, rimMaterial);
  }
  
  // Add trailer wheels based on trailer type
  if (trailerType === 'dryVan' || trailerType === 'flatbed') {
    addTrailerWheels(truckGroup, tireMaterial, rimMaterial, trailerType);
  }
  
  return truckGroup;
}

/**
 * Add wheels to Flip Flop Special cab
 * @param {THREE.Group} truckGroup - The truck group
 * @param {THREE.Material} tireMaterial - Material for tires
 * @param {THREE.Material} rimMaterial - Material for rims
 */
function addFlipFlopWheels(truckGroup, tireMaterial, rimMaterial) {
  // Front wheels (smaller)
  addWheel(truckGroup, -0.9, 0.4, 0.7, 0.35, tireMaterial, rimMaterial);
  addWheel(truckGroup, 0.9, 0.4, 0.7, 0.35, tireMaterial, rimMaterial);
  
  // Rear wheels (larger, dual)
  addDualWheel(truckGroup, -0.95, 0.4, -1.8, 0.4, tireMaterial, rimMaterial);
  addDualWheel(truckGroup, 0.95, 0.4, -1.8, 0.4, tireMaterial, rimMaterial);
}

/**
 * Add wheels to Old Timer cab
 * @param {THREE.Group} truckGroup - The truck group
 * @param {THREE.Material} tireMaterial - Material for tires
 * @param {THREE.Material} rimMaterial - Material for rims
 */
function addOldTimerWheels(truckGroup, tireMaterial, rimMaterial) {
  // Front wheels (smaller)
  addWheel(truckGroup, -0.9, 0.4, 1.5, 0.4, tireMaterial, rimMaterial);
  addWheel(truckGroup, 0.9, 0.4, 1.5, 0.4, tireMaterial, rimMaterial);
  
  // Rear wheels (larger, dual)
  addDualWheel(truckGroup, -0.95, 0.4, -1.2, 0.4, tireMaterial, rimMaterial);
  addDualWheel(truckGroup, 0.95, 0.4, -1.2, 0.4, tireMaterial, rimMaterial);
}

/**
 * Add wheels to Strong Solo Sergey cab
 * @param {THREE.Group} truckGroup - The truck group
 * @param {THREE.Material} tireMaterial - Material for tires
 * @param {THREE.Material} rimMaterial - Material for rims
 */
function addSergeysWheels(truckGroup, tireMaterial, rimMaterial) {
  // Front wheels
  addWheel(truckGroup, -0.9, 0.4, 1.0, 0.4, tireMaterial, rimMaterial);
  addWheel(truckGroup, 0.9, 0.4, 1.0, 0.4, tireMaterial, rimMaterial);
  
  // Rear wheels (dual)
  addDualWheel(truckGroup, -0.95, 0.4, -1.5, 0.4, tireMaterial, rimMaterial);
  addDualWheel(truckGroup, 0.95, 0.4, -1.5, 0.4, tireMaterial, rimMaterial);
}

/**
 * Add wheels to trailer
 * @param {THREE.Group} truckGroup - The truck group
 * @param {THREE.Material} tireMaterial - Material for tires
 * @param {THREE.Material} rimMaterial - Material for rims
 * @param {string} trailerType - Type of trailer
 */
function addTrailerWheels(truckGroup, tireMaterial, rimMaterial, trailerType) {
  // Trailer wheels are similar for both trailer types
  // Create two sets of tandem axles
  
  // First axle
  addDualWheel(truckGroup, -0.95, 0.4, -5.5, 0.4, tireMaterial, rimMaterial);
  addDualWheel(truckGroup, 0.95, 0.4, -5.5, 0.4, tireMaterial, rimMaterial);
  
  // Second axle
  addDualWheel(truckGroup, -0.95, 0.4, -6.5, 0.4, tireMaterial, rimMaterial);
  addDualWheel(truckGroup, 0.95, 0.4, -6.5, 0.4, tireMaterial, rimMaterial);
  
  // For flatbed, add axle supports
  if (trailerType === 'flatbed') {
    const axleGeometry = new THREE.BoxGeometry(2.2, 0.2, 0.2);
    const axleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    const axle1 = new THREE.Mesh(axleGeometry, axleMaterial);
    axle1.position.set(0, 0.4, -5.5);
    truckGroup.add(axle1);
    
    const axle2 = new THREE.Mesh(axleGeometry, axleMaterial);
    axle2.position.set(0, 0.4, -6.5);
    truckGroup.add(axle2);
  }
}

/**
 * Add a single wheel
 * @param {THREE.Group} group - The group to add the wheel to
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @param {number} radius - Wheel radius
 * @param {THREE.Material} tireMaterial - Material for tire
 * @param {THREE.Material} rimMaterial - Material for rim
 */
function addWheel(group, x, y, z, radius, tireMaterial, rimMaterial) {
  // Create wheel group
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(x, y, z);
  
  // Create tire
  const tireGeometry = new THREE.CylinderGeometry(radius, radius, 0.35, 24);
  tireGeometry.rotateX(Math.PI / 2);
  const tire = new THREE.Mesh(tireGeometry, tireMaterial);
  tire.castShadow = true;
  
  // Create rim
  const rimGeometry = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, 0.36, 24);
  rimGeometry.rotateX(Math.PI / 2);
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  
  // Add tire and rim to wheel group
  wheelGroup.add(tire);
  wheelGroup.add(rim);
  
  // Add wheel group to parent group
  group.add(wheelGroup);
  
  return wheelGroup;
}

/**
 * Add a dual wheel (two wheels side by side)
 * @param {THREE.Group} group - The group to add the wheels to
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @param {number} radius - Wheel radius
 * @param {THREE.Material} tireMaterial - Material for tire
 * @param {THREE.Material} rimMaterial - Material for rim
 */
function addDualWheel(group, x, y, z, radius, tireMaterial, rimMaterial) {
  // Create wheel group
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(x, y, z);
  
  // Inner wheel
  const innerTireGeometry = new THREE.CylinderGeometry(radius, radius, 0.3, 24);
  innerTireGeometry.rotateX(Math.PI / 2);
  const innerTire = new THREE.Mesh(innerTireGeometry, tireMaterial);
  innerTire.position.set(0.18, 0, 0);
  innerTire.castShadow = true;
  
  const innerRimGeometry = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, 0.31, 24);
  innerRimGeometry.rotateX(Math.PI / 2);
  const innerRim = new THREE.Mesh(innerRimGeometry, rimMaterial);
  innerRim.position.set(0.18, 0, 0);
  
  // Outer wheel
  const outerTireGeometry = new THREE.CylinderGeometry(radius, radius, 0.3, 24);
  outerTireGeometry.rotateX(Math.PI / 2);
  const outerTire = new THREE.Mesh(outerTireGeometry, tireMaterial);
  outerTire.position.set(-0.18, 0, 0);
  outerTire.castShadow = true;
  
  const outerRimGeometry = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, 0.31, 24);
  outerRimGeometry.rotateX(Math.PI / 2);
  const outerRim = new THREE.Mesh(outerRimGeometry, rimMaterial);
  outerRim.position.set(-0.18, 0, 0);
  
  // Add tires and rims to wheel group
  wheelGroup.add(innerTire);
  wheelGroup.add(innerRim);
  wheelGroup.add(outerTire);
  wheelGroup.add(outerRim);
  
  // Add wheel group to parent group
  group.add(wheelGroup);
  
  return wheelGroup;
} 