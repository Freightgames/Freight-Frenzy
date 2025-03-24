// Vehicle Textures Module

/**
 * Create a cab front texture
 * @param {string} color - Hex color code for the cab
 * @returns {THREE.CanvasTexture} Texture for the front of the cab
 */
export function createCabFrontTexture(color = '#FF0000') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  
  // Fill with base color
  context.fillStyle = color;
  context.fillRect(0, 0, 256, 256);
  
  // Add windshield
  context.fillStyle = '#FFFFFF';
  context.fillRect(30, 30, 196, 100);
  
  // Add grille
  context.fillStyle = '#444444';
  context.fillRect(70, 150, 116, 80);
  
  // Create the texture
  return new THREE.CanvasTexture(canvas);
}

/**
 * Create a cab side texture
 * @param {string} color - Hex color code for the cab
 * @returns {THREE.CanvasTexture} Texture for the side of the cab
 */
export function createCabSideTexture(color = '#FF0000') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  
  // Fill with base color
  context.fillStyle = color;
  context.fillRect(0, 0, 256, 256);
  
  // Add window
  context.fillStyle = '#FFFFFF';
  context.fillRect(50, 50, 100, 80);
  
  // Add door handle
  context.fillStyle = '#888888';
  context.fillRect(170, 110, 30, 10);
  
  // Create the texture
  return new THREE.CanvasTexture(canvas);
}

/**
 * Create a plain color texture
 * @param {string} color - Hex color code
 * @returns {THREE.CanvasTexture} Solid color texture
 */
export function createPlainTexture(color = '#FFFFFF') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  
  // Fill with plain color
  context.fillStyle = color;
  context.fillRect(0, 0, 256, 256);
  
  // Create the texture
  return new THREE.CanvasTexture(canvas);
}

/**
 * Create a trailer side texture
 * @param {string} color - Hex color code for the trailer
 * @param {boolean} isDryVan - Whether this is a dry van trailer
 * @returns {THREE.CanvasTexture} Texture for the side of the trailer
 */
export function createTrailerSideTexture(color = '#FFFFFF', isDryVan = true) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  
  // Fill with base color
  context.fillStyle = color;
  context.fillRect(0, 0, 512, 256);
  
  if (isDryVan) {
    // Add company logo
    context.fillStyle = '#FF0000';
    context.font = 'bold 70px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('ACME', 256, 128);
    
    // Add ridge lines
    context.strokeStyle = '#CCCCCC';
    context.lineWidth = 2;
    
    for (let i = 0; i < 5; i++) {
      context.beginPath();
      context.moveTo(0, 40 + i * 40);
      context.lineTo(512, 40 + i * 40);
      context.stroke();
    }
  } else {
    // For flatbed, add boards and cargo tie-downs
    context.fillStyle = '#8B4513';
    
    // Add wooden planks
    for (let i = 0; i < 6; i++) {
      context.fillRect(0, 20 + i * 40, 512, 30);
    }
    
    // Add tie-down points
    context.fillStyle = '#444444';
    for (let i = 0; i < 10; i++) {
      context.fillRect(50 + i * 46, 10, 10, 236);
    }
  }
  
  // Create the texture
  return new THREE.CanvasTexture(canvas);
}

/**
 * Create a tire tread texture
 * @returns {THREE.CanvasTexture} Tire tread texture
 */
export function createTreadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  
  // Fill with black
  context.fillStyle = '#000000';
  context.fillRect(0, 0, 256, 256);
  
  // Add tread pattern
  context.fillStyle = '#222222';
  
  // Horizontal treads
  for (let i = 0; i < 8; i++) {
    context.fillRect(0, i * 32, 256, 16);
  }
  
  // Vertical treads
  for (let i = 0; i < 8; i++) {
    context.fillRect(i * 32, 0, 16, 256);
  }
  
  // Create the texture
  return new THREE.CanvasTexture(canvas);
}

/**
 * Create a wheel rim texture
 * @returns {THREE.CanvasTexture} Wheel rim texture
 */
export function createRimTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  
  // Fill with metallic color
  context.fillStyle = '#CCCCCC';
  context.fillRect(0, 0, 128, 128);
  
  // Center hole
  context.fillStyle = '#888888';
  context.beginPath();
  context.arc(64, 64, 16, 0, Math.PI * 2);
  context.fill();
  
  // Lug nuts
  context.fillStyle = '#444444';
  for (let i = 0; i < 6; i++) {
    const angle = i * Math.PI / 3;
    const x = 64 + Math.cos(angle) * 32;
    const y = 64 + Math.sin(angle) * 32;
    
    context.beginPath();
    context.arc(x, y, 6, 0, Math.PI * 2);
    context.fill();
  }
  
  // Rim edge
  context.strokeStyle = '#AAAAAA';
  context.lineWidth = 6;
  context.beginPath();
  context.arc(64, 64, 58, 0, Math.PI * 2);
  context.stroke();
  
  // Create the texture
  return new THREE.CanvasTexture(canvas);
}

/**
 * Create a trailer back texture with doors
 * @param {string} color - Hex color code for the trailer
 * @returns {THREE.CanvasTexture} Texture for the back of the trailer
 */
export function createTrailerBackTexture(color = '#FFFFFF') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  
  // Fill with base color
  context.fillStyle = color;
  context.fillRect(0, 0, 256, 256);
  
  // Add door lines
  context.strokeStyle = '#888888';
  context.lineWidth = 4;
  
  // Vertical center line
  context.beginPath();
  context.moveTo(128, 20);
  context.lineTo(128, 236);
  context.stroke();
  
  // Door handles
  context.fillStyle = '#444444';
  context.fillRect(110, 120, 15, 10);
  context.fillRect(131, 120, 15, 10);
  
  // Create the texture
  return new THREE.CanvasTexture(canvas);
} 