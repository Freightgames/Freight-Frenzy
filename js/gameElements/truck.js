import * as textures from './textures.js';

// Pre-create textures
const cabFrontTexture = textures.createCabFrontTexture();
const cabSideTexture = textures.createCabSideTexture();
const plainBlueTexture = textures.createPlainTexture('#0066ff');
const plainWhiteTexture = textures.createPlainTexture('#ffffff');
const trailerBackTexture = textures.createTrailerBackTexture();
const treadTexture = textures.createTreadTexture();
const rimTexture = textures.createRimTexture();

// Function to create a truck with the specified type
export function createTruck(randomTruck = false) {
    const truckGroup = new THREE.Group();

    let truckType = randomTruck ? (
        // Randomly select one of the three truck types
        ['flipFlopSpecial', 'oldTimer', 'strongSoloSergey'][Math.floor(Math.random() * 3)]
    ) : window.selectedTruckType || 'flipFlopSpecial';
    
    // Create the cab based on selected truck type
    switch(truckType) {
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
            createFlipFlopSpecialCab(truckGroup); // Default to Flip Flop Special
    }

    let trailerType = randomTruck ? (
        // Randomly select one of the three trailer types
        ['dryVan', 'flatbed', 'refrigerated'][Math.floor(Math.random() * 3)]
    ) : window.selectedTrailerType || 'dryVan';
    
    // Create the trailer based on selected trailer type
    switch(trailerType) {
        case 'dryVan':
            createDryVanTrailer(truckGroup);
            break;
        case 'flatbed':
            createFlatbedTrailer(truckGroup);
            break;
        default:
            createDryVanTrailer(truckGroup); // Default to Dry Van
    }
    
    // Add wheels to both cab and trailer
    addWheels(truckGroup, truckType, trailerType);
    
    truckGroup.position.y = 1;
    return truckGroup;
}

// Create the Flip Flop Special cab (aerodynamic Volvo)
export function createFlipFlopSpecialCab(truckGroup) {
    // Create a more aerodynamic, modern cab
    const cabGeometry = new THREE.BoxGeometry(2.5, 2.5, 4, 16, 16, 16);
    
    // Create a blue cab with sleek design
    const cabMaterials = [
        new THREE.MeshPhongMaterial({ map: cabSideTexture, color: 0x0066cc, shininess: 80 }),
        new THREE.MeshPhongMaterial({ map: cabSideTexture, color: 0x0066cc, shininess: 80 }),
        new THREE.MeshPhongMaterial({ color: 0x0066cc }),
        new THREE.MeshPhongMaterial({ color: 0x0066cc }),
        new THREE.MeshPhongMaterial({ map: cabFrontTexture, color: 0x0066cc, shininess: 80 }),
        new THREE.MeshPhongMaterial({ color: 0x0066cc })
    ];
    
    const cab = new THREE.Mesh(cabGeometry, cabMaterials);
    cab.position.y = 1.75;
    cab.castShadow = true;
    
    // Add aerodynamic spoiler on top
    const spoilerGeometry = new THREE.BoxGeometry(2.4, 0.5, 1);
    const spoilerMaterial = new THREE.MeshPhongMaterial({ color: 0x004080, shininess: 50 });
    const spoiler = new THREE.Mesh(spoilerGeometry, spoilerMaterial);
    spoiler.position.set(0, 2.5, -1);
    cab.add(spoiler);
    
    truckGroup.add(cab);
    
    // Add larger, more modern windows
    const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7 });
    const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.2), windowMaterial);
    frontWindow.position.set(0, 2, -1.99);
    frontWindow.rotation.y = Math.PI;
    truckGroup.add(frontWindow);
    
    const sideWindowGeometry = new THREE.PlaneGeometry(1.8, 1.2);
    const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
    leftWindow.position.set(-1.26, 2, 0);
    leftWindow.rotation.y = -Math.PI / 2;
    truckGroup.add(leftWindow);
    
    const rightWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
    rightWindow.position.set(1.26, 2, 0);
    rightWindow.rotation.y = Math.PI / 2;
    truckGroup.add(rightWindow);
    
    // Add modern LED headlights
    const headlightMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        emissive: 0xffffff, 
        emissiveIntensity: 1 
    });
    const headlightGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.1);
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-1, 0.8, -1.95);
    truckGroup.add(leftHeadlight);
    
    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(1, 0.8, -1.95);
    truckGroup.add(rightHeadlight);
    
    // Add chrome exhaust stacks
    const exhaustGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 16);
    const exhaustMaterial = new THREE.MeshPhongMaterial({ color: 0xc0c0c0, shininess: 100 });
    const leftExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    leftExhaust.position.set(-1.2, 2.5, 1.5);
    truckGroup.add(leftExhaust);
}

// Create the Old Timer cab (classic Mack)
export function createOldTimerCab(truckGroup) {
    // Create a longer, boxier cab with traditional styling
    const cabGeometry = new THREE.BoxGeometry(2.5, 2.8, 5, 16, 16, 16);
    
    // Create a red cab with classic style
    const cabMaterials = [
        new THREE.MeshPhongMaterial({ map: cabSideTexture, color: 0xaa0000, shininess: 50 }),
        new THREE.MeshPhongMaterial({ map: cabSideTexture, color: 0xaa0000, shininess: 50 }),
        new THREE.MeshPhongMaterial({ color: 0xaa0000 }),
        new THREE.MeshPhongMaterial({ color: 0xaa0000 }),
        new THREE.MeshPhongMaterial({ map: cabFrontTexture, color: 0xaa0000, shininess: 50 }),
        new THREE.MeshPhongMaterial({ color: 0xaa0000 })
    ];
    
    const cab = new THREE.Mesh(cabGeometry, cabMaterials);
    cab.position.y = 1.9;
    cab.position.z = -0.5; // Move back to accommodate the longer hood
    cab.castShadow = true;
    truckGroup.add(cab);
    
    // Add large classic hood
    const hoodGeometry = new THREE.BoxGeometry(2.3, 1.5, 3);
    const hoodMaterial = new THREE.MeshPhongMaterial({ color: 0xaa0000, shininess: 50 });
    const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
    hood.position.set(0, 1.25, -3.5);
    truckGroup.add(hood);
    
    // Add classic grill
    const grillGeometry = new THREE.BoxGeometry(2.2, 1.4, 0.2);
    const grillMaterial = new THREE.MeshPhongMaterial({ color: 0xc0c0c0, shininess: 100 });
    const grill = new THREE.Mesh(grillGeometry, grillMaterial);
    grill.position.set(0, 1.25, -4.8);
    truckGroup.add(grill);
    
    // Add smaller windows (classic style)
    const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7 });
    const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1), windowMaterial);
    frontWindow.position.set(0, 2.3, -0.99);
    frontWindow.rotation.y = Math.PI;
    truckGroup.add(frontWindow);
    
    const sideWindowGeometry = new THREE.PlaneGeometry(1.2, 1);
    const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
    leftWindow.position.set(-1.26, 2.3, -0.5);
    leftWindow.rotation.y = -Math.PI / 2;
    truckGroup.add(leftWindow);
    
    const rightWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
    rightWindow.position.set(1.26, 2.3, -0.5);
    rightWindow.rotation.y = Math.PI / 2;
    truckGroup.add(rightWindow);
    
    // Add classic round headlights
    const headlightMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffcc, 
        emissive: 0xffffcc, 
        emissiveIntensity: 0.8
    });
    const headlightGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.8, 1.3, -4.9);
    leftHeadlight.scale.z = 0.3;
    truckGroup.add(leftHeadlight);
    
    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(0.8, 1.3, -4.9);
    rightHeadlight.scale.z = 0.3;
    truckGroup.add(rightHeadlight);
    
    // Add large chrome exhaust stacks
    const exhaustGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 16);
    const exhaustMaterial = new THREE.MeshPhongMaterial({ color: 0xc0c0c0, shininess: 100 });
    const leftExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    leftExhaust.position.set(-1.2, 3, -1);
    truckGroup.add(leftExhaust);
    
    const rightExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    rightExhaust.position.set(1.2, 3, -1);
    truckGroup.add(rightExhaust);
}

// Create the Strong Solo Sergey cab (beat-up freightliner)
export function createStrongSoloSergeyCab(truckGroup) {
    // Create a slightly worn cab
    const cabGeometry = new THREE.BoxGeometry(2.5, 2.6, 4.5, 16, 16, 16);
    
    // Create a gray cab with scuff marks
    const cabMaterials = [
        new THREE.MeshPhongMaterial({ map: cabSideTexture, color: 0x666666, shininess: 30 }),
        new THREE.MeshPhongMaterial({ map: cabSideTexture, color: 0x666666, shininess: 30 }),
        new THREE.MeshPhongMaterial({ color: 0x666666 }),
        new THREE.MeshPhongMaterial({ color: 0x666666 }),
        new THREE.MeshPhongMaterial({ map: cabFrontTexture, color: 0x666666, shininess: 30 }),
        new THREE.MeshPhongMaterial({ color: 0x666666 })
    ];
    
    const cab = new THREE.Mesh(cabGeometry, cabMaterials);
    cab.position.y = 1.8;
    cab.position.z = -0.2;
    cab.castShadow = true;
    truckGroup.add(cab);
    
    // Add scuffed, dented hood
    const hoodGeometry = new THREE.BoxGeometry(2.4, 1.4, 2.5);
    const hoodMaterial = new THREE.MeshPhongMaterial({ color: 0x666666, shininess: 10 });
    const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
    hood.position.set(0, 1.2, -3);
    
    // Add dent to the hood (by deforming a vertex)
    const hoodVertices = hood.geometry.attributes.position;
    const dentIndex = 20; // Some vertex on top of hood
    hoodVertices.setY(dentIndex, hoodVertices.getY(dentIndex) - 0.3);
    hoodVertices.needsUpdate = true;
    
    truckGroup.add(hood);
    
    // Add scuffed windows
    const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.6 });
    const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.1), windowMaterial);
    frontWindow.position.set(0, 2.1, -0.99);
    frontWindow.rotation.y = Math.PI;
    truckGroup.add(frontWindow);
    
    const sideWindowGeometry = new THREE.PlaneGeometry(1.4, 1.1);
    const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
    leftWindow.position.set(-1.26, 2.1, -0.2);
    leftWindow.rotation.y = -Math.PI / 2;
    truckGroup.add(leftWindow);
    
    const rightWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
    rightWindow.position.set(1.26, 2.1, -0.2);
    rightWindow.rotation.y = Math.PI / 2;
    truckGroup.add(rightWindow);
    
    // Add mismatched headlights
    const leftHeadlightMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffff00, 
        emissive: 0xffff00, 
        emissiveIntensity: 0.7
    });
    const rightHeadlightMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffcc, 
        emissive: 0xffffcc, 
        emissiveIntensity: 0.9
    });
    
    const headlightGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const leftHeadlight = new THREE.Mesh(headlightGeometry, leftHeadlightMaterial);
    leftHeadlight.position.set(-0.9, 1.3, -4.2);
    leftHeadlight.scale.z = 0.3;
    truckGroup.add(leftHeadlight);
    
    const rightHeadlight = new THREE.Mesh(headlightGeometry, rightHeadlightMaterial);
    rightHeadlight.position.set(0.9, 1.3, -4.2);
    rightHeadlight.scale.z = 0.3;
    truckGroup.add(rightHeadlight);
    
    // Add rusted exhaust stack
    const exhaustGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2.8, 16);
    const exhaustMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513, shininess: 10 });
    const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    exhaust.position.set(-1.2, 2.8, 0);
    truckGroup.add(exhaust);
    
    // Add a few rusty spots (small cylinders)
    const rustSpots = [
        { x: -1.2, y: 1.5, z: -1.5 },
        { x: 1.0, y: 1.3, z: -0.5 },
        { x: 0.8, y: 1.7, z: 0.8 }
    ];
    
    const rustMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    rustSpots.forEach(spot => {
        const rustGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8);
        const rustSpot = new THREE.Mesh(rustGeometry, rustMaterial);
        rustSpot.position.set(spot.x, spot.y, spot.z);
        rustSpot.rotation.x = Math.PI / 2;
        truckGroup.add(rustSpot);
    });
}

// Create a standard dry van trailer
export function createDryVanTrailer(truckGroup) {
    const trailerGeometry = new THREE.BoxGeometry(2.5, 3, 10);
    
    // White trailer with company logos
    const trailerMaterials = [
        new THREE.MeshPhongMaterial({ map: textures.createTrailerSideTexture() }),
        new THREE.MeshPhongMaterial({ map: textures.createTrailerSideTexture() }),
        new THREE.MeshPhongMaterial({ map: plainWhiteTexture }),
        new THREE.MeshPhongMaterial({ map: plainWhiteTexture }),
        new THREE.MeshPhongMaterial({ map: plainWhiteTexture }),
        new THREE.MeshPhongMaterial({ map: trailerBackTexture })
    ];
    
    const trailer = new THREE.Mesh(trailerGeometry, trailerMaterials);
    trailer.position.z = 7;
    trailer.position.y = 2;
    trailer.castShadow = true;
    truckGroup.add(trailer);
}

// Create a flatbed trailer
export function createFlatbedTrailer(truckGroup) {
    // Create the main flatbed platform
    const flatbedGeometry = new THREE.BoxGeometry(2.5, 0.5, 10);
    const flatbedMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 30 });
    const flatbed = new THREE.Mesh(flatbedGeometry, flatbedMaterial);
    flatbed.position.z = 7;
    flatbed.position.y = 0.75;
    flatbed.castShadow = true;
    truckGroup.add(flatbed);
    
    // Add side rails
    const railGeometry = new THREE.BoxGeometry(0.1, 0.3, 10);
    const railMaterial = new THREE.MeshPhongMaterial({ color: 0x666666, shininess: 50 });
    
    const leftRail = new THREE.Mesh(railGeometry, railMaterial);
    leftRail.position.set(-1.2, 1.1, 7);
    truckGroup.add(leftRail);
    
    const rightRail = new THREE.Mesh(railGeometry, railMaterial);
    rightRail.position.set(1.2, 1.1, 7);
    truckGroup.add(rightRail);
    
    // Add front headboard to protect the cab
    const headboardGeometry = new THREE.BoxGeometry(2.5, 1.5, 0.2);
    const headboardMaterial = new THREE.MeshPhongMaterial({ color: 0x666666, shininess: 30 });
    const headboard = new THREE.Mesh(headboardGeometry, headboardMaterial);
    headboard.position.set(0, 1.5, 2.1);
    truckGroup.add(headboard);
    
    // Add some cargo (random boxes)
    const cargoMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    
    // First cargo box
    const cargo1Geometry = new THREE.BoxGeometry(2, 1.5, 3);
    const cargo1 = new THREE.Mesh(cargo1Geometry, cargoMaterial);
    cargo1.position.set(0, 1.75, 4);
    truckGroup.add(cargo1);
    
    // Second cargo box
    const cargo2Geometry = new THREE.BoxGeometry(1.5, 1.2, 2);
    const cargo2 = new THREE.Mesh(cargo2Geometry, cargoMaterial);
    cargo2.position.set(0, 1.6, 8);
    truckGroup.add(cargo2);
    
    // Add tie-down straps (thin black lines across cargo)
    const strapGeometry = new THREE.BoxGeometry(2.6, 0.05, 0.05);
    const strapMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    const positions = [
        { z: 3, y: 2.5 },
        { z: 5, y: 2.5 },
        { z: 7, y: 2.2 },
        { z: 9, y: 2.2 }
    ];
    
    positions.forEach(pos => {
        const strap = new THREE.Mesh(strapGeometry, strapMaterial);
        strap.position.set(0, pos.y, pos.z);
        truckGroup.add(strap);
    });
}

// Add wheels to the truck and trailer based on the type
export function addWheels(truckGroup, truckType, trailerType) {
    // Wheel styling differs by truck type
    let rimColor, treadDetail;
    
    switch(truckType) {
        case 'flipFlopSpecial':
            rimColor = 0xC0C0C0; // Chrome rims for modern truck
            treadDetail = 0.15;
            break;
        case 'oldTimer':
            rimColor = 0x333333; // Black rims for classic truck
            treadDetail = 0.1;
            break;
        case 'strongSoloSergey':
            rimColor = 0x555555; // Gray weathered rims
            treadDetail = 0.05; // Worn treads
            break;
        default:
            rimColor = 0xC0C0C0;
            treadDetail = 0.15;
    }
    
    const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.6, 32);
    const wheelMaterials = [
        new THREE.MeshPhongMaterial({ map: treadTexture, bumpScale: treadDetail }),
        new THREE.MeshPhongMaterial({ map: rimTexture, color: rimColor, shininess: 100 }),
        new THREE.MeshPhongMaterial({ map: rimTexture, color: rimColor, shininess: 100 })
    ];
    
    // Different wheel configurations based on truck and trailer type
    let wheelPositions = [];
    
    // Cab wheels - positions depend on truck type
    if (truckType === 'oldTimer') {
        // Old timer has front wheels further forward
        wheelPositions = wheelPositions.concat([
            [-1.35, -0.2, -3.5], [1.35, -0.2, -3.5], // Front wheels
            [-1.35, -0.2, -1], [1.35, -0.2, -1]      // Rear cab wheels
        ]);
    } else if (truckType === 'strongSoloSergey') {
        // Sergey has a slightly different wheel arrangement
        wheelPositions = wheelPositions.concat([
            [-1.35, -0.2, -2.5], [1.35, -0.2, -2.5], // Front wheels
            [-1.35, -0.2, -0.5], [1.35, -0.2, -0.5]  // Rear cab wheels
        ]);
    } else {
        // Flip Flop Special (default) wheel arrangement
        wheelPositions = wheelPositions.concat([
            [-1.35, -0.2, -1], [1.35, -0.2, -1], // Front wheels
            [-1.35, -0.2, 1], [1.35, -0.2, 1]    // Rear cab wheels
        ]);
    }
    
    // Trailer wheels - positions depend on trailer type
    if (trailerType === 'flatbed') {
        // Flatbed has wheels in different positions
        wheelPositions = wheelPositions.concat([
            [-1.35, -0.2, 5.5], [1.35, -0.2, 5.5],
            [-1.35, -0.2, 7], [1.35, -0.2, 7],
            [-1.35, -0.2, 8.5], [1.35, -0.2, 8.5]
        ]);
    } else {
        // Dry van trailer (default) wheel arrangement
        wheelPositions = wheelPositions.concat([
            [-1.35, -0.2, 5], [1.35, -0.2, 5],
            [-1.35, -0.2, 7], [1.35, -0.2, 7],
            [-1.35, -0.2, 9], [1.35, -0.2, 9]
        ]);
    }
    
    // Create all wheels at specified positions
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterials);
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        truckGroup.add(wheel);
    });
}

// Function to create a vibrating aura effect for invincibility
export function createInvincibilityAura() {
    const auraGroup = new THREE.Group();
    
    // Create a glowing effect around the truck
    const auraGeometry = new THREE.BoxGeometry(5, 3, 15);
    const auraMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3
    });
    
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    aura.position.y = 0.5;
    auraGroup.add(aura);
    
    // Add animation for the aura
    const animate = function() {
        if (!auraGroup.parent) return; // Stop if no longer in scene
        
        // Random vibration effect
        aura.position.x = (Math.random() - 0.5) * 0.3;
        aura.position.z = (Math.random() - 0.5) * 0.3;
        
        // Pulsing opacity
        auraMaterial.opacity = 0.2 + Math.sin(Date.now() * 0.005) * 0.15;
        
        requestAnimationFrame(animate);
    };
    
    animate();
    return auraGroup;
} 