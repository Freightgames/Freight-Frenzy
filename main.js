// Initialize Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('game').appendChild(renderer.domElement);

// Game constants
const billboardMessages = [
    { weight: 1, type: 'text', content: 'HELL IS REAL' },
    { weight: 1, type: 'text', content: 'TRUCK STOP AHEAD' },
    { weight: 1, type: 'text', content: 'REST AREA 10 MILES' },
    { weight: 1, type: 'text', content: 'GAS FOOD LODGING' },
    { weight: 1, type: 'text', content: 'BROKER TRANSPARENCY NOW!' },
    { weight: 1, type: 'text', content: 'Your Ad Here' },
    { weight: 1, type: 'text', content: 'Strong Solo Sergey Wanted' },
    { weight: 1, type: 'text', content: 'Lip Pillows and Freedom' },
    { weight: 1, type: 'text', content: 'SAY NO TO CHEAP FREIGHT' },
    { weight: 0.25, type: 'image', content: './billboard-images/loadpartner.png' },
    { weight: 0.25, type: 'image', content: './billboard-images/freight360.png' },
];

// Add clock for delta time calculation
const clock = new THREE.Clock();

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light (sun)
const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight.position.set(50, 50, 50);
sunLight.castShadow = true;
scene.add(sunLight);

// Handle window resizing
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Texture creation functions
function createCabFrontTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#0066ff'; // Bright blue cab
    context.fillRect(0, 0, 256, 256);
    context.fillStyle = '#000000'; // Grill
    context.fillRect(50, 120, 156, 60);
    context.fillStyle = '#aaddff'; // Windshield
    context.fillRect(50, 40, 156, 50);
    return new THREE.CanvasTexture(canvas);
}

function createCabSideTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#0066ff';
    context.fillRect(0, 0, 256, 256);
    context.strokeStyle = '#ffffff'; // Door outline
    context.lineWidth = 5;
    context.strokeRect(60, 60, 136, 136);
    return new THREE.CanvasTexture(canvas);
}

function createPlainTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
}

function createTrailerSideTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 512, 256);
    context.fillStyle = '#ff0000';
    context.font = 'bold 60px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('FREIGHT FRENZY', 256, 128);
    context.fillStyle = '#ffff00';
    context.beginPath();
    context.arc(100, 50, 20, 0, Math.PI * 2);
    context.arc(412, 206, 20, 0, Math.PI * 2);
    context.fill();
    return new THREE.CanvasTexture(canvas);
}

function createTreadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#111111';
    context.fillRect(0, 0, 256, 256);
    context.strokeStyle = '#333333';
    context.lineWidth = 8;
    for (let i = 0; i < 256; i += 20) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(256, i);
        context.stroke();
    }
    return new THREE.CanvasTexture(canvas);
}

function createRimTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#aaaaaa';
    context.fillRect(0, 0, 256, 256);
    context.fillStyle = '#555555';
    for (let angle = 0; angle < 360; angle += 60) {
        const rad = angle * Math.PI / 180;
        const x = 128 + 100 * Math.cos(rad);
        const y = 128 + 100 * Math.sin(rad);
        context.beginPath();
        context.arc(x, y, 15, 0, Math.PI * 2);
        context.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

// Pre-create textures
const cabFrontTexture = createCabFrontTexture();
const cabSideTexture = createCabSideTexture();
const plainBlueTexture = createPlainTexture('#0066ff');
const plainWhiteTexture = createPlainTexture('#ffffff');
const trailerBackTexture = createTrailerBackTexture();
const treadTexture = createTreadTexture();
const rimTexture = createRimTexture();

// Game state variables
let gameStarted = false;
let speed = 10;
let baseSpeed = 10;
let speedIncreaseRate = 0.0005; // Speed increase per meter traveled
let maxSpeedMultiplier = 2.5; // Maximum speed will be baseSpeed * maxSpeedMultiplier
let lane = 0;
const laneWidth = 4;
// Define lane center positions for left, center, and right lanes
const lanePositions = [-4, 0, 4]; // Centers of each lane
let health = 100;
let fuel = 100;
let money = 0;
let distanceTraveled = 0;
let isInvincible = false;
let isZapsActive = false;
let earningMultiplier = 1;
let fuelConsumptionRate = 1;
let isPaused = false;
let inTruckstop = false;
const segmentLength = 50;
const visibleSegments = 10;
let segments = [];
let lastSegmentZ = 0;
let spawnTimer = 0;
let nextTruckStopDistance = 2000;
const truckStopInterval = 2000;
let regionIndex = 0;
let truckStop = null;
let truckstopTimer = 0;
let truckstopTimeLimit = 30; // seconds before lot lizard appears
let lotLizardWarned = false;
let lotLizardVisible = false;
let lotLizard = null;

// Upgrade tracking
let hasBluetooth = false;
let hasDEFDelete = false;
let isRefueling = false;

// Truck and trailer selection
let selectedTruckType = 'flipFlopSpecial'; // Default truck
let selectedTrailerType = 'dryVan'; // Default trailer

// UI Elements
const healthElem = document.getElementById('health-value');
const fuelElem = document.getElementById('fuel-value');
const moneyElem = document.getElementById('money-value');
const distanceElem = document.getElementById('distance-value');
const speedElem = document.getElementById('speed-value');
const truckstopMoneyElem = document.getElementById('truckstop-money');
const finalScoreElem = document.getElementById('final-score');

// Environment settings
const regions = [
    { groundColor: 0x3d9e41, skyColor: 0x87ceeb, name: 'Plains' },
    { groundColor: 0x8b4513, skyColor: 0xffa07a, name: 'Desert' },
    { groundColor: 0x228b22, skyColor: 0x4682b4, name: 'Forest' }
];

// Game objects
const powerUpTypes = ['zaps', 'energy', 'wrench', 'fuelCan'];
const obstacleTypes = ['doubleBroker', 'lotLizard', 'lowBridge', 'dotOfficer'];

// Create the player's truck - using let instead of const to allow reassignment
let truck = createTruck();
truck.position.set(0, 1, 0); // Start in center lane at y=1 and z=0
scene.add(truck);

// Event Listeners
document.getElementById('start-btn').addEventListener('click', startEndlessRunnerGame);
document.getElementById('restart-btn').addEventListener('click', () => location.reload());

// Keyboard controls
document.addEventListener('keydown', (event) => {
    if (event.key === 'p' || event.key === 'P') {
        togglePause();
        return;
    }
    if (!gameStarted || inTruckstop || isPaused) return;
    switch (event.key) {
        case 'ArrowLeft':
            if (lane > -1) lane--;
            break;
        case 'ArrowRight':
            if (lane < 1) lane++;
            break;
    }
});

// Game Functions
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        document.getElementById('ui').insertAdjacentHTML('beforeend',
            '<div id="pause-message" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);padding:20px;border-radius:5px;color:white;font-size:24px;z-index:1000;">PAUSED - Press P to resume</div>');
    } else {
        const pauseMsg = document.getElementById('pause-message');
        if (pauseMsg) pauseMsg.remove();
    }
}

function startEndlessRunnerGame() {
    console.log("Starting endless runner game with truck: " + selectedTruckType + " and trailer: " + selectedTrailerType);
    
    // Hide the start screen and show the UI
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('ui').style.display = 'flex';
    
    // Reset game variables
    gameStarted = true;
    inTruckstop = false;
    isPaused = false;
    health = 100;
    fuel = 100;
    money = 0;
    lane = 0;
    speed = 12;
    distanceTraveled = 0;
    activeSegments = [];
    removedSegments = [];
    removedSegmentTime = 0;
    lastObstacleZ = 0;
    lastPowerUpZ = 0;
    regionIndex = 0;
    regionProgressPercentage = 0;
    truckStopFrequency = 2000; // Every 2000 units
    nextTruckStopZ = -truckStopFrequency;
    hasBluetooth = false;
    hasDEFDelete = false;
    fuelConsumptionRate = 1.0;
    earningMultiplier = 1.0;
    
    // Initialize mobile controls
    addMobileControls();
    initializeTouchControls();
    addResponsiveStyles();
    
    // Add viewport meta tag for proper mobile scaling
    if (!document.querySelector('meta[name="viewport"]')) {
        const viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(viewport);
    }
    
    // Hide game over screen
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('truckstop-ui').style.display = 'none';
    
    // Create scene and camera if they don't exist yet
    if (!scene) {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // Add directional light for shadows
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 50, 0);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
    }
    
    // Create the truck if it doesn't exist yet
    if (!truck) {
        truck = createTruck();
        scene.add(truck);
    }
    
    // Position camera behind truck
    camera.position.set(0, 5, 5);
    camera.lookAt(new THREE.Vector3(0, 0, -10));
    
    // Initialize the first segments
    initializeSegments();
    
    console.log("Game started successfully");
}

function setDifficulty(level) {
    console.log("Setting difficulty to:", level);
    switch (level) {
        case 'easy':
            baseSpeed = 8;
            earningMultiplier = 1;
            speedIncreaseRate = 0.0003; // Slower speed increase for easy mode
            break;
        case 'medium':
            baseSpeed = 10;
            earningMultiplier = 1.5;
            speedIncreaseRate = 0.0005; // Medium speed increase
            break;
        case 'hard':
            baseSpeed = 12;
            earningMultiplier = 2;
            speedIncreaseRate = 0.0008; // Faster speed increase for hard mode
            break;
    }
    speed = baseSpeed;
}

function updateUI() {
    healthElem.textContent = Math.floor(health);
    fuelElem.textContent = Math.floor(fuel);
    moneyElem.textContent = Math.floor(money);
    distanceElem.textContent = Math.floor(distanceTraveled);
    
    // Update speed display - convert to mph for a more realistic feel
    const speedMph = Math.floor(speed * 6); // Simple conversion for visual purposes
    speedElem.textContent = speedMph;
}

function gameOver() {
    console.log("Game over!");
    gameStarted = false;
    document.getElementById('game-over').style.display = 'block';
    finalScoreElem.textContent = `Distance: ${Math.floor(distanceTraveled)}m | Money: $${Math.floor(money)}`;
}

function shareScore() {
    const score = Math.floor(distanceTraveled);
    const message = `I just scored ${score}m in Freight Frenzy! #FreightFrenzy`;
    alert(`Share this message: ${message}`);
}

function reviewAds() {
    alert("Watching ad... health and fuel restored!");
    health = 100;
    fuel = 100;
}

// Truckstop Functions
function enterTruckstop() {
    console.log("Entering truckstop");
    inTruckstop = true;
    gameStarted = false;
    
    // Create off-ramp with sign
    offRamp = createOffRamp(truck.position.z - 20);
    scene.add(offRamp);
    
    // Reset truckstop variables
    truckstopTimer = 0;
    lotLizardWarned = false;
    lotLizardVisible = false;
    
    // Create truck stop
    truckStop = createTruckStop(truck.position.z - 100);
    scene.add(truckStop);
    
    // Take control of the truck for smooth animation
    const startPos = truck.position.clone();
    const midPoint = new THREE.Vector3(offRamp.position.x, 1, startPos.z - 30);
    const exitPoint = new THREE.Vector3(offRamp.position.x + 10, 1, startPos.z - 50);
    const endPos = new THREE.Vector3(truckStop.position.x, 1, truckStop.position.z + 15);
    
    let progress = 0;
    let currentSegment = 0;
    
    function animateToTruckstop() {
        const delta = clock.getDelta();
        progress += delta * 0.5;
        
        if (currentSegment === 0) {
            // Segment 1: startPos to midPoint
            if (progress < 1) {
                truck.position.lerpVectors(startPos, midPoint, progress);
                truck.rotation.y = 0;
                camera.position.set(truck.position.x, 8, truck.position.z + 20);
                camera.lookAt(truck.position.x, 3, truck.position.z - 10);
                requestAnimationFrame(animateToTruckstop);
            } else {
                progress = 0;
                currentSegment = 1;
                requestAnimationFrame(animateToTruckstop);
            }
        } else if (currentSegment === 1) {
            // Segment 2: midPoint to exitPoint (turning onto off-ramp)
            if (progress < 1) {
                truck.position.lerpVectors(midPoint, exitPoint, progress);
                truck.rotation.y = Math.PI / 6 * progress; // Gradual turn
                camera.position.set(truck.position.x - 10, 8, truck.position.z + 20);
                camera.lookAt(truck.position.x, 3, truck.position.z - 10);
                requestAnimationFrame(animateToTruckstop);
            } else {
                progress = 0;
                currentSegment = 2;
                requestAnimationFrame(animateToTruckstop);
            }
        } else if (currentSegment === 2) {
            // Segment 3: exitPoint to truckStop (approaching parking)
            if (progress < 1) {
                truck.position.lerpVectors(exitPoint, endPos, progress);
                truck.rotation.y = Math.PI / 6 + Math.PI / 6 * progress; // Continue turning
                camera.position.x = truck.position.x - 20;
                camera.position.y = 8;
                camera.position.z = truck.position.z + 20;
                camera.lookAt(truck.position);
                requestAnimationFrame(animateToTruckstop);
            } else {
                truck.position.copy(endPos);
                truck.rotation.y = Math.PI / 3; // Final rotation
                
                // Adjust camera for truck stop view
                camera.position.set(truck.position.x - 20, 10, truck.position.z + 20);
                camera.lookAt(truckStop.position);
                
                // Show truck stop UI
                document.getElementById('truckstop-ui').style.display = 'block';
                truckstopMoneyElem.textContent = Math.floor(money);
                
                // Reset flags for available upgrades
                isRefueling = false;
                
                truckstopTimer = 0;
            }
        }
    }
    
    animateToTruckstop();
}

function createOffRamp(startZ) {
    const rampGroup = new THREE.Group();
    
    // Create the ramp surface - now wider and longer
    const rampGeometry = new THREE.PlaneGeometry(15, 80);
    const rampMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const ramp = new THREE.Mesh(rampGeometry, rampMaterial);
    ramp.rotation.x = -Math.PI / 2;
    ramp.position.z = startZ - 40;
    ramp.position.x = 15; // Move it to the right of the highway
    ramp.receiveShadow = true;
    rampGroup.add(ramp);
    
    // Add some white markings for the off-ramp
    for (let i = 0; i < 8; i++) {
        const markingGeometry = new THREE.PlaneGeometry(0.3, 2);
        const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const marking = new THREE.Mesh(markingGeometry, markingMaterial);
        marking.rotation.x = -Math.PI / 2;
        marking.position.set(8, 0.01, startZ - 10 - i * 8);
        rampGroup.add(marking);
    }
    
    // Add curved right edge to ramp to show it's turning
    const curvePoints = [];
    for (let i = 0; i < 10; i++) {
        const t = i / 9;
        const x = 8 + t * 15;
        const z = startZ - 10 - t * 70;
        curvePoints.push(new THREE.Vector3(x, 0.01, z));
    }
    
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const curveGeometry = new THREE.TubeGeometry(curve, 20, 0.15, 8, false);
    const curveMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const curveObject = new THREE.Mesh(curveGeometry, curveMaterial);
    rampGroup.add(curveObject);
    
    // Add guardrails
    const guardrailGeometry = new THREE.BoxGeometry(0.5, 1, 80);
    const guardrailMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
    
    const rightGuardrail = new THREE.Mesh(guardrailGeometry, guardrailMaterial);
    rightGuardrail.position.set(22.5, 0.5, startZ - 40);
    rampGroup.add(rightGuardrail);
    
    // Add exit sign
    const signPostGeometry = new THREE.CylinderGeometry(0.2, 0.2, 6, 8);
    const signPostMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
    const signPost = new THREE.Mesh(signPostGeometry, signPostMaterial);
    signPost.position.set(13, 3, startZ - 5);
    rampGroup.add(signPost);
    
    const signGeometry = new THREE.BoxGeometry(5, 2, 0.2);
    const signMaterial = new THREE.MeshPhongMaterial({ color: 0x00aa00 });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(13, 5, startZ - 5);
    rampGroup.add(sign);
    
    // Add text to the sign
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.fillStyle = '#00aa00';
    context.fillRect(0, 0, 256, 128);
    context.fillStyle = '#ffffff';
    context.font = 'bold 40px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('TRUCK STOP', 128, 50);
    context.fillText('EXIT NOW', 128, 90);
    
    const signTextMaterial = new THREE.MeshBasicMaterial({ 
        map: new THREE.CanvasTexture(canvas),
        side: THREE.DoubleSide
    });
    const signText = new THREE.PlaneGeometry(5, 2);
    
    // Front of sign
    const signTextFront = new THREE.Mesh(signText, signTextMaterial);
    signTextFront.position.set(13, 5, startZ - 4.9);
    rampGroup.add(signTextFront);
    
    // Back of sign
    const signTextBack = new THREE.Mesh(signText, signTextMaterial);
    signTextBack.position.set(13, 5, startZ - 5.1);
    signTextBack.rotation.y = Math.PI;
    rampGroup.add(signTextBack);
    
    return rampGroup;
}

function createTruckStop(zPosition) {
    const truckStopGroup = new THREE.Group();
    truckStopGroup.position.set(35, 0, zPosition); // Move truck stop further to the right
    
    // Main building
    const buildingGeometry = new THREE.BoxGeometry(20, 8, 15);
    const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0xdd3333 });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(10, 4, 0);
    building.castShadow = true;
    truckStopGroup.add(building);
    
    // Store front with glass
    const storeFrontGeometry = new THREE.PlaneGeometry(18, 6);
    const storeFrontMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const storeFront = new THREE.Mesh(storeFrontGeometry, storeFrontMaterial);
    storeFront.position.set(10, 4, 7.51);
    truckStopGroup.add(storeFront);
    
    // Main sign
    const signGeometry = new THREE.BoxGeometry(12, 4, 1);
    const signMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(10, 12, 0);
    truckStopGroup.add(sign);
    
    // Sign text
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 256;
    const signContext = signCanvas.getContext('2d');
    signContext.fillStyle = '#ff0000';
    signContext.fillRect(0, 0, 512, 256);
    signContext.fillStyle = '#ffffff';
    signContext.font = 'bold 80px Arial';
    signContext.textAlign = 'center';
    signContext.textBaseline = 'middle';
    signContext.fillText('TRUCK', 256, 80);
    signContext.fillText('STOP', 256, 170);
    
    const signTextMaterial = new THREE.MeshBasicMaterial({ 
        map: new THREE.CanvasTexture(signCanvas),
        side: THREE.DoubleSide
    });
    const signTextGeometry = new THREE.PlaneGeometry(12, 4);
    
    // Front of sign
    const signTextFront = new THREE.Mesh(signTextGeometry, signTextMaterial);
    signTextFront.position.set(10, 12, 0.51);
    truckStopGroup.add(signTextFront);
    
    // Back of sign
    const signTextBack = new THREE.Mesh(signTextGeometry, signTextMaterial);
    signTextBack.position.set(10, 12, -0.51);
    signTextBack.rotation.y = Math.PI;
    truckStopGroup.add(signTextBack);
    
    // Fuel pumps
    const pumpStationGeometry = new THREE.BoxGeometry(20, 0.2, 15);
    const pumpStationMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const pumpStation = new THREE.Mesh(pumpStationGeometry, pumpStationMaterial);
    pumpStation.position.set(-10, 0.1, 0);
    truckStopGroup.add(pumpStation);
    
    // Canopy over fuel pumps
    const canopyGeometry = new THREE.BoxGeometry(22, 0.5, 17);
    const canopyMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.set(-10, 6, 0);
    truckStopGroup.add(canopy);
    
    // Canopy supports
    const supportGeometry = new THREE.CylinderGeometry(0.5, 0.5, 6, 8);
    const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    
    const supportPositions = [
        [-20, 3, -7],
        [-20, 3, 7],
        [0, 3, -7],
        [0, 3, 7]
    ];
    
    supportPositions.forEach(pos => {
        const support = new THREE.Mesh(supportGeometry, supportMaterial);
        support.position.set(pos[0], pos[1], pos[2]);
        truckStopGroup.add(support);
    });
    
    // Create diesel pumps
    for (let i = 0; i < 4; i++) {
        const x = -16 + (i % 2) * 12;
        const z = -4 + Math.floor(i / 2) * 8;
        
        // Pump base
        const pumpBaseGeometry = new THREE.BoxGeometry(2, 0.5, 2);
        const pumpBaseMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const pumpBase = new THREE.Mesh(pumpBaseGeometry, pumpBaseMaterial);
        pumpBase.position.set(x, 0.35, z);
        truckStopGroup.add(pumpBase);
        
        // Pump
        const pumpGeometry = new THREE.BoxGeometry(1.5, 4, 1.5);
        const pumpMaterial = new THREE.MeshPhongMaterial({ color: 0x0066cc });
        const pump = new THREE.Mesh(pumpGeometry, pumpMaterial);
        pump.position.set(x, 2.5, z);
        truckStopGroup.add(pump);
        
        // Pump display
        const displayGeometry = new THREE.PlaneGeometry(1.4, 0.7);
        const displayMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        // Add display to each side
        for (let angle = 0; angle < 4; angle++) {
            const display = new THREE.Mesh(displayGeometry, displayMaterial);
            display.position.set(
                x + 0.76 * Math.sin(angle * Math.PI/2),
                3,
                z + 0.76 * Math.cos(angle * Math.PI/2)
            );
            display.rotation.y = angle * Math.PI/2;
            truckStopGroup.add(display);
        }
        
        // Pump hose
        const hoseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
        const hoseMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
        const hose = new THREE.Mesh(hoseGeometry, hoseMaterial);
        hose.position.set(x + 0.8, 1.5, z + 0.8);
        hose.rotation.x = Math.PI / 4;
        hose.rotation.z = Math.PI / 4;
        truckStopGroup.add(hose);
        
        // Nozzle
        const nozzleGeometry = new THREE.CylinderGeometry(0.15, 0.05, 0.5, 8);
        const nozzleMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
        nozzle.position.set(x + 1.6, 0.4, z + 1.6);
        nozzle.rotation.x = Math.PI / 2;
        nozzle.rotation.z = Math.PI / 4;
        truckStopGroup.add(nozzle);
    }
    
    // Parking spots
    const parkingLotGeometry = new THREE.PlaneGeometry(30, 20);
    const parkingLotMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const parkingLot = new THREE.Mesh(parkingLotGeometry, parkingLotMaterial);
    parkingLot.rotation.x = -Math.PI / 2;
    parkingLot.position.set(10, 0.05, -15);
    truckStopGroup.add(parkingLot);
    
    // Parking lines
    for (let i = 0; i < 5; i++) {
        const lineGeometry = new THREE.PlaneGeometry(0.2, 15);
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.rotation.x = -Math.PI / 2;
        line.position.set(i * 6 - 5, 0.1, -15);
        truckStopGroup.add(line);
    }
    
    // Add some parked trucks in the truck parking
    for (let i = 0; i < 3; i++) {
        const parkedTruck = createTruck();
        parkedTruck.scale.set(0.8, 0.8, 0.8);
        parkedTruck.position.set(i * 6 - 2, 0.8, -20);
        parkedTruck.rotation.y = Math.PI / 2;
        truckStopGroup.add(parkedTruck);
    }
    
    return truckStopGroup;
}

function animateLotLizard() {
    if (inTruckstop) {
        truckstopTimer += clock.getDelta();
        
        // Check if it's time for the lot lizard to appear
        if (truckstopTimer > truckstopTimeLimit && !lotLizardWarned && !lotLizardVisible) {
            console.log("Lot lizard approaching!");
            lotLizardWarned = true;
            lotLizard = createLotLizard();
            
            // Position the lot lizard near the truck stop building
            lotLizard.position.set(25, 0, truck.position.z - 65);
            scene.add(lotLizard);
            
            // Update UI to warn player
            document.getElementById('truckstop-ui').insertAdjacentHTML('beforeend', 
                '<div id="lizard-warning" style="color:red;font-weight:bold;margin-top:10px;animation:blink 1s infinite;">WARNING: Lot lizard approaching!</div>');
        }
        
        // Animate lot lizard
        if (lotLizardWarned && !lotLizardVisible) {
            // Move lot lizard towards truck
            const targetX = truck.position.x;
            const targetZ = truck.position.z;
            const speed = 0.06;
            
            const dx = targetX - lotLizard.position.x;
            const dz = targetZ - lotLizard.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            // Update the lot lizard direction to face the truck
            lotLizard.rotation.y = Math.atan2(dx, dz);
            
            // Move lot lizard towards truck
            if (distance > 3) {
                lotLizard.position.x += (dx / distance) * speed;
                lotLizard.position.z += (dz / distance) * speed;
                
                // Bobbing up and down while walking
                lotLizard.position.y = Math.sin(Date.now() * 0.01) * 0.2;
            } else {
                // Lot lizard has reached the truck
                lotLizardVisible = true;
                applyLotLizardPenalty();
            }
        }
    }
}

function applyLotLizardPenalty() {
    console.log("Lot lizard penalty applied");
    
    // Take $100 or all money if less than $100
    const moneyLost = Math.min(money, 100);
    money -= moneyLost;
    
    // Update the truckstop money display
    truckstopMoneyElem.textContent = Math.floor(money);
    
    // Determine if we should take an upgrade
    let upgradeStolen = null;
    if (hasBluetooth && Math.random() < 0.5) {
        hasBluetooth = false;
        upgradeStolen = "Bluetooth headset";
        earningMultiplier = 1.0;
    } else if (hasDEFDelete) {
        hasDEFDelete = false;
        upgradeStolen = "DEF Delete kit";
        fuelConsumptionRate = 1.0;
    }
    
    // Show message to player
    let message = "Spending too much time on fuel island has its consequences!";
    message += "<br>Lost $" + moneyLost.toFixed(2);
    
    if (upgradeStolen) {
        message += "<br>Lost upgrade: " + upgradeStolen;
    }
    
    // Display penalty message
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '40%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.background = 'rgba(0,0,0,0.9)';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '20px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.fontSize = '24px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.zIndex = '1001';
    messageDiv.innerHTML = message;
    
    document.body.appendChild(messageDiv);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        document.body.removeChild(messageDiv);
    }, 5000);
}

function leaveTruckstop() {
    console.log("Leaving truck stop");
    document.getElementById('truckstop-ui').style.display = 'none';
    
    // Remove lot lizard warning if it exists
    const warning = document.getElementById('lizard-warning');
    if (warning) warning.remove();
    
    const startPos = truck.position.clone();
    const midPoint = new THREE.Vector3(15, truck.position.y, startPos.z - 30);
    const exitPoint = new THREE.Vector3(0, truck.position.y, startPos.z - 60);
    const endPos = new THREE.Vector3(lanePositions[lane + 1], 1, startPos.z - 90);
    
    let progress = 0;
    let currentSegment = 0;
    
    function animateLeave() {
        progress += 0.01;
        
        // First segment: Exit parking to off-ramp
        if (currentSegment === 0) {
            if (progress < 1) {
                truck.position.lerpVectors(startPos, midPoint, progress);
                const turnAngle = Math.PI / 2 * (1 - progress);
                truck.rotation.y = turnAngle;
                
                // Update camera to follow truck
                camera.position.set(
                    truck.position.x - 10 * Math.sin(truck.rotation.y),
                    8,
                    truck.position.z + 15 * Math.cos(truck.rotation.y)
                );
                camera.lookAt(truck.position);
                
                requestAnimationFrame(animateLeave);
            } else {
                // Move to second segment
                currentSegment = 1;
                progress = 0;
                requestAnimationFrame(animateLeave);
            }
        }
        // Second segment: Travel down off-ramp
        else if (currentSegment === 1) {
            if (progress < 1) {
                truck.position.lerpVectors(midPoint, exitPoint, progress);
                // Gradually turn back toward highway
                const turnAngle = (Math.PI / 3) * (1 - progress);
                truck.rotation.y = turnAngle;
                
                // Update camera
                camera.position.set(
                    truck.position.x - 10 * Math.sin(truck.rotation.y),
                    8,
                    truck.position.z + 15 * Math.cos(truck.rotation.y)
                );
                camera.lookAt(truck.position);
                
                requestAnimationFrame(animateLeave);
            } else {
                // Move to final segment
                currentSegment = 2;
                progress = 0;
                requestAnimationFrame(animateLeave);
            }
        }
        // Third segment: Return to main highway
        else if (currentSegment === 2) {
            if (progress < 1) {
                truck.position.lerpVectors(exitPoint, endPos, progress);
                // Return to straight ahead
                const turnAngle = progress < 0.5 ? (1 - progress * 2) * (Math.PI / 6) : 0;
                truck.rotation.y = turnAngle;
                
                // Update camera
                camera.position.set(
                    truck.position.x,
                    8,
                    truck.position.z + 20
                );
                camera.lookAt(truck.position.x, 3, truck.position.z - 10);
                
                requestAnimationFrame(animateLeave);
            } else {
                // Back on the highway
                truck.position.copy(endPos);
                truck.rotation.y = 0;
                
                gameStarted = true;
                inTruckstop = false;
                
                // Remove truck stop and lot lizard
                scene.remove(truckStop);
                scene.remove(offRamp);
                if (lotLizard) scene.remove(lotLizard);
                lotLizard = null;
                
                // Change region
                regionIndex = (regionIndex + 1) % regions.length;
                scene.background = new THREE.Color(regions[regionIndex].skyColor);
                segments.forEach(segment => {
                    segment.children[0].material.color.set(regions[regionIndex].groundColor);
                });
                
                // Reset camera to normal driving position
                camera.position.set(truck.position.x, 8, truck.position.z + 20);
                camera.lookAt(truck.position.x, 3, truck.position.z - 10);
            }
        }
    }
    
    animateLeave();
}

// Game Loop
function endlessRunnerLoop() {
    if (gameStarted && !inTruckstop && !isPaused) {
        const delta = clock.getDelta();
        
        // Debug logging
        if (Math.floor(distanceTraveled) % 100 === 0) {
            console.log(`Debug - Truck position: x=${truck.position.x.toFixed(2)}, z=${truck.position.z.toFixed(2)}, lane=${lane}, speed=${speed.toFixed(2)}`);
        }
        
        // Gradually increase speed based on distance traveled
        // But cap it at baseSpeed * maxSpeedMultiplier to prevent it from getting impossible
        const currentMaxSpeed = baseSpeed * maxSpeedMultiplier;
        if (speed < currentMaxSpeed) {
            // Increase speed based on distance traveled
            speed += speedIncreaseRate * speed * delta;
            speed = Math.min(speed, currentMaxSpeed);
        }
        
        // Move the truck forward based on speed
        truck.position.z -= speed * delta;
        
        // Use the lanePositions array to position the truck in the center of lanes
        truck.position.x = lanePositions[lane + 1]; // +1 because lane is -1, 0, or 1
        
        distanceTraveled += speed * delta;
        money += speed * delta * 0.1 * earningMultiplier;
        if (!isZapsActive) fuel -= fuelConsumptionRate * delta;
        if (fuel <= 0 || health <= 0) gameOver();
        
        // Update camera position to follow the truck
        camera.position.set(truck.position.x, 8, truck.position.z + 20);
        camera.lookAt(truck.position.x, 3, truck.position.z - 10);
        
        // Create new segments as needed
        while (lastSegmentZ > truck.position.z - (segmentLength * visibleSegments)) {
            const newZ = lastSegmentZ - segmentLength;
            const segment = createHighwaySegment(newZ);
            scene.add(segment);
            segments.push(segment);
            lastSegmentZ = newZ;
        }
        
        // Remove segments that are too far behind
        while (segments.length > 0 && segments[0].userData.z > truck.position.z + segmentLength * 3) {
            scene.remove(segments.shift());
        }
        
        // Spawn obstacles and power-ups
        spawnTimer += speed * delta;
        if (spawnTimer > 20) {
            if (Math.random() < 0.5) {
                scene.add(createObstacle(obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)], truck.position.z - 30));
            } else {
                scene.add(createPowerUp(powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)], truck.position.z - 30));
            }
            spawnTimer = 0;
        }
        
        // Check for truck stop
        if (distanceTraveled >= nextTruckStopDistance) {
            enterTruckstop();
            nextTruckStopDistance = distanceTraveled + truckStopInterval;
        }
        
        // Check for collisions
        checkCollisions();
        
        // Update UI
        updateUI();
        
        // Animate collectibles
        scene.traverse(object => {
            if (object.userData.isCollectible) {
                const mesh = object.children[0];
                mesh.userData.floatAngle += delta * 2;
                mesh.position.y = mesh.userData.baseY + Math.sin(mesh.userData.floatAngle) * 0.5;
                mesh.userData.spinAngle += delta * 2;
                mesh.rotation.set(0, mesh.userData.spinAngle, 0);
            }
        });
    }
    
    if (inTruckstop) animateLotLizard();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    try {
        endlessRunnerLoop();
        renderer.render(scene, camera);
    } catch (error) {
        console.error("Error in animation loop:", error);
    }
}

// Initialize game
try {
    console.log("Starting game - initial setup");
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    initializeSegments();
    
    // Select default truck and trailer options on page load
    window.addEventListener('load', function() {
        // Set default selections with visual feedback
        selectTruck('flipFlopSpecial');
        selectTrailer('dryVan');
        
        // Select the default options visually
        document.querySelector('#truck-selection .option[onclick*="flipFlopSpecial"]').classList.add('selected');
        document.querySelector('#trailer-selection .option[onclick*="dryVan"]').classList.add('selected');
    });
    
    console.log("Game initialized successfully");
    animate();
} catch (error) {
    console.error("Error during game initialization:", error);
    alert("Error starting game: " + error.message);
}

// Helper functions
function createTruck() {
    const truckGroup = new THREE.Group();
    
    // Create the cab based on selected truck type
    switch(selectedTruckType) {
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
    
    // Create the trailer based on selected trailer type
    switch(selectedTrailerType) {
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
    addWheels(truckGroup, selectedTruckType, selectedTrailerType);
    
    truckGroup.position.y = 1;
    return truckGroup;
}

// Create the Flip Flop Special cab (aerodynamic Volvo)
function createFlipFlopSpecialCab(truckGroup) {
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
function createOldTimerCab(truckGroup) {
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
function createStrongSoloSergeyCab(truckGroup) {
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
function createDryVanTrailer(truckGroup) {
    const trailerGeometry = new THREE.BoxGeometry(2.5, 3, 10);
    
    // White trailer with company logos
    const trailerMaterials = [
        new THREE.MeshPhongMaterial({ map: createTrailerSideTexture() }),
        new THREE.MeshPhongMaterial({ map: createTrailerSideTexture() }),
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
function createFlatbedTrailer(truckGroup) {
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
function addWheels(truckGroup, truckType, trailerType) {
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

function createTrailerBackTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 256, 256);
    context.fillStyle = '#dddddd';
    context.fillRect(10, 10, 118, 236);
    context.fillRect(128, 10, 118, 236);
    context.fillStyle = '#ff0000';
    context.fillRect(118, 128, 20, 20);
    return new THREE.CanvasTexture(canvas);
}

function createHighwaySegment(zPosition) {
    const segment = new THREE.Group();
    segment.userData = { z: zPosition };
    
    // Create asphalt texture for more realism
    const asphaltTexture = createAsphaltTexture();
    
    // Road is now wider (16 units) to include shoulders
    const roadGeometry = new THREE.PlaneGeometry(16, segmentLength);
    const roadMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x444444,
        map: asphaltTexture,
        bumpMap: asphaltTexture,
        bumpScale: 0.1
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.z = zPosition + segmentLength / 2;
    road.receiveShadow = true;
    segment.add(road);
    
    // Add shoulders (darker gray strips on sides of road)
    const leftShoulderGeometry = new THREE.PlaneGeometry(2, segmentLength);
    const shoulderMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const leftShoulder = new THREE.Mesh(leftShoulderGeometry, shoulderMaterial);
    leftShoulder.rotation.x = -Math.PI / 2;
    leftShoulder.position.set(-7, 0.01, zPosition + segmentLength / 2);
    segment.add(leftShoulder);
    
    const rightShoulderGeometry = new THREE.PlaneGeometry(2, segmentLength);
    const rightShoulder = new THREE.Mesh(rightShoulderGeometry, shoulderMaterial);
    rightShoulder.rotation.x = -Math.PI / 2;
    rightShoulder.position.set(7, 0.01, zPosition + segmentLength / 2);
    segment.add(rightShoulder);
    
    const groundGeometry = new THREE.PlaneGeometry(100, segmentLength);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: regions[regionIndex].groundColor });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = zPosition + segmentLength / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    segment.add(ground);
    
    // Create white lane markings every 5 units with more realistic dimensions
    for (let i = 0; i < segmentLength; i += 5) {
        if (i % 10 === 0) continue; // Skip every other to create dashed lines
        
        // Left lane line - white and thinner for realism
        const leftLaneGeometry = new THREE.PlaneGeometry(0.15, 3);
        const laneMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const leftLane = new THREE.Mesh(leftLaneGeometry, laneMaterial);
        leftLane.rotation.x = -Math.PI / 2;
        leftLane.position.set(-2, 0.01, zPosition + i);
        segment.add(leftLane);
        
        // Right lane line - white and thinner for realism
        const rightLaneGeometry = new THREE.PlaneGeometry(0.15, 3);
        const rightLane = new THREE.Mesh(rightLaneGeometry, laneMaterial);
        rightLane.rotation.x = -Math.PI / 2;
        rightLane.position.set(2, 0.01, zPosition + i);
        segment.add(rightLane);
        
        // Road edge markings - solid white
        const leftEdgeGeometry = new THREE.PlaneGeometry(0.15, 5);
        const leftEdge = new THREE.Mesh(leftEdgeGeometry, laneMaterial);
        leftEdge.rotation.x = -Math.PI / 2;
        leftEdge.position.set(-6, 0.01, zPosition + i);
        segment.add(leftEdge);
        
        const rightEdgeGeometry = new THREE.PlaneGeometry(0.15, 5);
        const rightEdge = new THREE.Mesh(rightEdgeGeometry, laneMaterial);
        rightEdge.rotation.x = -Math.PI / 2;
        rightEdge.position.set(6, 0.01, zPosition + i);
        segment.add(rightEdge);
    }
    
    // Add reflective road dots (Botts' dots) between lanes
    if (Math.floor(zPosition / 10) % 3 === 0) { // Place every 30 units
        for (let lane = -1; lane <= 1; lane++) {
            const dotGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8);
            const dotMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffffff, 
                emissive: 0xffffff,
                emissiveIntensity: 0.3,
                shininess: 100
            });
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.rotation.x = Math.PI / 2;
            dot.position.set(lane * 4, 0.025, zPosition + 2);
            segment.add(dot);
        }
    }
    
    // Add mile markers occasionally
    if (Math.abs(Math.floor(zPosition / 1000)) % 10 === 0 && Math.abs(zPosition) % 1000 < segmentLength) {
        const mileMarkerGroup = createMileMarker(Math.abs(Math.floor(zPosition / 1000)));
        mileMarkerGroup.position.set(-9, 0, zPosition + segmentLength / 2);
        segment.add(mileMarkerGroup);
    }
    
    // Add occasional debris on the shoulders
    if (Math.random() < 0.2) {
        const debrisSize = 0.2 + Math.random() * 0.5;
        const debrisGeometry = new THREE.BoxGeometry(debrisSize, debrisSize, debrisSize);
        const debrisMaterial = new THREE.MeshPhongMaterial({ 
            color: Math.random() > 0.5 ? 0x3d3d3d : 0x7a5230
        });
        const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
        
        // Position on the shoulder
        const side = Math.random() > 0.5 ? -1 : 1;
        const xPos = side * (6.5 + Math.random() * 1.5);
        debris.position.set(xPos, debrisSize/2, zPosition + Math.random() * segmentLength);
        
        // Random rotation
        debris.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        segment.add(debris);
    }
    
    // Add occasional skid marks for realism (randomly placed)
    if (Math.random() < 0.3) {
        const skidMarkGeometry = new THREE.PlaneGeometry(0.2, 10 + Math.random() * 20);
        const skidMarkMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const skidMark = new THREE.Mesh(skidMarkGeometry, skidMarkMaterial);
        skidMark.rotation.x = -Math.PI / 2;
        
        // Position in a random lane with slight curve
        const laneIndex = Math.floor(Math.random() * 3);
        const xPos = lanePositions[laneIndex] + (Math.random() - 0.5);
        skidMark.position.set(xPos, 0.02, zPosition + segmentLength / 2 - Math.random() * segmentLength);
        
        // Random rotation for more natural look
        skidMark.rotation.z = (Math.random() - 0.5) * 0.2;
        segment.add(skidMark);
    }
    
    // Add guardrails consistently on both sides instead of randomly
    // Left guardrail
    const leftGuardrailGroup = createGuardrail(segmentLength);
    leftGuardrailGroup.position.set(-8, 0, zPosition + segmentLength / 2);
    segment.add(leftGuardrailGroup);
    
    // Right guardrail
    const rightGuardrailGroup = createGuardrail(segmentLength);
    rightGuardrailGroup.position.set(8, 0, zPosition + segmentLength / 2);
    segment.add(rightGuardrailGroup);
    
    // Add environmental elements like trees, rocks, or buildings
    addEnvironmentalElements(segment, zPosition, segmentLength);
    
    // Add billboards at regular intervals on both sides of the road
    const segmentDistanceFromStart = Math.abs(zPosition);
    
    // Place billboards every 200 units of distance
    // Fix for double stacking: Use a more precise condition to ensure billboards
    // are only placed once
    if (segmentDistanceFromStart % 200 < segmentLength && 
        segmentDistanceFromStart % 200 >= 0 && 
        segmentDistanceFromStart % 200 < 0.5) {
        // Calculate the exact z position to place the billboard in this segment
        const billboardZ = zPosition + (segmentDistanceFromStart % 200);
        
        // Left side billboard (20-25 units from the road)
        const leftBillboardX = -20 - Math.random() * 5;
        segment.add(createBillboard(leftBillboardX, billboardZ, true)); // true = left side
    }
    
    // Right side billboards (on a different interval to alternate sides)
    // Place every 200 units but offset by 100 from left side
    // Fix for double stacking: Use a more precise condition
    if ((segmentDistanceFromStart + 100) % 200 < segmentLength && 
        (segmentDistanceFromStart + 100) % 200 >= 0 && 
        (segmentDistanceFromStart + 100) % 200 < 0.5) {
        const rightBillboardZ = zPosition + ((segmentDistanceFromStart + 100) % 200);
        const rightBillboardX = 20 + Math.random() * 5;
        segment.add(createBillboard(rightBillboardX, rightBillboardZ, false)); // false = right side
    }
    
    return segment;
}

// Function to add environmental elements to the scene
function addEnvironmentalElements(segment, zPosition, segmentLength) {
    // Identify if this segment has billboards to avoid placing vegetation near them
    const segmentDistanceFromStart = Math.abs(zPosition);
    const hasBillboards = segmentDistanceFromStart % 200 < segmentLength || 
                         (segmentDistanceFromStart + 100) % 200 < segmentLength;
    
    // Add trees on both sides of the road with REDUCED density
    const isForestRegion = regions[regionIndex].name === 'Forest';
    const treeDensity = isForestRegion ? 0.4 : 0.2; // Reduced density
    
    // Add vegetation only on a probability basis instead of always (scaled back)
    if (Math.random() < 0.6) { // 60% chance instead of 100%
        // Left side
        addVegetation(segment, -1, zPosition, segmentLength, isForestRegion, hasBillboards);
        
        // Right side
        addVegetation(segment, 1, zPosition, segmentLength, isForestRegion, hasBillboards);
    }
    
    // Add additional random clusters of trees with more variety in specific regions (scaled back)
    if (Math.random() < treeDensity && !hasBillboards) {
        const treeCount = isForestRegion ? 2 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2);
        const side = Math.random() > 0.5 ? -1 : 1;
        
        for (let i = 0; i < treeCount; i++) {
            const treeGroup = createTree();
            // Place trees at varying distances from the road in clusters
            const distanceFromRoad = 25 + Math.random() * 30; // Moved further away
            const xPos = side * distanceFromRoad;
            // Cluster trees together within the segment
            const zPos = zPosition + (segmentLength * 0.3) + Math.random() * (segmentLength * 0.4);
            // Add some randomness to tree scale
            const scale = 0.8 + Math.random() * 0.5;
            treeGroup.scale.set(scale, scale, scale);
            treeGroup.position.set(xPos, 0, zPos);
            segment.add(treeGroup);
        }
    }
    
    // Add rocks in desert region (scaled back)
    if (regions[regionIndex].name === 'Desert' && Math.random() < 0.3) { // Reduced probability
        const rockCount = 1 + Math.floor(Math.random() * 3); // Fewer rocks
        const side = Math.random() > 0.5 ? -1 : 1;
        
        for (let i = 0; i < rockCount; i++) {
            const rock = createRock();
            const distanceFromRoad = 15 + Math.random() * 25;
            const xPos = side * distanceFromRoad;
            const zPos = zPosition + Math.random() * segmentLength;
            // Vary rock sizes
            const scale = 0.7 + Math.random() * 0.8;
            rock.scale.set(scale, scale, scale);
            rock.position.set(xPos, 0, zPos);
            segment.add(rock);
        }
    }
    
    // Occasional buildings (scaled back)
    if (Math.random() < 0.08 && !hasBillboards) { // Reduced from 0.15
        const building = createBuilding();
        const side = Math.random() > 0.5 ? -1 : 1;
        const distanceFromRoad = 35 + Math.random() * 40; // Pushed further back
        const xPos = side * distanceFromRoad;
        const zPos = zPosition + Math.random() * segmentLength;
        building.position.set(xPos, 0, zPos);
        segment.add(building);
    }
    
    // Add bushes along the roadside (scaled back)
    if (Math.random() < 0.5) { // Only 50% of the time
        addRoadsideBushes(segment, zPosition, segmentLength);
    }
}

// Helper function to add vegetation on a specific side
function addVegetation(segment, side, zPosition, segmentLength, isForestRegion, hasBillboards) {
    // Add a mix of trees and bushes along the road edge
    const elementCount = 1 + Math.floor(Math.random() * 2); // Reduced from 2-4 to 1-2
    
    for (let i = 0; i < elementCount; i++) {
        // Decide whether to add a tree or bush
        const isTree = Math.random() < 0.4; // Reduced probability of trees vs bushes
        let element;
        
        // Skip large elements if there are billboards in this segment on this side
        if (hasBillboards && isTree && ((side === -1 && zPosition % 200 < segmentLength) || 
            (side === 1 && (zPosition + 100) % 200 < segmentLength))) {
            continue; // Skip trees near billboards
        }
        
        if (isTree) {
            element = createTree();
            const distanceFromRoad = 18 + Math.random() * 15; // Moved further from road
            const xPos = side * distanceFromRoad;
            const zPos = zPosition + (i / elementCount) * segmentLength + Math.random() * 20;
            // Randomize tree size
            const scale = 0.7 + Math.random() * 0.6;
            element.scale.set(scale, scale, scale);
            element.position.set(xPos, 0, zPos);
        } else {
            element = createBush();
            const distanceFromRoad = 12 + Math.random() * 8; // Moved further from road
            const xPos = side * distanceFromRoad;
            const zPos = zPosition + (i / elementCount) * segmentLength + Math.random() * 20;
            element.position.set(xPos, 0, zPos);
        }
        
        segment.add(element);
    }
}

// New function to create bushes
function createBush() {
    const bushGroup = new THREE.Group();
    
    // Base color varies by region
    let bushColor = 0x2D5E2A; // Default dark green
    
    if (regions[regionIndex].name === 'Desert') {
        bushColor = 0x8D8F6F; // Desert sage color
    } else if (regions[regionIndex].name === 'Mountains') {
        bushColor = 0x4A6834; // Mountain shrub color
    }
    
    // Create multiple foliage clumps for the bush
    const foliageCount = 2 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < foliageCount; i++) {
        const size = 0.8 + Math.random() * 1.2;
        // Slightly vary colors
        const colorVariation = Math.random() * 0x101010 - 0x080808;
        const foliageColor = new THREE.Color(bushColor + colorVariation);
        
        const foliageGeometry = new THREE.SphereGeometry(size, 8, 6);
        const foliageMaterial = new THREE.MeshPhongMaterial({ 
            color: foliageColor,
            flatShading: true 
        });
        
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        
        // Position clumps to form a bush shape
        foliage.position.x = (Math.random() - 0.5) * 1.5;
        foliage.position.y = size / 2 + Math.random() * 0.5;
        foliage.position.z = (Math.random() - 0.5) * 1.5;
        
        bushGroup.add(foliage);
    }
    
    return bushGroup;
}

// New function to add small bushes along the immediate roadside
function addRoadsideBushes(segment, zPosition, segmentLength) {
    // Add small bushes/grass clusters very close to the road edge
    // Reduced from 4-8 to 2-4
    const bushCount = 2 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < bushCount; i++) {
        // Alternate sides
        const side = i % 2 === 0 ? -1 : 1;
        const bush = createRoadsideBush();
        
        // Place very close to road edge
        const distanceFromRoad = 9 + Math.random() * 2; // Moved slightly further from road
        const xPos = side * distanceFromRoad;
        // Spread them out more
        const zPos = zPosition + (i / bushCount) * segmentLength + Math.random() * 15;
        
        bush.position.set(xPos, 0, zPos);
        segment.add(bush);
    }
}

// Create small roadside vegetation
function createRoadsideBush() {
    const bushGroup = new THREE.Group();
    
    // Base color varies by region with more vibrant colors for roadside plants
    let bushColor;
    
    if (regions[regionIndex].name === 'Desert') {
        bushColor = 0xAD9F77; // Desert grass color
    } else if (regions[regionIndex].name === 'Mountains') {
        bushColor = 0x596C4F; // Mountain grass color
    } else {
        bushColor = 0x4A7535; // Default grass color
    }
    
    // Create small grass/bush cluster
    const clusterCount = 3 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < clusterCount; i++) {
        // Small sizes for roadside vegetation
        const size = 0.3 + Math.random() * 0.7;
        
        // Randomize colors slightly
        const colorVariation = Math.random() * 0x151515 - 0x0A0A0A;
        const clusterColor = new THREE.Color(bushColor + colorVariation);
        
        const geometry = Math.random() < 0.7 ? 
            new THREE.ConeGeometry(size, size * 2, 5) : // Grass-like shape
            new THREE.SphereGeometry(size, 6, 4); // Bush-like shape
            
        const material = new THREE.MeshPhongMaterial({ 
            color: clusterColor,
            flatShading: true 
        });
        
        const cluster = new THREE.Mesh(geometry, material);
        
        // Position to form a small cluster
        cluster.position.x = (Math.random() - 0.5) * 1.2;
        cluster.position.y = size / 2;
        cluster.position.z = (Math.random() - 0.5) * 1.2;
        
        // Randomize rotation for natural look
        cluster.rotation.y = Math.random() * Math.PI * 2;
        
        bushGroup.add(cluster);
    }
    
    return bushGroup;
}

// Function to create a tree
function createTree() {
    const treeGroup = new THREE.Group();
    
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 3 + Math.random() * 3, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkGeometry.parameters.height / 2;
    trunk.castShadow = true;
    treeGroup.add(trunk);
    
    // Tree foliage - different shapes based on region
    const isForest = regions[regionIndex].name === 'Forest';
    
    if (isForest) {
        // Pine tree style for forest
        const levels = 3 + Math.floor(Math.random() * 3);
        const foliageColor = 0x006400; // Dark green
        
        for (let i = 0; i < levels; i++) {
            const size = 3 - i * (2.0 / levels);
            const height = 1.5;
            const foliageGeometry = new THREE.ConeGeometry(size, height, 8);
            const foliageMaterial = new THREE.MeshPhongMaterial({ color: foliageColor });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = trunk.position.y + trunk.geometry.parameters.height / 2 + i * 1.2;
            foliage.castShadow = true;
            treeGroup.add(foliage);
        }
    } else {
        // Deciduous tree style for plains
        const foliageSize = 2 + Math.random() * 2;
        const foliageGeometry = new THREE.SphereGeometry(foliageSize, 8, 8);
        const foliageColor = Math.random() > 0.5 ? 0x228B22 : 0x32CD32; // Variation in green
        const foliageMaterial = new THREE.MeshPhongMaterial({ color: foliageColor });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = trunk.position.y + trunk.geometry.parameters.height / 2 + foliageSize * 0.6;
        foliage.castShadow = true;
        treeGroup.add(foliage);
    }
    
    return treeGroup;
}

// Function to create a rock
function createRock() {
    const rockGroup = new THREE.Group();
    
    const rockCount = 1 + Math.floor(Math.random() * 3);
    const rockColors = [0x8B8878, 0xA0522D, 0xCD853F]; // Various rock colors
    
    for (let i = 0; i < rockCount; i++) {
        const rockSize = 1 + Math.random() * 3;
        const rockGeometry = new THREE.DodecahedronGeometry(rockSize);
        const rockMaterial = new THREE.MeshPhongMaterial({ 
            color: rockColors[Math.floor(Math.random() * rockColors.length)]
        });
        
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        
        // Randomize position within group
        rock.position.set(
            (Math.random() - 0.5) * 3,
            rockSize / 2,
            (Math.random() - 0.5) * 3
        );
        
        // Randomize rotation for natural look
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        rock.castShadow = true;
        rockGroup.add(rock);
    }
    
    return rockGroup;
}

// Function to create a simple building
function createBuilding() {
    const buildingGroup = new THREE.Group();
    
    // Basic building types
    const buildingTypes = [
        {name: 'house', width: 8, depth: 10, height: 6, color: 0xE8BEAC},
        {name: 'barn', width: 12, depth: 20, height: 10, color: 0x8B0000},
        {name: 'warehouse', width: 20, depth: 30, height: 8, color: 0x708090}
    ];
    
    const buildingType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
    
    // Building body
    const buildingGeometry = new THREE.BoxGeometry(
        buildingType.width,
        buildingType.height,
        buildingType.depth
    );
    const buildingMaterial = new THREE.MeshPhongMaterial({ color: buildingType.color });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = buildingType.height / 2;
    building.castShadow = true;
    buildingGroup.add(building);
    
    // Add roof based on building type
    if (buildingType.name === 'house') {
        const roofGeometry = new THREE.ConeGeometry(
            buildingType.width * 0.7,
            buildingType.height * 0.5,
            4
        );
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = buildingType.height + buildingType.height * 0.25;
        roof.rotation.y = Math.PI / 4;
        buildingGroup.add(roof);
    } else if (buildingType.name === 'barn') {
        const roofGeometry = new THREE.CylinderGeometry(
            0, // top radius (0 for a cone)
            buildingType.width / 2, // bottom radius
            buildingType.height * 0.5, // height
            4, // radial segments
            1, // height segments
            true // open ended
        );
        roofGeometry.rotateX(Math.PI / 2);
        roofGeometry.scale(1, 1, 0.7);
        
        const roofMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x696969,
            side: THREE.DoubleSide
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = buildingType.height;
        roof.position.z = 0;
        buildingGroup.add(roof);
    }
    
    // Random rotation for variety
    buildingGroup.rotation.y = Math.random() * Math.PI * 2;
    
    return buildingGroup;
}

// New function to create mile markers
function createMileMarker(mile) {
    const markerGroup = new THREE.Group();
    
    // Post
    const postGeometry = new THREE.BoxGeometry(0.1, 1.2, 0.1);
    const postMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.y = 0.6;
    markerGroup.add(post);
    
    // Sign
    const signGeometry = new THREE.PlaneGeometry(0.6, 0.4);
    const signMaterial = new THREE.MeshPhongMaterial({ color: 0x006400 });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 1.2, 0);
    markerGroup.add(sign);
    
    // Create canvas texture for the mile number
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = '#006400';
    context.fillRect(0, 0, 128, 64);
    context.fillStyle = '#ffffff';
    context.font = 'bold 32px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(mile.toString(), 64, 32);
    
    const mileTexture = new THREE.CanvasTexture(canvas);
    const mileGeometry = new THREE.PlaneGeometry(0.5, 0.3);
    const mileMaterial = new THREE.MeshBasicMaterial({ 
        map: mileTexture,
        side: THREE.DoubleSide
    });
    
    const mileSignFront = new THREE.Mesh(mileGeometry, mileMaterial);
    mileSignFront.position.set(0, 1.2, 0.01);
    markerGroup.add(mileSignFront);
    
    const mileSignBack = new THREE.Mesh(mileGeometry, mileMaterial);
    mileSignBack.position.set(0, 1.2, -0.01);
    mileSignBack.rotation.y = Math.PI;
    markerGroup.add(mileSignBack);
    
    return markerGroup;
}

// Function to create asphalt texture
function createAsphaltTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Base dark gray
    context.fillStyle = '#333333';
    context.fillRect(0, 0, 512, 512);
    
    // Add asphalt texture
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 3;
        const grayValue = Math.floor(20 + Math.random() * 40);
        const color = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
    }
    
    // Add cracks and imperfections
    for (let i = 0; i < 20; i++) {
        const x1 = Math.random() * 512;
        const y1 = Math.random() * 512;
        const x2 = x1 + (Math.random() - 0.5) * 100;
        const y2 = y1 + (Math.random() - 0.5) * 100;
        
        context.strokeStyle = '#222222';
        context.lineWidth = 1 + Math.random() * 2;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }
    
    return new THREE.CanvasTexture(canvas);
}

// Function to create guardrail
function createGuardrail(length) {
    const guardrailGroup = new THREE.Group();
    
    // Create posts
    const posts = Math.ceil(length / 4);
    for (let i = 0; i < posts; i++) {
        const postGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
        const postMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(0, 0.5, -length/2 + i * 4);
        guardrailGroup.add(post);
    }
    
    // Create rail sections
    const railGeometry = new THREE.BoxGeometry(0.1, 0.3, length);
    const railMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const rail = new THREE.Mesh(railGeometry, railMaterial);
    rail.position.set(0, 0.8, 0);
    guardrailGroup.add(rail);
    
    return guardrailGroup;
}

function createBillboardTexture(message) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;  // Higher resolution for better quality
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Fill with dark background for better contrast
    context.fillStyle = '#000000';
    context.fillRect(0, 0, 1024, 512);
    
    // Add border
    context.strokeStyle = '#444444';
    context.lineWidth = 16;
    context.strokeRect(20, 20, 984, 472);
    
    // Create inner frame for more professional look
    context.strokeStyle = '#666666';
    context.lineWidth = 8;
    context.strokeRect(40, 40, 944, 432);

    // Check if the message is a string (for backward compatibility) or an object
    let messageType = 'text';
    let messageContent = message;
    
    if (typeof message === 'object') {
        messageType = message.type;
        messageContent = message.content;
    }
    
    // Handle image type
    if (messageType === 'image') {
        return new Promise((resolve) => {
            const img = new Image();
            
            // Don't use crossOrigin for local files
            if (messageContent.startsWith('http')) {
                img.crossOrigin = 'Anonymous';  // Only for remote URLs
            }
            
            img.onload = function() {
                try {
                    // Calculate aspect ratio to fit the image properly
                    const imgRatio = img.width / img.height;
                    let drawWidth = 864; // Max width (904 - 40 padding)
                    let drawHeight = drawWidth / imgRatio;
                    
                    // If too tall, scale by height instead
                    if (drawHeight > 372) { // Max height (392 - 20 padding)
                        drawHeight = 372;
                        drawWidth = drawHeight * imgRatio;
                    }
                    
                    // Center the image
                    const drawX = 512 - (drawWidth / 2);
                    const drawY = 256 - (drawHeight / 2);
                    
                    // Draw the image
                    context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                    
                    // Create texture with specific settings to avoid WebGL issues
                    const texture = new THREE.CanvasTexture(canvas);
                    texture.minFilter = THREE.LinearFilter;
                    texture.generateMipmaps = false;
                    
                    resolve(texture);
                } catch (error) {
                    console.error("Error creating billboard texture:", error);
                    
                    // Fallback to error text
                    context.fillStyle = '#ffffff';
                    context.font = 'bold 40px Arial';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.fillText('Image Error: ' + error.message, 512, 256);
                    context.font = 'bold 30px Arial';
                    context.fillText('Path: ' + messageContent, 512, 320);
                    
                    const fallbackTexture = new THREE.CanvasTexture(canvas);
                    resolve(fallbackTexture);
                }
            };
            
            img.onerror = function(event) {
                console.error("Failed to load image:", messageContent, event);
                
                // More detailed error message
                context.fillStyle = '#ffffff';
                context.font = 'bold 40px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText('Image Loading Error', 512, 230);
                context.font = 'bold 30px Arial';
                context.fillText('Path: ' + messageContent, 512, 280);
                context.font = 'bold 20px Arial';
                context.fillText('Check the console for details', 512, 330);
                
                const fallbackTexture = new THREE.CanvasTexture(canvas);
                resolve(fallbackTexture);
            };
            
            // Add a timeout to prevent hanging if image never loads
            setTimeout(() => {
                if (!img.complete) {
                    img.src = ''; // Cancel the image load
                    
                    context.fillStyle = '#ffffff';
                    context.font = 'bold 40px Arial';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.fillText('Image Load Timeout', 512, 256);
                    context.font = 'bold 30px Arial';
                    context.fillText('Path: ' + messageContent, 512, 320);
                    
                    const fallbackTexture = new THREE.CanvasTexture(canvas);
                    resolve(fallbackTexture);
                }
            }, 5000); // 5 second timeout
            
            img.src = messageContent;
        });
    }
    
    // Handle text type (original functionality)
    // Prepare text styling
    context.fillStyle = '#ffffff';  // Bright white text for contrast
    
    // Break the message into words for flexible layout
    const words = messageContent.split(' ');
    let lines = [];
    let currentLine = '';
    
    // First measure the text with a temporary font
    context.font = 'bold 70px Arial';
    
    // Calculate how many lines we need
    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > 900 && i > 0) {
            lines.push(currentLine.trim());
            currentLine = words[i] + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine.trim()); // Add the last line
    
    // Choose font size based on number of lines and length of text
    let fontSize;
    if (lines.length === 1) {
        if (messageContent.length < 10) fontSize = 120;
        else if (messageContent.length < 15) fontSize = 100;
        else fontSize = 80;
    } else if (lines.length === 2) {
        fontSize = 70;
    } else if (lines.length === 3) {
        fontSize = 60;
    } else {
        fontSize = 50;
    }
    
    // If the text is all caps, reduce the font size slightly for better fit
    if (messageContent === messageContent.toUpperCase() && messageContent.length > 10) {
        fontSize = Math.max(40, fontSize - 10);
    }
    
    context.font = `bold ${fontSize}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Recalculate lines with the actual font size
    lines = [];
    currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > 900 && i > 0) {
            lines.push(currentLine.trim());
            currentLine = words[i] + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine.trim()); // Add the last line
    
    // Calculate the line height and total text height
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = lineHeight * lines.length;
    
    // Calculate start Y position to center the text vertically
    const startY = 256 - (totalTextHeight / 2) + (lineHeight / 2);
    
    // Add slight shadow for better visibility
    context.shadowColor = 'rgba(0, 0, 0, 0.7)';
    context.shadowBlur = 10;
    context.shadowOffsetX = 4;
    context.shadowOffsetY = 4;
    
    // Draw each line
    for (let i = 0; i < lines.length; i++) {
        // Clip test to ensure it doesn't exceed boundaries
        context.save();
        context.beginPath();
        context.rect(60, 60, 904, 392);
        context.clip();
        
        context.fillText(lines[i], 512, startY + (i * lineHeight));
        context.restore();
    }
    
    return new THREE.CanvasTexture(canvas);
}

// Add this function before createBillboard
function getWeightedRandomBillboardMessage() {
    // Calculate total weight
    let totalWeight = 0;
    
    // If weight is not defined, default to 1
    billboardMessages.forEach(message => {
        const weight = message.weight || 1;
        totalWeight += weight;
    });
    
    // Get a random number between 0 and totalWeight
    let random = Math.random() * totalWeight;
    
    // Find the message that corresponds to the random weight
    for (const message of billboardMessages) {
        const weight = message.weight || 1;
        random -= weight;
        
        if (random <= 0) {
            return message;
        }
    }
    
    // Fallback (in case of rounding errors)
    return billboardMessages[billboardMessages.length - 1];
}

function createBillboard(x, z, isLeftSide = true) {
    const billboardGroup = new THREE.Group();
    
    // Create billboard platform/base
    const baseGeometry = new THREE.BoxGeometry(4, 0.3, 4);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.15;
    billboardGroup.add(base);
    
    // Main support pole - moved slightly back from the sign
    const poleGeometry = new THREE.CylinderGeometry(0.4, 0.4, 10, 16);
    const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(0, 5, -0.5); // Moved behind sign
    pole.castShadow = true;
    billboardGroup.add(pole);
    
    // Create support beams for the billboard - moved behind the sign
    const supportGeometry = new THREE.BoxGeometry(0.3, 0.3, 6);
    const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    
    // Left diagonal support - now behind sign
    const leftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
    leftSupport.position.set(-1.5, 4, -0.5); // Behind sign
    leftSupport.rotation.z = Math.PI / 6; // Angle for diagonal support
    billboardGroup.add(leftSupport);
    
    // Right diagonal support - now behind sign
    const rightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
    rightSupport.position.set(1.5, 4, -0.5); // Behind sign
    rightSupport.rotation.z = -Math.PI / 6; // Opposite angle
    billboardGroup.add(rightSupport);
    
    // Billboard sign - INCREASED SIZE
    const signGeometry = new THREE.BoxGeometry(14, 7, 0.4);
    const message = getWeightedRandomBillboardMessage();
    console.log("Selected billboard message:", message);
    
    // Default texture (loading texture)
    const loadingCanvas = document.createElement('canvas');
    loadingCanvas.width = 512;
    loadingCanvas.height = 256;
    const loadingContext = loadingCanvas.getContext('2d');
    loadingContext.fillStyle = '#000000';
    loadingContext.fillRect(0, 0, 512, 256);
    loadingContext.fillStyle = '#ffffff';
    loadingContext.font = 'bold 48px Arial';
    loadingContext.textAlign = 'center';
    loadingContext.textBaseline = 'middle';
    loadingContext.fillText('Loading...', 256, 128);
    
    const loadingTexture = new THREE.CanvasTexture(loadingCanvas);
    const signMaterial = new THREE.MeshPhongMaterial({ map: loadingTexture });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.y = 10; // Higher position for larger sign
    sign.castShadow = true;
    billboardGroup.add(sign);
    
    // Create the final texture (which might be async for images)
    const texturePromise = createBillboardTexture(message);
    
    // Handle both promises and direct textures
    if (texturePromise instanceof Promise) {
        texturePromise.then(texture => {
            signMaterial.map = texture;
            signMaterial.needsUpdate = true;
        });
    } else {
        signMaterial.map = texturePromise;
        signMaterial.needsUpdate = true;
    }
    
    // Add spotlights to illuminate the billboard at night - now positioned on top of sign
    const spotlightCount = 2; // Two spotlights, one on each side
    
    for (let i = 0; i < spotlightCount; i++) {
        // Spotlight housing - moved to top of sign
        const spotHousingGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.4, 8);
        const spotHousingMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const spotHousing = new THREE.Mesh(spotHousingGeo, spotHousingMat);
        
        const xPos = i === 0 ? -6.5 : 6.5; // Position on either side of sign (adjusted for larger sign)
        spotHousing.position.set(xPos, 13.6, -0.2); // Moved to top of sign and slightly back
        spotHousing.rotation.x = Math.PI / 4; // Angle downward to illuminate sign
        billboardGroup.add(spotHousing);
        
        // Spotlight bulb with emission for night glow effect
        const spotBulbGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const spotBulbMat = new THREE.MeshPhongMaterial({ 
            color: 0xffffcc, 
            emissive: 0xffffcc,
            emissiveIntensity: 0.3
        });
        const spotBulb = new THREE.Mesh(spotBulbGeo, spotBulbMat);
        spotBulb.position.set(xPos, 13.5, -0.15); // Aligned with housing
        billboardGroup.add(spotBulb);
    }
    
    // Create small catwalk platform for maintenance - moved behind sign
    const catwalkGeometry = new THREE.BoxGeometry(14, 0.1, 0.6);
    const catwalkMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const catwalk = new THREE.Mesh(catwalkGeometry, catwalkMaterial);
    catwalk.position.set(0, 6.5, -0.7); // Moved behind sign
    billboardGroup.add(catwalk);
    
    // Add railings to catwalk - moved behind sign
    const railingGeometry = new THREE.BoxGeometry(14, 0.5, 0.05);
    const railingMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const railing = new THREE.Mesh(railingGeometry, railingMaterial);
    railing.position.set(0, 6.8, -0.9); // Moved behind sign
    billboardGroup.add(railing);
    
    // Ladder for maintenance access - moved to side of the structure
    const ladderWidth = 0.6;
    const ladderHeight = 7; // Taller ladder for bigger billboard
    const ladderDepth = 0.2;
    const ladderGroup = new THREE.Group();
    
    // Ladder rails
    const railGeometry = new THREE.BoxGeometry(0.05, ladderHeight, 0.05);
    const railMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    
    const leftRail = new THREE.Mesh(railGeometry, railMaterial);
    leftRail.position.x = -ladderWidth / 2;
    ladderGroup.add(leftRail);
    
    const rightRail = new THREE.Mesh(railGeometry, railMaterial);
    rightRail.position.x = ladderWidth / 2;
    ladderGroup.add(rightRail);
    
    // Create ladder rungs
    const rungCount = 12; // More rungs for taller ladder
    const rungGeometry = new THREE.BoxGeometry(ladderWidth, 0.05, 0.05);
    const rungMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    
    for (let i = 0; i < rungCount; i++) {
        const rung = new THREE.Mesh(rungGeometry, rungMaterial);
        rung.position.y = -ladderHeight / 2 + i * (ladderHeight / (rungCount - 1));
        ladderGroup.add(rung);
    }
    
    // Position ladder at side of billboard, not in front
    ladderGroup.position.set(5.3, 3, -0.5); // Moved to right side and behind
    billboardGroup.add(ladderGroup);
    
    billboardGroup.position.set(x, 0, z);
    
    // Calculate rotation angle to face toward the road
    // Left side billboards face right, right side billboards face left
    let rotationY = 0;
    
    if (isLeftSide) {
        // Left side billboards: positive angle to face right/inward (15-25 degrees)
        rotationY = (Math.PI / 12) + (Math.random() * Math.PI / 12); // 15-30 degrees
    } else {
        // Right side billboards: negative angle to face left/inward (15-25 degrees)
        rotationY = -((Math.PI / 12) + (Math.random() * Math.PI / 12)); // -15 to -30 degrees
    }
    
    billboardGroup.rotation.y = rotationY;
    
    return billboardGroup;
}

function createZapsTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Clear background
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, 256, 256);
    
    // Draw the white cylindrical can
    context.fillStyle = '#FFFFFF';
    context.strokeStyle = '#CCCCCC';
    context.lineWidth = 3;
    
    // Main can body
    context.beginPath();
    context.rect(78, 50, 100, 180);
    context.fill();
    context.stroke();
    
    // Can top
    context.beginPath();
    context.ellipse(128, 50, 50, 15, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    
    // Can bottom
    context.beginPath();
    context.ellipse(128, 230, 50, 15, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    
    // Add green stripe
    context.fillStyle = '#00AA00';
    context.beginPath();
    context.rect(78, 90, 100, 40);
    context.fill();
    
    // Add ZAPS text on the green stripe
    context.font = 'bold 35px Arial';
    context.fillStyle = '#FFFFFF';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('ZAPS', 128, 110);
    
    // Add a highlight for a metallic look
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.beginPath();
    context.rect(93, 50, 15, 180);
    context.fill();
    
    // Add a shadow
    context.fillStyle = 'rgba(0, 0, 0, 0.1)';
    context.beginPath();
    context.rect(148, 50, 15, 180);
    context.fill();
    
    // Add a pull-tab at the top
    context.fillStyle = '#DDDDDD';
    context.beginPath();
    context.rect(118, 35, 20, 10);
    context.fill();
    context.stroke();
    
    return new THREE.CanvasTexture(canvas);
}

function createEnergyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Clear background
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, 256, 256);
    
    // Draw energy drink can
    context.fillStyle = '#222222';  // Dark base color
    context.strokeStyle = '#111111';
    context.lineWidth = 3;
    
    // Main can body
    context.beginPath();
    context.rect(88, 50, 80, 170);
    context.fill();
    context.stroke();
    
    // Can top
    context.beginPath();
    context.ellipse(128, 50, 40, 12, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    
    // Can bottom
    context.beginPath();
    context.ellipse(128, 220, 40, 12, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    
    // Add neon green design elements
    context.fillStyle = '#00FF00';  // Bright neon green
    
    // Electric design pattern
    for (let i = 0; i < 6; i++) {
        context.beginPath();
        context.moveTo(88, 70 + i * 25);
        context.lineTo(105, 80 + i * 25);
        context.lineTo(88, 90 + i * 25);
        context.lineTo(105, 100 + i * 25);
        context.lineTo(168, 80 + i * 25);
        context.lineTo(130, 90 + i * 25);
        context.lineTo(168, 100 + i * 25);
        context.closePath();
        context.fill();
    }
    
    // Add "ENERGY" text
    context.font = 'bold 25px Arial';
    context.fillStyle = '#FFFFFF';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('ENERGY', 128, 128);
    
    // Add "+SPEED" text
    context.font = 'bold 20px Arial';
    context.fillStyle = '#00FF00';
    context.fillText('+SPEED', 128, 158);
    
    // Add a pull-tab at the top
    context.fillStyle = '#DDDDDD';
    context.beginPath();
    context.rect(118, 38, 20, 8);
    context.fill();
    context.stroke();
    
    // Add a highlight
    context.fillStyle = 'rgba(0, 255, 0, 0.3)';
    context.beginPath();
    context.rect(93, 50, 15, 170);
    context.fill();
    
    return new THREE.CanvasTexture(canvas);
}

function createWrenchTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Clear background
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, 256, 256);
    
    // Set metallic silver color for the wrench
    context.fillStyle = '#B0B0B0';
    context.strokeStyle = '#808080';
    context.lineWidth = 3;
    
    // Draw the wrench handle
    context.beginPath();
    context.rect(113, 70, 30, 150);
    context.fill();
    context.stroke();
    
    // Draw the top open-end part of the wrench
    context.beginPath();
    context.arc(128, 50, 40, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    
    // Cut out the inner circle to create the open-end
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.arc(128, 50, 25, 0, Math.PI * 2);
    context.fill();
    context.globalCompositeOperation = 'source-over';
    
    // Draw the open slot at the top
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.rect(108, 10, 40, 40);
    context.fill();
    context.globalCompositeOperation = 'source-over';
    
    // Draw the bottom part (box-end) of the wrench
    context.fillStyle = '#B0B0B0';
    context.beginPath();
    context.rect(103, 220, 50, 30);
    context.fill();
    context.stroke();
    
    // Add highlights for metallic look
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.beginPath();
    context.rect(118, 70, 10, 150);
    context.fill();
    
    // Add shadow
    context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    context.beginPath();
    context.rect(133, 70, 5, 150);
    context.fill();
    
    return new THREE.CanvasTexture(canvas);
}

function createFuelCanTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ff0000';
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = '#ffffff';
    context.font = 'bold 36px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('FUEL', 64, 64);
    context.fillStyle = '#000000';
    context.fillRect(90, 10, 20, 30);
    return new THREE.CanvasTexture(canvas);
}

function createPowerUp(type, zPosition) {
    const powerUpGroup = new THREE.Group();
    powerUpGroup.userData = { type: type, isCollectible: true };
    let geometry, material;
    switch (type) {
        case 'zaps':
            geometry = new THREE.CylinderGeometry(0.8, 0.8, 0.6, 16);
            material = new THREE.MeshPhongMaterial({ map: createZapsTexture(), shininess: 50 });
            break;
        case 'energy':
            geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 16);
            material = new THREE.MeshPhongMaterial({ map: createEnergyTexture(), shininess: 50 });
            break;
        case 'wrench':
            geometry = new THREE.BoxGeometry(0.4, 2, 0.4);
            material = new THREE.MeshPhongMaterial({ map: createWrenchTexture(), shininess: 100 });
            break;
        case 'fuelCan':
            geometry = new THREE.BoxGeometry(1.2, 1.5, 1);
            material = new THREE.MeshPhongMaterial({ map: createFuelCanTexture(), shininess: 30 });
            break;
    }
    const powerUpMesh = new THREE.Mesh(geometry, material);
    powerUpMesh.castShadow = true;
    powerUpMesh.userData = {
        baseY: 2,
        floatAngle: Math.random() * Math.PI * 2,
        spinAngle: 0
    };
    powerUpGroup.add(powerUpMesh);
    
    // Choose a random lane (-1, 0, 1) and use the lanePositions array to place in center of lane
    const laneIndex = Math.floor(Math.random() * 3);
    const lane = laneIndex - 1; // Convert to -1, 0, 1
    powerUpGroup.position.set(lanePositions[laneIndex], 2, zPosition);
    
    return powerUpGroup;
}

function createDoubleBroker() {
    const characterGroup = new THREE.Group();
    const bodyGeometry = new THREE.BoxGeometry(1.5, 2.5, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x0066cc });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.25;
    characterGroup.add(body);
    const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffccaa });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.9;
    characterGroup.add(head);
    const glassesGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.1);
    const glassesMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const glasses = new THREE.Mesh(glassesGeometry, glassesMaterial);
    glasses.position.set(0, 3, 0.5);
    characterGroup.add(glasses);
    const chainGeometry = new THREE.TorusGeometry(0.4, 0.1, 8, 16);
    const chainMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700, shininess: 100 });
    const chain = new THREE.Mesh(chainGeometry, chainMaterial);
    chain.position.set(0, 2.5, 0.5);
    chain.rotation.x = Math.PI / 2;
    characterGroup.add(chain);
    const armGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-1, 1.5, 0);
    characterGroup.add(leftArm);
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(1, 1.5, 0);
    characterGroup.add(rightArm);
    const legGeometry = new THREE.BoxGeometry(0.6, 2, 0.6);
    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.4, 0.5, 0);
    characterGroup.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.4, 0.5, 0);
    characterGroup.add(rightLeg);
    return characterGroup;
}

function createLotLizard() {
    const characterGroup = new THREE.Group();
    const bodyGeometry = new THREE.BoxGeometry(1, 2.2, 0.6);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.1;
    characterGroup.add(body);
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc99 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.7;
    characterGroup.add(head);
    const hairGeometry = new THREE.SphereGeometry(0.6, 8, 8);
    const hairMaterial = new THREE.MeshPhongMaterial({ color: 0x996633 });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 2.9;
    characterGroup.add(hair);
    const armGeometry = new THREE.BoxGeometry(0.3, 1.8, 0.3);
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.65, 1.5, 0);
    characterGroup.add(leftArm);
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.65, 1.5, 0);
    characterGroup.add(rightArm);
    const legGeometry = new THREE.BoxGeometry(0.4, 1.8, 0.4);
    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.3, 0.5, 0);
    characterGroup.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.3, 0.5, 0);
    characterGroup.add(rightLeg);
    return characterGroup;
}

function createLowBridge() {
    const bridgeGroup = new THREE.Group();
    
    // Make the bridge narrower to span just a single lane (4 units wide instead of 14)
    const pillarGeometry = new THREE.BoxGeometry(1, 5, 1);
    const pillarMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
    
    // Position pillars to frame just a single lane
    const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    leftPillar.position.set(-2, 2.5, 0);
    bridgeGroup.add(leftPillar);
    
    const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    rightPillar.position.set(2, 2.5, 0);
    bridgeGroup.add(rightPillar);
    
    // Narrower beam spanning just one lane
    const beamGeometry = new THREE.BoxGeometry(5, 1.5, 2);
    const beam = new THREE.Mesh(beamGeometry, pillarMaterial);
    beam.position.set(0, 4.5, 0);
    bridgeGroup.add(beam);
    
    // Add clearance sign
    const signGeometry = new THREE.PlaneGeometry(2, 1);
    const signMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffff00,
        side: THREE.DoubleSide
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 3.5, -1);
    sign.rotation.y = Math.PI;
    bridgeGroup.add(sign);
    
    // Add text to the sign
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 128;
    textCanvas.height = 64;
    const textContext = textCanvas.getContext('2d');
    textContext.fillStyle = '#ffff00';
    textContext.fillRect(0, 0, 128, 64);
    textContext.fillStyle = '#000000';
    textContext.font = 'bold 24px Arial';
    textContext.textAlign = 'center';
    textContext.textBaseline = 'middle';
    textContext.fillText('LOW', 64, 20);
    textContext.fillText('CLEARANCE', 64, 44);
    const textTexture = new THREE.CanvasTexture(textCanvas);
    sign.material.map = textTexture;
    sign.material.needsUpdate = true;
    
    // Warning light on top
    const lightGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const lightMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff0000, 
        emissive: 0xff0000, 
        emissiveIntensity: 0.8
    });
    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    light.position.set(0, 6, 0);
    
    // Animate the warning light
    const animateLight = function() {
        lightMaterial.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;
        requestAnimationFrame(animateLight);
    };
    animateLight();
    
    bridgeGroup.add(light);
    
    return bridgeGroup;
}

function createDOTOfficer() {
    const suvGroup = new THREE.Group();
    const bodyGeometry = new THREE.BoxGeometry(2.5, 1.8, 5);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    suvGroup.add(body);
    const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const windowGeometry = new THREE.PlaneGeometry(2, 0.8);
    const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    leftWindow.position.set(-1.26, 1.5, 0);
    leftWindow.rotation.y = -Math.PI / 2;
    suvGroup.add(leftWindow);
    const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    rightWindow.position.set(1.26, 1.5, 0);
    rightWindow.rotation.y = Math.PI / 2;
    suvGroup.add(rightWindow);
    const lightGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const redLightMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: Math.sin(Date.now() * 0.005) > 0 ? 1 : 0 });
    const blueLightMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff, emissive: 0x0000ff, emissiveIntensity: Math.sin(Date.now() * 0.005 + Math.PI) > 0 ? 1 : 0 });
    const leftLight = new THREE.Mesh(lightGeometry, redLightMaterial);
    leftLight.position.set(-1, 1.8, -1.5);
    suvGroup.add(leftLight);
    const rightLight = new THREE.Mesh(lightGeometry, blueLightMaterial);
    rightLight.position.set(1, 1.8, -1.5);
    suvGroup.add(rightLight);
    const wheelGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const wheelPositions = [
        [-1.35, 0.3, -1.8], [1.35, 0.3, -1.8],
        [-1.35, 0.3, 1.8], [1.35, 0.3, 1.8]
    ];
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.rotation.z = Math.PI / 2;
        suvGroup.add(wheel);
    });
    const labelGeometry = new THREE.PlaneGeometry(2, 0.5);
    const labelMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(0, 1, -2.4);
    suvGroup.add(label);
    return suvGroup;
}

function createObstacle(type, zPosition) {
    let obstacle;
    switch (type) {
        case 'doubleBroker':
            obstacle = createDoubleBroker();
            break;
        case 'lotLizard':
            obstacle = createLotLizard();
            break;
        case 'lowBridge':
            obstacle = createLowBridge();
            break;
        case 'dotOfficer':
            obstacle = createDOTOfficer();
            break;
    }
    obstacle.userData = { type: type, isObstacle: true };
    
    // Place the low bridge in the center lane (index 1), other obstacles in random lanes
    let laneIndex;
    if (type === 'lowBridge') {
        laneIndex = 1; // Center lane (index 1 corresponds to lane 0)
    } else {
        // Choose a random lane (-1, 0, 1) and use the lanePositions array
        laneIndex = Math.floor(Math.random() * 3);
    }
    
    const lane = laneIndex - 1; // Convert to -1, 0, 1
    obstacle.position.set(lanePositions[laneIndex], 0, zPosition);
    
    return obstacle;
}

function initializeSegments() {
    scene.background = new THREE.Color(regions[regionIndex].skyColor);
    for (let i = 0; i < 2; i++) {
        const zPos = -i * segmentLength;
        const segment = createHighwaySegment(zPos);
        scene.add(segment);
        segments.push(segment);
        lastSegmentZ = zPos;
    }
}

function applyPowerUp(type) {
    switch (type) {
        case 'zaps':
            isZapsActive = true;
            isInvincible = true;
            
            // Increase earnings while active
            const oldEarningMultiplier = earningMultiplier;
            earningMultiplier = earningMultiplier * 1.5;
            
            // Create visual effect for invincibility
            const auraEffect = createInvincibilityAura();
            truck.add(auraEffect);
            
            console.log("ZAPS activated! Player is invincible and earning 1.5x for 15 seconds");
            
            // Set a timeout to disable the effect after 15 seconds
            setTimeout(() => {
                isZapsActive = false;
                isInvincible = false;
                earningMultiplier = oldEarningMultiplier;
                truck.remove(auraEffect);
                console.log("ZAPS effect ended!");
            }, 15000);
            break;
            
        case 'energy':
            // Energy now speeds up the truck
            console.log("Energy drink consumed! Speed boost activated!");
            
            // Store current speed for restoration later
            const currentSpeed = speed;
            // Boost speed by 50%
            speed = Math.min(currentSpeed * 1.5, baseSpeed * maxSpeedMultiplier);
            
            // Set a timeout to return to normal speed after 12 seconds
            setTimeout(() => {
                if (gameStarted && !inTruckstop) {
                    speed = currentSpeed; // Return to the speed before the power-up
                    console.log("Energy speed boost ended!");
                }
            }, 12000);
            break;
            
        case 'wrench':
            // Wrench only increases health now
            const healthBoost = 20; // Increased from 10 to 20 since it's only health now
            const newHealth = Math.min(100, health + healthBoost);
            console.log(`Wrench used! Health increased from ${health} to ${newHealth}`);
            health = newHealth;
            break;
            
        case 'fuelCan':
            // Fuel can remains the same
            const newFuel = Math.min(100, fuel + 30);
            console.log(`Fuel can used! Fuel increased from ${fuel} to ${newFuel}`);
            fuel = newFuel;
            break;
    }
}

function applyObstacleEffect(type) {
    if (isInvincible) return;
    
    // Store current speed for restoration later
    const currentSpeed = speed;
    
    switch (type) {
        case 'doubleBroker':
            money = Math.max(0, money - 200);
            alert("Double broker stole your load! -$200");
            break;
        case 'lotLizard':
            // Create a separate penalty function for the obstacle version
            // Instead of calling applyLotLizardPenalty() which is for the truck stop
            money = Math.max(0, money - 50);
            health -= 10;
            alert("Lot lizard caused distraction! -$50 and -10 health");
            break;
        case 'lowBridge':
            health -= 30;
            speed = currentSpeed * 0.7; // Reduce to 70% of current speed
            setTimeout(() => {
                if (gameStarted && !inTruckstop) {
                    speed = currentSpeed; // Return to the speed before the obstacle
                }
            }, 5000);
            alert("Hit low bridge! -30 health and speed reduced for 5 seconds");
            break;
        case 'dotOfficer':
            // Special case: If player has DEF Delete and hits DOT officer, game over!
            if (hasDEFDelete) {
                // Create a special game over message div
                const messageDiv = document.createElement('div');
                messageDiv.style.position = 'fixed';
                messageDiv.style.top = '40%';
                messageDiv.style.left = '50%';
                messageDiv.style.transform = 'translate(-50%, -50%)';
                messageDiv.style.background = 'rgba(0,0,0,0.9)';
                messageDiv.style.color = 'white';
                messageDiv.style.padding = '20px';
                messageDiv.style.borderRadius = '5px';
                messageDiv.style.fontSize = '24px';
                messageDiv.style.textAlign = 'center';
                messageDiv.style.zIndex = '1001';
                messageDiv.innerHTML = "DOT Officer caught your DEF Delete - Doing hood rat things with your friends has consequences";
                
                document.body.appendChild(messageDiv);
                
                // Set a timeout to remove the message and end the game
                setTimeout(() => {
                    document.body.removeChild(messageDiv);
                    gameOver(); // End the game
                }, 4000);
                
                // Stop the truck immediately
                speed = 0;
            } else {
                // Normal DOT inspection penalty for players without DEF Delete
                money = Math.max(0, money - 100);
                speed = currentSpeed * 0.6; // Reduce to 60% of current speed
                setTimeout(() => {
                    if (gameStarted && !inTruckstop) {
                        speed = currentSpeed; // Return to the speed before the obstacle
                    }
                }, 8000);
                alert("DOT inspection! -$100 and speed reduced for 8 seconds");
            }
            break;
    }
}

function checkCollisions() {
    const truckPos = truck.position.clone();
    truckPos.y = 0;
    const objectsToRemove = [];
    scene.traverse(object => {
        if (!object.userData || object.position.z > truck.position.z + 50) return;
        const objectPos = object.position.clone();
        objectPos.y = 0;
        const distance = truckPos.distanceTo(objectPos);
        if (object.userData.isCollectible && distance < 3) {
            objectsToRemove.push(object);
            applyPowerUp(object.userData.type);
        }
        if (object.userData.isObstacle && distance < 3) {
            objectsToRemove.push(object);
            applyObstacleEffect(object.userData.type);
        }
    });
    objectsToRemove.forEach(object => scene.remove(object));
}

// Function to select truck type
function selectTruck(truckType) {
    console.log(`Selecting truck: ${truckType}`);
    selectedTruckType = truckType;
    
    // Update UI to show selected truck
    document.querySelectorAll('#truck-selection .option').forEach(option => {
        option.classList.remove('selected');
    });
    
    document.querySelector(`#truck-selection .option[onclick*="${truckType}"]`).classList.add('selected');
    console.log(`Selected truck: ${truckType}`);
}

// Function to select trailer type
function selectTrailer(trailerType) {
    console.log(`Selecting trailer: ${trailerType}`);
    selectedTrailerType = trailerType;
    
    // Update UI to show selected trailer
    document.querySelectorAll('#trailer-selection .option').forEach(option => {
        option.classList.remove('selected');
    });
    
    document.querySelector(`#trailer-selection .option[onclick*="${trailerType}"]`).classList.add('selected');
    console.log(`Selected trailer: ${trailerType}`);
}

// Create a vibrating aura effect for invincibility
function createInvincibilityAura() {
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

// Truckstop upgrade functions
function refuel() {
    console.log("Attempting to refuel...");
    
    // Check if already refueling
    if (isRefueling) {
        alert("Already refueling!");
        return;
    }
    
    // If fuel is already full
    if (fuel >= 95) {
        alert("Your tank is already full!");
        return;
    }
    
    const refuelCost = 80;
    
    // Check if player has enough money
    if (money >= refuelCost) {
        // Deduct money
        money -= refuelCost;
        isRefueling = true;
        
        // Update the truckstop money display
        truckstopMoneyElem.textContent = Math.floor(money);
        
        // Update button text
        const refuelButton = Array.from(document.querySelectorAll('#truckstop-ui button'))
            .find(button => button.textContent.includes('Refuel'));
        if (refuelButton) {
            refuelButton.textContent = "Refueling...";
            refuelButton.disabled = true;
        }
        
        // Start a refueling animation/process
        const refuelInterval = setInterval(() => {
            // Add fuel gradually
            fuel += 5;
            
            // Update UI
            updateUI();
            
            // Stop when full
            if (fuel >= 100) {
                fuel = 100;
                updateUI();
                clearInterval(refuelInterval);
                
                // Reset button
                if (refuelButton) {
                    refuelButton.textContent = "Refuel (Delayed)";
                    refuelButton.disabled = false;
                }
                
                isRefueling = false;
                alert("Refueling complete!");
                console.log("Refueling complete!");
            }
        }, 500); // Add fuel every 0.5 seconds
        
        console.log(`Refueling started. Paid $${refuelCost}`);
    } else {
        // Not enough money
        alert("Not enough money to refuel!");
        console.log(`Not enough money to refuel. Need $${refuelCost}, have $${Math.floor(money)}`);
    }
}

function buyRollerDogs() {
    console.log("Attempting to buy Roller Dogs...");
    
    // Check if health is already full
    if (health >= 95) {
        alert("Your health is already full!");
        return;
    }
    
    const rollerDogsCost = 50;
    const healthBoost = 20;
    
    // Check if player has enough money
    if (money >= rollerDogsCost) {
        // Deduct money
        money -= rollerDogsCost;
        
        // Apply health boost
        health = Math.min(100, health + healthBoost);
        
        // Update UI
        updateUI();
        
        // Update the truckstop money display
        truckstopMoneyElem.textContent = Math.floor(money);
        
        // Visual feedback
        alert(`Bought Roller Dogs! Health increased by ${healthBoost}.`);
        console.log(`Bought Roller Dogs for $${rollerDogsCost}. Health increased by ${healthBoost}.`);
    } else {
        // Not enough money
        alert("Not enough money to buy Roller Dogs!");
        console.log(`Not enough money for Roller Dogs. Need $${rollerDogsCost}, have $${Math.floor(money)}`);
    }
}

function buyBluetooth() {
    console.log("Attempting to buy Bluetooth...");
    
    // Check if already has Bluetooth
    if (hasBluetooth) {
        alert("You already have Bluetooth installed!");
        return;
    }
    
    const bluetoothCost = 200;
    const earningsBoost = 0.2; // 20% earnings boost
    
    // Check if player has enough money
    if (money >= bluetoothCost) {
        // Deduct money
        money -= bluetoothCost;
        
        // Apply earnings boost
        earningMultiplier += earningsBoost;
        hasBluetooth = true;
        
        // Update the truckstop money display
        truckstopMoneyElem.textContent = Math.floor(money);
        
        // Update button appearance to show purchased
        const bluetoothButton = Array.from(document.querySelectorAll('#truckstop-ui button'))
            .find(button => button.textContent.includes('Bluetooth'));
        if (bluetoothButton) {
            bluetoothButton.textContent = "Bluetooth (Purchased)";
            bluetoothButton.style.backgroundColor = "#888";
            bluetoothButton.disabled = true;
        }
        
        console.log(`Bought Bluetooth for $${bluetoothCost}. Earnings multiplier increased to ${earningMultiplier.toFixed(2)}.`);
        
        // Visual feedback
        alert("Bluetooth purchased! Earnings increased by 20%");
    } else {
        // Not enough money
        alert("Not enough money to buy Bluetooth!");
        console.log(`Not enough money for Bluetooth. Need $${bluetoothCost}, have $${Math.floor(money)}`);
    }
}

function buyDEFDelete() {
    console.log("Attempting to buy DEF Delete...");
    
    // Check if already has DEF Delete
    if (hasDEFDelete) {
        alert("You already have DEF Delete installed!");
        return;
    }
    
    const defDeleteCost = 300;
    const fuelSavings = 0.25; // 25% less fuel consumption
    
    // Check if player has enough money
    if (money >= defDeleteCost) {
        // Deduct money
        money -= defDeleteCost;
        
        // Apply fuel consumption reduction
        fuelConsumptionRate = Math.max(0.1, fuelConsumptionRate - fuelSavings);
        hasDEFDelete = true;
        
        // Update the truckstop money display
        truckstopMoneyElem.textContent = Math.floor(money);
        
        // Update button appearance to show purchased
        const defDeleteButton = Array.from(document.querySelectorAll('#truckstop-ui button'))
            .find(button => button.textContent.includes('DEF Delete'));
        if (defDeleteButton) {
            defDeleteButton.textContent = "DEF Delete (Purchased)";
            defDeleteButton.style.backgroundColor = "#888";
            defDeleteButton.disabled = true;
        }
        
        console.log(`Bought DEF Delete for $${defDeleteCost}. Fuel consumption rate reduced to ${fuelConsumptionRate.toFixed(2)}.`);
        
        // Visual feedback
        alert("DEF Delete installed! Fuel consumption reduced by 25%");
    } else {
        // Not enough money
        alert("Not enough money to buy DEF Delete!");
        console.log(`Not enough money for DEF Delete. Need $${defDeleteCost}, have $${Math.floor(money)}`);
    }
}

// Add mobile controls
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 50; // Minimum distance for a swipe

// Add mobile controls to the game
function addMobileControls() {
    const mobileControls = document.createElement('div');
    mobileControls.id = 'mobile-controls';
    mobileControls.style.position = 'fixed';
    mobileControls.style.bottom = '20px';
    mobileControls.style.left = '0';
    mobileControls.style.width = '100%';
    mobileControls.style.display = 'flex';
    mobileControls.style.justifyContent = 'space-between';
    mobileControls.style.padding = '0 20px';
    mobileControls.style.boxSizing = 'border-box';
    mobileControls.style.zIndex = '1000';
    
    // Left lane change button
    const leftButton = document.createElement('button');
    leftButton.innerHTML = '←';
    leftButton.className = 'mobile-button';
    leftButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (lane > -1) lane--;
    });
    
    // Right lane change button
    const rightButton = document.createElement('button');
    rightButton.innerHTML = '→';
    rightButton.className = 'mobile-button';
    rightButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (lane < 1) lane++;
    });
    
    // Pause button
    const pauseButton = document.createElement('button');
    pauseButton.innerHTML = '⏸️';
    pauseButton.className = 'mobile-button';
    pauseButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        togglePause();
    });
    
    // Add buttons to the controls container
    mobileControls.appendChild(leftButton);
    mobileControls.appendChild(pauseButton);
    mobileControls.appendChild(rightButton);
    
    // Add the controls to the page
    document.body.appendChild(mobileControls);
    
    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .mobile-button {
            background: rgba(255, 255, 255, 0.3);
            border: 2px solid white;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            color: white;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
        }
        
        .mobile-button:active {
            background: rgba(255, 255, 255, 0.5);
        }
        
        @media (min-width: 769px) {
            #mobile-controls {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Add touch event listeners for swipe detection
function initializeTouchControls() {
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, false);
    
    document.addEventListener('touchmove', (e) => {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Only handle horizontal swipes (ignore vertical scrolling)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
            e.preventDefault(); // Prevent scrolling when swiping
            if (deltaX > 0 && lane < 1) {
                // Swipe right
                lane++;
            } else if (deltaX < 0 && lane > -1) {
                // Swipe left
                lane--;
            }
            
            // Reset touch start coordinates
            touchStartX = null;
            touchStartY = null;
        }
    }, false);
    
    document.addEventListener('touchend', () => {
        touchStartX = null;
        touchStartY = null;
    }, false);
}

// Add responsive styles for mobile UI
function addResponsiveStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            #score-container {
                font-size: 14px !important;
                padding: 5px !important;
                top: 10px !important;
            }
            
            #health-container, #fuel-container, #money-container {
                margin: 2px !important;
                padding: 3px 6px !important;
            }
            
            #game-over {
                font-size: 16px !important;
                padding: 15px !important;
            }
            
            #truckstop-ui {
                font-size: 14px !important;
                padding: 10px !important;
                width: 90% !important;
                max-width: 300px !important;
            }
            
            .upgrade-button {
                font-size: 12px !important;
                padding: 8px !important;
                margin: 5px !important;
            }
            
            #lizard-warning {
                font-size: 16px !important;
                padding: 10px !important;
            }
            
            .mobile-notice {
                display: block;
                position: fixed;
                bottom: 90px;
                left: 0;
                width: 100%;
                text-align: center;
                color: white;
                font-size: 14px;
                padding: 10px;
                background: rgba(0, 0, 0, 0.5);
                pointer-events: none;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add mobile instructions
    const mobileNotice = document.createElement('div');
    mobileNotice.className = 'mobile-notice';
    mobileNotice.innerHTML = 'Swipe left/right or use buttons to change lanes';
    mobileNotice.style.display = 'none';
    document.body.appendChild(mobileNotice);
    
    // Only show the notice on mobile devices
    if (window.innerWidth <= 768) {
        mobileNotice.style.display = 'block';
        // Hide the notice after 5 seconds
        setTimeout(() => {
            mobileNotice.style.opacity = '0';
            mobileNotice.style.transition = 'opacity 1s';
            setTimeout(() => mobileNotice.remove(), 1000);
        }, 5000);
    }
}
