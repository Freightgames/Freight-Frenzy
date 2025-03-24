// Environment Generator Module
import * as THREE from 'three';
import { GAME_SETTINGS } from '../config/constants.js';

// Environment state
let environmentObjects = [];
let currentRegion = 'plains';
let regions = {
  plains: {
    groundColor: 0x7CFC00, // Light green
    skyColor: 0x87CEEB, // Sky blue
    treeDensity: 0.3,
    mountainDensity: 0.1,
    billboardDensity: 0.05
  },
  desert: {
    groundColor: 0xC2B280, // Tan/sand color
    skyColor: 0x87CEEB, // Sky blue
    treeDensity: 0.1,
    mountainDensity: 0.2,
    billboardDensity: 0.03
  },
  forest: {
    groundColor: 0x228B22, // Forest green
    skyColor: 0x87CEEB, // Sky blue
    treeDensity: 0.7,
    mountainDensity: 0.3,
    billboardDensity: 0.02
  },
  mountains: {
    groundColor: 0x8B4513, // Brown
    skyColor: 0x87CEEB, // Sky blue
    treeDensity: 0.3,
    mountainDensity: 0.8,
    billboardDensity: 0.01
  }
};

// Billboard content for roadside advertisements
const billboardContent = [
  { type: 'image', content: './billboard-images/freight360.png', weight: 1.1 },
  { type: 'image', content: './billboard-images/loadpartner.png', weight: 1.1 },
  { type: 'image', content: './billboard-images/wtt.jpg', weight: 1.2 },
  { type: 'image', content: './billboard-images/scrm.png', weight: 1.2 },
  { type: 'text', content: 'Got Freight?', weight: 1.0 },
  { type: 'text', content: 'Exit Now: Lot Lizard Emporium', weight: 0.8 },
  { type: 'text', content: 'Cletus Chicken - Next Exit', weight: 0.7 },
  { type: 'text', content: 'Keep on Truckin!', weight: 0.9 },
  { type: 'text', content: 'Weigh Station 5 Miles', weight: 0.6 },
  { type: 'text', content: 'Big Rigs Welcome!', weight: 0.5 },
  { type: 'text', content: 'America Runs On Truckers', weight: 0.5 },
  { type: 'text', content: 'Gas, Food, Lodging - Next Exit', weight: 0.4 }
];

/**
 * Initialize the environment generator
 * @param {THREE.Scene} scene - The Three.js scene
 * @returns {Object} - Environment generator instance
 */
export function initEnvironmentGenerator(scene) {
  if (!scene) {
    console.error("Scene is required for environment generator");
    return null;
  }
  
  // Set up sky and lighting
  setupSkyAndLighting(scene);
  
  // Set up ground plane
  setupGround(scene);
  
  // Clear any existing environment objects
  clearEnvironmentObjects(scene);
  
  console.log("Environment generator initialized");
  
  return {
    getEnvironmentObjects: () => environmentObjects,
    update: (playerPosition, scene) => updateEnvironment(playerPosition, scene),
    setRegion: (region, scene) => changeRegion(region, scene)
  };
}

/**
 * Set up the sky and lighting for the scene
 * @param {THREE.Scene} scene - The Three.js scene
 */
function setupSkyAndLighting(scene) {
  if (!scene) return;
  
  // Set sky color
  scene.background = new THREE.Color(regions[currentRegion].skyColor);
  
  // Add fog
  scene.fog = new THREE.Fog(
    regions[currentRegion].skyColor, 
    100, // Near
    GAME_SETTINGS.RENDER_DISTANCE * 0.8 // Far
  );
  
  // Remove existing lights
  scene.children.forEach(child => {
    if (child.isLight) {
      scene.remove(child);
    }
  });
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  // Add directional light (sun)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(100, 100, 0);
  directionalLight.castShadow = true;
  
  // Set up shadows
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  
  scene.add(directionalLight);
}

/**
 * Set up the ground plane
 * @param {THREE.Scene} scene - The Three.js scene
 */
function setupGround(scene) {
  if (!scene) return;
  
  // Remove existing ground
  scene.children.forEach(child => {
    if (child.userData && child.userData.isGround) {
      scene.remove(child);
    }
  });
  
  // Create ground geometry
  const groundGeometry = new THREE.PlaneGeometry(2000, GAME_SETTINGS.RENDER_DISTANCE * 2);
  
  // Create ground material
  const groundMaterial = new THREE.MeshLambertMaterial({
    color: regions[currentRegion].groundColor,
    side: THREE.DoubleSide
  });
  
  // Create ground mesh
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.1;
  ground.position.z = GAME_SETTINGS.RENDER_DISTANCE / 2;
  ground.receiveShadow = true;
  
  // Tag as ground for later identification
  ground.userData = { isGround: true };
  
  scene.add(ground);
}

/**
 * Clear all environment objects from the scene
 * @param {THREE.Scene} scene - The Three.js scene
 */
function clearEnvironmentObjects(scene) {
  if (!scene) return;
  
  // Remove existing environment objects from scene
  environmentObjects.forEach(obj => {
    if (obj.mesh && scene) {
      scene.remove(obj.mesh);
    }
  });
  
  environmentObjects = [];
}

/**
 * Update the environment based on player position
 * @param {THREE.Vector3} playerPosition - Current player position
 * @param {THREE.Scene} scene - The Three.js scene
 */
function updateEnvironment(playerPosition, scene) {
  if (!scene) return;
  
  const playerDistanceZ = playerPosition.z;
  const renderDistance = GAME_SETTINGS.RENDER_DISTANCE;
  
  // Remove objects too far behind the player
  environmentObjects = environmentObjects.filter(obj => {
    if (obj.position.z < playerDistanceZ - 200) {
      scene.remove(obj.mesh);
      return false;
    }
    return true;
  });
  
  // Check if we need to add new objects ahead
  const furthestObjectZ = environmentObjects.reduce(
    (max, obj) => Math.max(max, obj.position.z),
    playerDistanceZ
  );
  
  // Generate new scenery if needed
  if (furthestObjectZ < playerDistanceZ + renderDistance) {
    // Generate objects from furthest point to render distance
    const startZ = furthestObjectZ;
    const endZ = playerDistanceZ + renderDistance;
    
    // Generate trees, mountains, etc.
    generateScenery(scene, startZ, endZ);
    
    // Randomly change region
    if (Math.random() < 0.01) {
      const regionKeys = Object.keys(regions);
      const randomRegion = regionKeys[Math.floor(Math.random() * regionKeys.length)];
      changeRegion(randomRegion, scene);
    }
  }
}

/**
 * Generate scenery objects within a distance range
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {number} startZ - Start distance
 * @param {number} endZ - End distance
 */
function generateScenery(scene, startZ, endZ) {
  const roadWidth = GAME_SETTINGS.ROAD_WIDTH;
  const regionSettings = regions[currentRegion];
  
  // Define the spacing between objects
  const spacing = 20;
  
  // Generate objects at regular intervals
  for (let z = startZ; z < endZ; z += spacing) {
    // Determine lateral positions (left and right of road)
    const leftX = -(roadWidth / 2 + 10 + Math.random() * 20);
    const rightX = roadWidth / 2 + 10 + Math.random() * 20;
    
    // Generate trees on left side
    if (Math.random() < regionSettings.treeDensity) {
      const treeType = Math.random() < 0.7 ? 'pine' : 'deciduous';
      const tree = createTree(treeType, leftX, 0, z);
      scene.add(tree.mesh);
      environmentObjects.push(tree);
    }
    
    // Generate trees on right side
    if (Math.random() < regionSettings.treeDensity) {
      const treeType = Math.random() < 0.7 ? 'pine' : 'deciduous';
      const tree = createTree(treeType, rightX, 0, z);
      scene.add(tree.mesh);
      environmentObjects.push(tree);
    }
    
    // Generate mountains (further away from road)
    if (Math.random() < regionSettings.mountainDensity) {
      const side = Math.random() < 0.5 ? -1 : 1; // Left or right
      const mountainX = side * (roadWidth / 2 + 50 + Math.random() * 100);
      const mountain = createMountain(mountainX, 0, z);
      scene.add(mountain.mesh);
      environmentObjects.push(mountain);
    }
    
    // Generate billboards
    if (Math.random() < regionSettings.billboardDensity) {
      const side = Math.random() < 0.5 ? -1 : 1; // Left or right
      const billboardX = side * (roadWidth / 2 + 15);
      const billboard = createBillboard(billboardX, 0, z);
      scene.add(billboard.mesh);
      environmentObjects.push(billboard);
    }
  }
}

/**
 * Create a tree object
 * @param {string} type - Type of tree ('pine' or 'deciduous')
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @returns {Object} - Tree object
 */
function createTree(type, x, y, z) {
  let group = new THREE.Group();
  
  if (type === 'pine') {
    // Create pine tree
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    
    const foliageGeometry = new THREE.ConeGeometry(3, 7, 8);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x006400 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 6;
    
    group.add(trunk);
    group.add(foliage);
  } else {
    // Create deciduous tree
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 5, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2.5;
    
    const foliageGeometry = new THREE.SphereGeometry(3, 8, 8);
    const foliageMaterial = new THREE.MeshLambertMaterial({
      color: Math.random() < 0.3 ? 0xFFAA33 : 0x228B22
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 7;
    
    group.add(trunk);
    group.add(foliage);
  }
  
  // Position the tree
  group.position.set(x, y, z);
  
  // Add some random rotation and scale variation
  group.rotation.y = Math.random() * Math.PI * 2;
  const scale = 0.7 + Math.random() * 0.6;
  group.scale.set(scale, scale, scale);
  
  // Set up shadows
  group.traverse(object => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  
  return {
    type: 'tree',
    treeType: type,
    position: new THREE.Vector3(x, y, z),
    mesh: group
  };
}

/**
 * Create a mountain object
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @returns {Object} - Mountain object
 */
function createMountain(x, y, z) {
  // Create a simple mountain using a cone
  const height = 30 + Math.random() * 70;
  const radius = height * 0.8;
  
  const geometry = new THREE.ConeGeometry(radius, height, 8);
  
  // Create material with some color variation
  const baseColor = regions[currentRegion].groundColor;
  const colorVariation = Math.random() * 0.2 - 0.1; // -0.1 to 0.1
  
  // Convert hex to RGB for manipulation
  const r = ((baseColor >> 16) & 255) / 255;
  const g = ((baseColor >> 8) & 255) / 255;
  const b = (baseColor & 255) / 255;
  
  // Apply variation and convert back to Color
  const mountainColor = new THREE.Color(
    Math.max(0, Math.min(1, r + colorVariation)),
    Math.max(0, Math.min(1, g + colorVariation)),
    Math.max(0, Math.min(1, b + colorVariation))
  );
  
  const material = new THREE.MeshLambertMaterial({ color: mountainColor });
  const mountain = new THREE.Mesh(geometry, material);
  
  // Position with base at ground level
  mountain.position.set(x, y + height / 2, z);
  
  // Add some random rotation
  mountain.rotation.y = Math.random() * Math.PI * 2;
  
  // Set up shadows
  mountain.castShadow = true;
  mountain.receiveShadow = true;
  
  return {
    type: 'mountain',
    position: new THREE.Vector3(x, y, z),
    mesh: mountain
  };
}

/**
 * Create a billboard object
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @returns {Object} - Billboard object
 */
function createBillboard(x, y, z) {
  // Select billboard content using weighted random selection
  const totalWeight = billboardContent.reduce((sum, content) => sum + content.weight, 0);
  let randomWeight = Math.random() * totalWeight;
  let selectedContent = billboardContent[0];
  
  for (const content of billboardContent) {
    randomWeight -= content.weight;
    if (randomWeight <= 0) {
      selectedContent = content;
      break;
    }
  }
  
  // Create billboard structure
  const postGeometry = new THREE.CylinderGeometry(0.5, 0.5, 15, 8);
  const postMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
  const post = new THREE.Mesh(postGeometry, postMaterial);
  post.position.y = 7.5;
  
  const billboardWidth = 12;
  const billboardHeight = 8;
  
  const billboardGeometry = new THREE.BoxGeometry(billboardWidth, billboardHeight, 0.5);
  const billboardMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const billboard = new THREE.Mesh(billboardGeometry, billboardMaterial);
  billboard.position.y = 15;
  
  // Create content for the billboard
  let contentMesh;
  
  if (selectedContent.type === 'image') {
    // Create texture for image billboard
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(selectedContent.content);
    
    // Create mesh with texture
    const contentGeometry = new THREE.PlaneGeometry(billboardWidth - 0.5, billboardHeight - 0.5);
    const contentMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    
    contentMesh = new THREE.Mesh(contentGeometry, contentMaterial);
  } else {
    // Create text billboard
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    
    const context = canvas.getContext('2d');
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'Bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#000000';
    
    // Handle multi-line text
    const words = selectedContent.content.split(' ');
    let line = '';
    let lines = [];
    let y = 128;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = context.measureText(testLine);
      
      if (metrics.width > canvas.width - 40 && line !== '') {
        lines.push(line);
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    
    // Adjust y-position based on number of lines
    const lineHeight = 60;
    const startY = 128 - (lines.length - 1) * lineHeight / 2;
    
    lines.forEach((line, index) => {
      context.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    
    // Create mesh with texture
    const contentGeometry = new THREE.PlaneGeometry(billboardWidth - 0.5, billboardHeight - 0.5);
    const contentMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    
    contentMesh = new THREE.Mesh(contentGeometry, contentMaterial);
  }
  
  // Position content on billboard
  contentMesh.position.y = 15;
  contentMesh.position.z = 0.3;
  
  // Create group and add meshes
  const group = new THREE.Group();
  group.add(post);
  group.add(billboard);
  group.add(contentMesh);
  
  // Position the group
  group.position.set(x, y, z);
  
  // Rotate to face the road
  if (x < 0) {
    group.rotation.y = -Math.PI / 2;
  } else {
    group.rotation.y = Math.PI / 2;
  }
  
  // Set up shadows
  group.traverse(object => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  
  return {
    type: 'billboard',
    contentType: selectedContent.type,
    content: selectedContent.content,
    position: new THREE.Vector3(x, y, z),
    mesh: group
  };
}

/**
 * Change the current region
 * @param {string} region - Region name
 * @param {THREE.Scene} scene - The Three.js scene
 */
function changeRegion(region, scene) {
  if (!regions[region]) {
    console.warn(`Region '${region}' not found`);
    return;
  }
  
  currentRegion = region;
  
  // Update sky and fog
  if (scene) {
    scene.background = new THREE.Color(regions[region].skyColor);
    if (scene.fog) {
      scene.fog.color = new THREE.Color(regions[region].skyColor);
    }
  }
  
  // Update ground
  setupGround(scene);
  
  console.log(`Changed region to ${region}`);
}

/**
 * Reset the environment generator
 * @param {THREE.Scene} scene - The Three.js scene
 */
export function resetEnvironmentGenerator(scene) {
  clearEnvironmentObjects(scene);
  setupSkyAndLighting(scene);
  setupGround(scene);
  
  // Set default region
  currentRegion = 'plains';
} 