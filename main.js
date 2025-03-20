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
    { weight: 1, type: 'text', content: 'REST AREA 10 MILES' },
    { weight: 1, type: 'text', content: 'GAS FOOD LODGING' },
    { weight: 1, type: 'text', content: 'BROKER TRANSPARENCY NOW!' },
    { weight: 1, type: 'text', content: 'Your Ad Here' },
    { weight: 1, type: 'text', content: 'Strong Solo Sergey Wanted' },
    { weight: 1, type: 'text', content: 'Lip Pillows and Freedom' },
    { weight: 1, type: 'text', content: 'SAY NO TO CHEAP FREIGHT' },
    { weight: 1.1, type: 'image', content: './billboard-images/freight360.png' },
    { weight: 1.1, type: 'image', content: './billboard-images/loadpartner.png' },
    { weight: 1.2, type: 'image', content: './billboard-images/wtt.jpg' },
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
let speedIncreaseRate = 0.0007; // Speed increase per meter traveled
let maxSpeedMultiplier = 3.5; // Maximum speed will be baseSpeed * maxSpeedMultiplier
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
let difficultyLevel = 'medium';
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

// Leaderboard crashed trucks
let leaderboardData = [];
let placedCrashedTrucks = new Set(); // To track which distances we've already placed crashed trucks for
let upcomingCrashedTrucks = []; // Sorted list of upcoming distances for crashed trucks

// Active powerups tracking
let activePowerups = []; // Array to track active powerups and their remaining time

// Upgrade tracking
let hasBluetooth = false;
let hasDEFDelete = false;
let isRefueling = false;

// Truck and trailer selection
let selectedTruckType = 'flipFlopSpecial'; // Default truck
let selectedTrailerType = 'dryVan'; // Default trailer

// UI Elements - Get references and check if they exist
let healthElem, fuelElem, moneyElem, distanceElem, speedElem, truckstopMoneyElem, finalScoreElem;

// Function to initialize UI elements
function initializeUIElements() {
    healthElem = document.getElementById('health-value');
    fuelElem = document.getElementById('fuel-value');
    moneyElem = document.getElementById('money-value');
    distanceElem = document.getElementById('distance-value');
    speedElem = document.getElementById('speed-value');
    truckstopMoneyElem = document.getElementById('truckstop-money');
    finalScoreElem = document.getElementById('final-score');
    
    // Log which elements were not found for debugging
    if (!healthElem) console.warn("Health element not found");
    if (!fuelElem) console.warn("Fuel element not found");
    if (!moneyElem) console.warn("Money element not found");
    if (!distanceElem) console.warn("Distance element not found");
    if (!speedElem) console.warn("Speed element not found");
    if (!truckstopMoneyElem) console.warn("Truckstop money element not found");
    if (!finalScoreElem) console.warn("Final score element not found");
}

// Call this function when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', function() {
    initializeUIElements();
    console.log("UI elements initialized on DOMContentLoaded");
});

// Environment settings
const regions = [
    { 
        groundColor: 0x3d9e41, 
        skyColor: 0x87ceeb, 
        name: 'Plains',
        horizonType: 'hills',
        horizonColor: 0x2d7e31
    },
    { 
        groundColor: 0x8b4513, 
        skyColor: 0xffa07a, 
        name: 'Desert',
        horizonType: 'mesa',
        horizonColor: 0x7a3513
    },
    { 
        groundColor: 0x228b22, 
        skyColor: 0x4682b4, 
        name: 'Forest',
        horizonType: 'forest',
        horizonColor: 0x0f5c0f
    }
];

// Game objects
const powerUpTypes = [
    { type: 'zaps', weight: 5 },
    { type: 'energy', weight: 5 },
    { type: 'wrench', weight: 2 },
    { type: 'fuelCan', weight: 4 }
];

const obstacleTypes = [
    { type: 'doubleBroker', weight: 2 },
    { type: 'lotLizard', weight: 2 },
    { type: 'lowBridge', weight: 1 },
    { type: 'dotOfficer', weight: 2 }
];

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
        clock.stop();
        document.getElementById('ui').insertAdjacentHTML('beforeend',
            '<div id="pause-message" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);padding:20px;border-radius:5px;color:white;font-size:24px;z-index:1000;">PAUSED - Press P to resume</div>');
    } else {
        clock.start();
        const pauseMsg = document.getElementById('pause-message');
        if (pauseMsg) pauseMsg.remove();
    }
}

// Function to create UI elements if they don't exist
function createGameUI() {
    // Check if game UI already exists
    let gameUI = document.getElementById('game-ui');
    
    if (!gameUI) {
        console.log("Creating game UI elements");
        
        // Create the main UI container
        gameUI = document.createElement('div');
        gameUI.id = 'game-ui';
        gameUI.style.position = 'fixed';
        gameUI.style.top = '10px';
        gameUI.style.left = '10px';
        gameUI.style.display = 'flex';
        gameUI.style.flexDirection = 'column';
        gameUI.style.gap = '10px';
        gameUI.style.background = 'rgba(0, 0, 0, 0.7)';
        gameUI.style.color = 'white';
        gameUI.style.padding = '15px';
        gameUI.style.borderRadius = '10px';
        gameUI.style.zIndex = '1000';
        gameUI.style.fontFamily = 'Arial, sans-serif';
        document.body.appendChild(gameUI);
        
        // Create stat elements
        const stats = [
            { id: 'health', label: 'Health', value: '100' },
            { id: 'fuel', label: 'Fuel', value: '100' },
            { id: 'money', label: 'Money', value: '0' },
            { id: 'distance', label: 'Distance', value: '0' },
            { id: 'speed', label: 'Speed', value: '60' }
        ];
        
        stats.forEach(stat => {
            const statContainer = document.createElement('div');
            statContainer.className = 'stat';
            statContainer.style.display = 'flex';
            statContainer.style.justifyContent = 'space-between';
            statContainer.style.width = '200px';
            
            const label = document.createElement('span');
            label.textContent = stat.label + ':';
            label.style.fontWeight = 'bold';
            
            const value = document.createElement('span');
            value.id = stat.id + '-value';
            value.textContent = stat.value;
            
            statContainer.appendChild(label);
            statContainer.appendChild(value);
            gameUI.appendChild(statContainer);
        });
    }
    
    // Re-initialize UI elements after creating them
    initializeUIElements();
    console.log("UI elements re-initialized after creating game UI");
}

function startEndlessRunnerGame() {
    if (gameStarted) return;
    
    // Get player name
    let playerName = document.getElementById('player-name').value.trim();
    
    // Default to a random trucker handle if left blank
    if (!playerName) {
        const randomHandles = ['RoadDog', 'BigRigBoss', 'GearJammer', 'DieselDave', 'HighwayHero', 
                             'AsphaltCowboy', 'MileMarker', 'RubberDuck', 'NightRider', 'SmokeEater'];
        playerName = randomHandles[Math.floor(Math.random() * randomHandles.length)] + 
                     Math.floor(Math.random() * 99 + 1);
    }
    
    // Store the player name for later use
    window.currentPlayerName = playerName;
    
    // Hide the start screen
    document.getElementById('start-screen').style.display = 'none';
    
    // Show the UI
    const uiElement = document.getElementById('ui');
    if (uiElement) uiElement.style.display = 'flex';
    
    // Make sure UI elements are initialized - important to call again here
    initializeUIElements();
    console.log("UI elements initialized on game start");

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
    
    // Clear any active powerups from previous game
    clearAllActivePowerups();
    isZapsActive = false;
    isInvincible = false;
    
    // Reset crashed truck tracking
    placedCrashedTrucks.clear();
    
    // Sort leaderboard data by distance for easy access
    upcomingCrashedTrucks = [...leaderboardData]
        .map(entry => entry.distance)
        .filter(distance => distance > 100) // Filter out very short distances
        .sort((a, b) => a - b); // Sort in ascending order
    
    // Initialize mobile controls
    addMobileControls();
    initializeTouchControls();
    addResponsiveStyles();

    // Create UI elements if they don't exist
    createGameUI();

    // Update UI immediately
    updateUI();

    // Start the game
    animate();
}

// Function to initialize UI element references
function initializeUIElements() {
    console.log("Initializing UI elements");
    
    // Re-assign UI element references to global variables
    healthElem = document.getElementById('health-value');
    fuelElem = document.getElementById('fuel-value');
    moneyElem = document.getElementById('money-value');
    distanceElem = document.getElementById('distance-value');
    speedElem = document.getElementById('speed-value');
    truckstopMoneyElem = document.getElementById('truckstop-money');
    finalScoreElem = document.getElementById('final-score');
    
    // Check if all the required UI elements are present
    if (!healthElem) console.warn("Health value element not found");
    if (!fuelElem) console.warn("Fuel value element not found");
    if (!moneyElem) console.warn("Money value element not found");
    if (!distanceElem) console.warn("Distance value element not found");
    if (!speedElem) console.warn("Speed value element not found");
    
    console.log("UI elements initialized");
}

function setDifficulty(level) {
    console.log("Setting difficulty to:", level);
    difficultyLevel = level;
    switch (level) {
        case 'easy':
            baseSpeed = 8;
            earningMultiplier = 1;
            speedIncreaseRate = 0.0005; // Slower speed increase for easy mode
            break;
        case 'medium':
            baseSpeed = 10;
            earningMultiplier = 2;
            speedIncreaseRate = 0.001; // Medium speed increase
            break;
        case 'hard':
            baseSpeed = 12;
            earningMultiplier = 3;
            speedIncreaseRate = 0.0015; // Faster speed increase for hard mode
            break;
    }
    speed = baseSpeed;
}

function updateUI() {
    if (healthElem) healthElem.textContent = Math.floor(health);
    if (fuelElem) fuelElem.textContent = Math.floor(fuel);
    if (moneyElem) moneyElem.textContent = Math.floor(money);
    if (distanceElem) distanceElem.textContent = Math.floor(distanceTraveled);
    
    // Update speed display - convert to mph for a more realistic feel
    const speedMph = Math.floor(speed * 6); // Simple conversion for visual purposes
    if (speedElem) speedElem.textContent = speedMph;
    
    // Update active powerups UI
    updateActivePowerupsUI();
}

// Function to update the active powerups UI
function updateActivePowerupsUI() {
    // Find or create the powerups container
    let powerupsContainer = document.getElementById('powerups-container');
    if (!powerupsContainer) {
        powerupsContainer = document.createElement('div');
        powerupsContainer.id = 'powerups-container';
        powerupsContainer.className = 'stat';
        powerupsContainer.style.position = 'fixed';
        powerupsContainer.style.display = 'flex';
        powerupsContainer.style.flexDirection = 'column';
        powerupsContainer.style.gap = '5px';
        powerupsContainer.style.background = 'rgba(0, 0, 0, 0.5)';
        powerupsContainer.style.padding = '10px';
        powerupsContainer.style.borderRadius = '10px';
        powerupsContainer.style.zIndex = '100';

        if(window.innerWidth <= 768) {
            powerupsContainer.style.top = window.innerHeight - 100;
            console.log(window.innerHeight-100);
        } else {
            powerupsContainer.style.top = '20px';
        }

        powerupsContainer.style.right = '20px';

        document.body.appendChild(powerupsContainer);
    }
    
    // Clear existing content
    powerupsContainer.innerHTML = '<div style="font-weight: bold; margin-bottom: 5px; text-align: center;">Active Powerups</div>';
    
    // Check if there are any active powerups
    if (activePowerups.length === 0) {
        const noPowerups = document.createElement('div');
        noPowerups.textContent = 'None';
        noPowerups.style.textAlign = 'center';
        noPowerups.style.color = '#888';
        noPowerups.style.fontSize = '14px';
        powerupsContainer.appendChild(noPowerups);
    } else {
        // Sort powerups by remaining time (ascending)
        activePowerups.sort((a, b) => a.remainingTime - b.remainingTime);
        
        // Add each active powerup to the container
        activePowerups.forEach(powerup => {
            const powerupElem = document.createElement('div');
            powerupElem.style.display = 'flex';
            powerupElem.style.justifyContent = 'space-between';
            powerupElem.style.alignItems = 'center';
            powerupElem.style.padding = '3px 8px';
            powerupElem.style.borderRadius = '5px';
            
            // Different colors based on powerup type
            let backgroundColor, icon, label;
            switch (powerup.type) {
                case 'zaps':
                    backgroundColor = 'rgba(255, 215, 0, 0.3)'; // Gold for ZAPS
                    icon = '⚡';
                    label = 'ZAPS';
                    break;
                case 'energy':
                    backgroundColor = 'rgba(0, 255, 0, 0.3)'; // Green for Energy
                    icon = '🔋';
                    label = 'Energy';
                    break;
                default:
                    backgroundColor = 'rgba(255, 255, 255, 0.3)'; // Default
                    icon = '✨';
                    label = powerup.type;
            }
            
            powerupElem.style.backgroundColor = backgroundColor;
            
            // Create the label with icon
            const nameSpan = document.createElement('span');
            nameSpan.textContent = `${icon} ${label}`;
            nameSpan.style.fontWeight = 'bold';
            
            // Create the timer
            const timerSpan = document.createElement('span');
            const seconds = Math.ceil(powerup.remainingTime / 1000);
            timerSpan.textContent = `${seconds}s`;
            timerSpan.style.marginLeft = '10px';
            
            // Pulse animation for ending soon
            if (seconds <= 5) {
                timerSpan.style.animation = 'pulse 1s infinite';
                // Add keyframes if they don't exist yet
                if (!document.getElementById('powerup-animation-style')) {
                    const style = document.createElement('style');
                    style.id = 'powerup-animation-style';
                    style.textContent = `
                        @keyframes pulse {
                            0% { opacity: 1; }
                            50% { opacity: 0.5; }
                            100% { opacity: 1; }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
            
            powerupElem.appendChild(nameSpan);
            powerupElem.appendChild(timerSpan);
            powerupsContainer.appendChild(powerupElem);
        });
    }
}

// Function to clear all active powerups
function clearAllActivePowerups() {
    // Copy the array to avoid issues with modifying while iterating
    const powerupsCopy = [...activePowerups];
    
    // Clear each powerup
    powerupsCopy.forEach(powerup => {
        // Remove visual effects if any
        if (powerup.effect && truck) {
            truck.remove(powerup.effect);
        }
        
        // Clear associated timeouts and intervals
        if (activePowerupTimeouts[powerup.id]) {
            clearTimeout(activePowerupTimeouts[powerup.id].timeout);
            clearInterval(activePowerupTimeouts[powerup.id].interval);
            delete activePowerupTimeouts[powerup.id];
        }
        
        // Reset any global flags based on powerup type
        switch (powerup.type) {
            case 'zaps':
                isZapsActive = false;
                isInvincible = false;
                break;
            case 'energy':
                // Energy speed reset happens automatically when the game ends
                break;
        }
    });
    
    // Clear the array
    activePowerups = [];
    
    // Reset the timeouts object
    activePowerupTimeouts = {};
    
    // Update the UI
    updateActivePowerupsUI();
}

function gameOver() {
    console.log("Game over!");
    gameStarted = false;
    
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) gameOverElement.style.display = 'block';
    
    // Calculate distance and money
    const finalDistance = Math.floor(distanceTraveled);
    const finalMoney = Math.floor(money);
    
    // Calculate Rate Per Mile (RPM)
    const rpm = finalDistance > 0 ? (finalMoney / finalDistance).toFixed(2) : 0;
    
    // Update final score display
    if (finalScoreElem) finalScoreElem.textContent = `Distance: ${finalDistance}m | Money: $${finalMoney}`;
    
    const rpmScoreElem = document.getElementById('rpm-score');
    if (rpmScoreElem) rpmScoreElem.textContent = `Rate per Mile: $${rpm}`;
    
    // Clear all active powerups
    clearAllActivePowerups();
    
    // Save score to Firebase if distance is at least 100 meters (prevents junk entries)
    if (finalDistance > 100 && window.currentPlayerName && window.firebaseRefs) {
        const scoreData = {
            playerName: window.currentPlayerName,
            distance: finalDistance,
            money: finalMoney,
            rpm: parseFloat(rpm),
            difficulty: difficultyLevel,
            truck: selectedTruckType,
            trailer: selectedTrailerType,
            timestamp: Date.now()
        };
        
        // Push the score to the leaderboard collection
        try {
            const { ref, push } = window.firebaseRefs;
            const leaderboardRef = ref(window.firebaseDatabase, 'leaderboard');
            push(leaderboardRef, scoreData);
            console.log("Score saved to leaderboard!");
            
            // Refresh leaderboard data after adding new score
            fetchLeaderboardData();
        } catch (error) {
            console.error("Error saving score:", error);
        }
    }
}

function shareScore() {
    const score = Math.floor(distanceTraveled);
    const earnedMoney = Math.floor(money);
    const rpm = score > 0 ? (earnedMoney / score).toFixed(2) : 0;
    
    const message = `I just hauled ${score}m in Freight Frenzy with a Rate/Mile of $${rpm}! Can you beat that? #FreightFrenzy`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(twitterUrl, '_blank');
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
    messageDiv.className = 'game-message'; // Add a class for easier styling
    messageDiv.style.background = 'rgba(0,0,0,0.9)';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '20px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.fontSize = '24px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.zIndex = '1001';
    messageDiv.style.width = '100%';
    messageDiv.style.boxSizing = 'border-box';
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
        
        // Move clouds with the player, keeping them in the background
        scene.children.forEach(object => {
            if (object.userData && object.userData.isCloudGroup) {
                // Keep clouds at a fixed position relative to the camera
                object.position.z = truck.position.z - 400;
                
                // Slowly drift clouds for a dynamic sky effect
                object.children.forEach(cloudGroup => {
                    cloudGroup.position.x += Math.sin(Date.now() * 0.0001 + cloudGroup.position.z * 0.01) * 0.05;
                });
            }
        });
        
        // Switch regions based on distance traveled
        if (Math.floor(distanceTraveled / 2000) > regionIndex) {
            const oldRegionIndex = regionIndex;
            regionIndex = Math.floor(distanceTraveled / 2000) % regions.length;
            
            // If region changed, update the sky color
            if (oldRegionIndex !== regionIndex) {
                scene.background = new THREE.Color(regions[regionIndex].skyColor);
                
                // Regenerate clouds for new region with different positioning
                scene.children.forEach(object => {
                    if (object.userData && object.userData.isCloudGroup) {
                        scene.remove(object);
                    }
                });
                
                // Create new clouds for the new region
                const newClouds = createClouds();
                newClouds.userData = { isCloudGroup: true };
                newClouds.position.z = truck.position.z - 400;
                scene.add(newClouds);
                
                // Display region notification
                displayInGameMessage(`Entering ${regions[regionIndex].name} region`);
            }
        }
        
        // Create new segments as needed
        while (lastSegmentZ > truck.position.z - (segmentLength * visibleSegments)) {
            const newZ = lastSegmentZ - segmentLength;
            const segment = createHighwaySegment(newZ);
            scene.add(segment);
            segments.push(segment);
            lastSegmentZ = newZ;
        }
        
        // Check for upcoming crashed trucks from leaderboard
        while (upcomingCrashedTrucks.length > 0 && 
               upcomingCrashedTrucks[0] <= distanceTraveled + 500 && // Look ahead 500 units
               !placedCrashedTrucks.has(upcomingCrashedTrucks[0])) {
            
            const distance = upcomingCrashedTrucks.shift();
            
            // Find the entry with this distance
            const entry = leaderboardData.find(e => e.distance === distance);
            if (entry) {
                // Create crashed truck at this distance
                const crashedTruck = createCrashedTruck(distance, entry.playerName);
                
                // Calculate position on the road
                // Add a slight random offset to avoid all trucks appearing at exact milestone positions
                const randomZOffset = (Math.random() - 0.5) * 5; // ±2.5 units of random variation
                const zPosition = truck.position.z - ((distance - distanceTraveled) * 1) + randomZOffset;
                
                // Position the crashed truck at the calculated Z position
                // The X position (off to the side of the road) is handled in createCrashedTruck
                crashedTruck.position.z = zPosition;
                
                // Add slight random rotation for more natural look
                crashedTruck.rotation.y += (Math.random() - 0.5) * 0.2;
                
                // Add to scene
                scene.add(crashedTruck);
                
                // Mark as placed
                placedCrashedTrucks.add(distance);
                
                console.log(`Placed crashed truck for ${entry.playerName} at distance ${distance}m (z=${zPosition})`);
            }
        }
        
        // Remove segments that are too far behind
        while (segments.length > 0 && segments[0].userData.z > truck.position.z + segmentLength * 3) {
            scene.remove(segments.shift());
        }
        
        // Remove crashed trucks that are too far behind
        scene.children.forEach(object => {
            if (object.userData && object.userData.isCrashedLeaderboardTruck) {
                // Only remove if it's well behind the player to avoid pop-in/pop-out effects
                if (object.position.z > truck.position.z + 150) {
                    scene.remove(object);
                }
            }
        });
        
        // Spawn obstacles and power-ups
        spawnTimer += speed * delta;
        if (spawnTimer > 20) {
            if (Math.random() < 0.5) {
                scene.add(createObstacle(getWeightedRandomItem(obstacleTypes), truck.position.z - 30));
            } else {
                scene.add(createPowerUp(getWeightedRandomItem(powerUpTypes), truck.position.z - 30));
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
            if (object.userData && object.userData.isCollectible) {
                const mesh = object.children[0];
                if (mesh && mesh.userData) {
                    // Update the floating animation
                    if (typeof mesh.userData.floatAngle !== 'undefined') {
                        mesh.userData.floatAngle += delta * 2;
                        mesh.position.y = mesh.userData.baseY + Math.sin(mesh.userData.floatAngle) * 0.5;
                    }
                    
                    // Update the spinning animation based on powerup type
                    if (object.userData.type === 'zaps') {
                        if (typeof mesh.userData.spinAngle !== 'undefined') {
                            mesh.userData.spinAngle += mesh.userData.spinSpeed || 0.02;
                            mesh.rotation.y = mesh.userData.spinAngle;
                            mesh.rotation.x = Math.PI / 6; // Tilt ZAPS can for better visibility
                        }
                    } else {
                        // Standard spinning for other powerups
                        if (typeof mesh.userData.spinAngle !== 'undefined') {
                            mesh.userData.spinAngle += delta * 2;
                            mesh.rotation.y = mesh.userData.spinAngle;
                        }
                    }
                }
            }
        });
    }
    
    if (inTruckstop) animateLotLizard();
    
    // Update visibility of text labels on crashed trucks based on distance to player
    scene.children.forEach(object => {
        if (object.userData && object.userData.isCrashedLeaderboardTruck) {
            // Calculate distance to the player truck
            const distanceToPlayer = Math.abs(object.position.z - truck.position.z);
            
            // Find the text group (which contains the sprite)
            const textGroup = object.children.find(child => child.type === 'Group' && child.position.y > 5);
            
            if (textGroup) {
                // Only show text when player is relatively close (within 150 units)
                textGroup.visible = distanceToPlayer < 150;
                
                // Update the sprite's rotation to always face the camera
                textGroup.lookAt(camera.position);
            }
        }
    });
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

// Initialize everything when the window loads
window.addEventListener('load', function() {
    // Fetch leaderboard data when the game loads
    if (window.firebaseRefs) {
        fetchLeaderboardData();
    } else {
        // If Firebase is not initialized yet, wait for it
        const firebaseCheckInterval = setInterval(() => {
            if (window.firebaseRefs) {
                fetchLeaderboardData();
                clearInterval(firebaseCheckInterval);
            }
        }, 500);
    }
});

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

// Function to create clouds
function createClouds() {
    const cloudsGroup = new THREE.Group();
    
    // Create 10-15 clouds at various positions
    const cloudCount = 10 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < cloudCount; i++) {
        const cloudGroup = new THREE.Group();
        
        // Create multiple spheres for each cloud
        const puffCount = 2 + Math.floor(Math.random() * 4);
        const cloudSize = 5 + Math.random() * 15;
        
        // Create a slightly varying cloud material
        const whiteness = 0.9 + Math.random() * 0.1; // Between 0.9 and 1.0
        const cloudColor = new THREE.Color(whiteness, whiteness, whiteness);
        const cloudMaterial = new THREE.MeshPhongMaterial({ 
            color: cloudColor, 
            emissive: cloudColor, 
            emissiveIntensity: 0.1,
            flatShading: true
        });
        
        for (let j = 0; j < puffCount; j++) {
            const size = cloudSize * (0.6 + Math.random() * 0.6);
            const cloudGeometry = new THREE.SphereGeometry(size, 7, 7);
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            
            // Position each puff within the cloud
            const offsetX = j * size * 0.7;
            const offsetY = Math.random() * size * 0.3;
            const offsetZ = Math.random() * size * 0.3 - size * 0.15;
            
            cloud.position.set(offsetX, offsetY, offsetZ);
            cloudGroup.add(cloud);
        }
        
        // Position the cloud in the sky
        const yPosition = 80 + Math.random() * 120; // Between 80 and 200 units high
        const xPosition = -250 + Math.random() * 500; // Between -250 and 250 units left/right
        const zPosition = -800 + Math.random() * 1600; // From -800 to 800 in the distance
        
        cloudGroup.position.set(xPosition, yPosition, zPosition);
        
        // Add some rotation for variety
        cloudGroup.rotation.y = Math.random() * Math.PI * 2;
        cloudsGroup.add(cloudGroup);
    }
    
    return cloudsGroup;
}

// Function to create horizon elements based on region
function createHorizonElements(regionType, startZ) {
    const horizonGroup = new THREE.Group();
    
    // For performance optimization, reduce complexity based on distance from road
    const farDistance = Math.abs(startZ) > 500;
    // Use lower polygon counts for distant objects
    const detailLevel = farDistance ? 4 : 8;
    
    switch (regionType) {
        case 'hills':
            // Create fewer hills for better performance
            const hillCount = farDistance ? 3 : 5;
            for (let i = 0; i < hillCount; i++) {
                // Create overlapping hills with different sizes
                const hillWidth = 150 + Math.random() * 150;
                const hillHeight = 15 + Math.random() * 20;
                const hillDepth = 50 + Math.random() * 70;
                
                // Use a custom hill shape - half ellipsoid
                const hillGeometry = new THREE.SphereGeometry(1, detailLevel, Math.max(4, detailLevel/2), 0, Math.PI * 2, 0, Math.PI / 2);
                hillGeometry.scale(hillWidth, hillHeight, hillDepth);
                
                const hillMaterial = new THREE.MeshPhongMaterial({ 
                    color: regions.find(r => r.name === 'Plains').horizonColor,
                    flatShading: true
                });
                
                const hill = new THREE.Mesh(hillGeometry, hillMaterial);
                
                // Position the hill along the horizon - prevent overlap with highway
                let hillXPosition = -300 + i * 150 + (Math.random() * 100 - 50);
                
                // Ensure hills don't overlap the road (road is 16 units wide)
                // Create a gap in the middle of at least 40 units (-20 to +20)
                if (hillXPosition > -20 && hillXPosition < 20) {
                    if (hillXPosition > 0) {
                        hillXPosition = 40 + Math.random() * 60; // Move to right side
                    } else {
                        hillXPosition = -40 - Math.random() * 60; // Move to left side
                    }
                }
                
                const hillZPosition = startZ - 300; // Behind the current segment
                
                hill.position.set(hillXPosition, -hillHeight * 0.95, hillZPosition);
                horizonGroup.add(hill);
            }
            break;
            
        case 'mesa':
            // Create fewer mesas for better performance
            const mesaCount = farDistance ? 2 : 3;
            for (let i = 0; i < mesaCount; i++) {
                const mesaWidth = 60 + Math.random() * 100;
                const mesaHeight = 25 + Math.random() * 35;
                const mesaDepth = 60 + Math.random() * 100;
                
                // Create the base - a box with a slightly tapered shape
                const baseGeometry = new THREE.BoxGeometry(mesaWidth, mesaHeight, mesaDepth, 1, 1, 1);
                const baseMaterial = new THREE.MeshPhongMaterial({ 
                    color: regions.find(r => r.name === 'Desert').horizonColor,
                    flatShading: true
                });
                
                const mesa = new THREE.Mesh(baseGeometry, baseMaterial);
                
                // Add a second smaller box on top sometimes (but not for distant mesas to save performance)
                if (!farDistance && Math.random() > 0.5) {
                    const topWidth = mesaWidth * (0.5 + Math.random() * 0.3);
                    const topHeight = mesaHeight * (0.3 + Math.random() * 0.2);
                    const topDepth = mesaDepth * (0.5 + Math.random() * 0.3);
                    
                    const topGeometry = new THREE.BoxGeometry(topWidth, topHeight, topDepth, 1, 1, 1);
                    const top = new THREE.Mesh(topGeometry, baseMaterial);
                    
                    top.position.y = mesaHeight / 2 + topHeight / 2;
                    mesa.add(top);
                }
                
                // Position the mesa along the horizon - prevent overlap with road
                let xPosition = -250 + i * 180 + (Math.random() * 60 - 30);
                
                // Ensure mesas don't overlap the road
                if (xPosition > -40 && xPosition < 40) {
                    if (xPosition > 0) {
                        xPosition = 40 + Math.random() * 80; // Move to right side
                    } else {
                        xPosition = -40 - Math.random() * 80; // Move to left side
                    }
                }
                
                const zPosition = startZ - 350 - Math.random() * 150; // Further back
                
                mesa.position.set(xPosition, -mesaHeight / 2, zPosition);
                horizonGroup.add(mesa);
            }
            break;
            
        case 'forest':
            // Create a less dense forest line for better performance
            const forestLineLength = 800; // Length of the forest line
            const forestSegments = farDistance ? 8 : 12; // Fewer segments for distant forests
            const segmentLength = forestLineLength / forestSegments;
            
            for (let i = 0; i < forestSegments; i++) {
                // Create clumps of trees
                const clumpWidth = segmentLength * 1.2;
                const treeCount = farDistance ? 2 : 3; // Fewer trees per clump for distant forests
                
                for (let j = 0; j < treeCount; j++) {
                    // Create a simple conifer shape (cone + cylinder)
                    const trunkGeometry = new THREE.CylinderGeometry(1, 1.2, 3 + Math.random() * 3, detailLevel);
                    const trunkMaterial = new THREE.MeshPhongMaterial({ 
                        color: 0x3d2817, 
                        flatShading: true 
                    });
                    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                    
                    const foliageHeight = 8 + Math.random() * 7;
                    const foliageGeometry = new THREE.ConeGeometry(3 + Math.random() * 2, foliageHeight, detailLevel);
                    const foliageMaterial = new THREE.MeshPhongMaterial({ 
                        color: regions.find(r => r.name === 'Forest').horizonColor, 
                        flatShading: true 
                    });
                    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
                    
                    foliage.position.y = foliageHeight / 2 + 1.5;
                    
                    const tree = new THREE.Group();
                    tree.add(trunk);
                    tree.add(foliage);
                    
                    // Random position within the clump, ensuring no trees are on the road
                    let treeX = -forestLineLength/2 + i * segmentLength + Math.random() * clumpWidth - clumpWidth/2;
                    
                    // Ensure trees don't overlap the road
                    if (treeX > -40 && treeX < 40) {
                        if (treeX > 0) {
                            treeX = 40 + Math.random() * 50;
                        } else {
                            treeX = -40 - Math.random() * 50;
                        }
                    }
                    
                    const treeZ = startZ - 300 - Math.random() * 80;
                    
                    // Random scale
                    const treeScale = 2 + Math.random() * 2;
                    tree.scale.set(treeScale, treeScale, treeScale);
                    
                    tree.position.set(treeX, 0, treeZ);
                    horizonGroup.add(tree);
                }
            }
            break;
    }
    
    return horizonGroup;
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
    road.position.y = 0.01; // Raise the road slightly above the ground to prevent z-fighting
    road.receiveShadow = true;
    segment.add(road);
    
    // Add shoulders (darker gray strips on sides of road)
    const leftShoulderGeometry = new THREE.PlaneGeometry(2, segmentLength);
    const shoulderMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const leftShoulder = new THREE.Mesh(leftShoulderGeometry, shoulderMaterial);
    leftShoulder.rotation.x = -Math.PI / 2;
    leftShoulder.position.set(-7, 0.02, zPosition + segmentLength / 2); // Slightly higher than road
    segment.add(leftShoulder);
    
    const rightShoulderGeometry = new THREE.PlaneGeometry(2, segmentLength);
    const rightShoulder = new THREE.Mesh(rightShoulderGeometry, shoulderMaterial);
    rightShoulder.rotation.x = -Math.PI / 2;
    rightShoulder.position.set(7, 0.02, zPosition + segmentLength / 2); // Slightly higher than road
    segment.add(rightShoulder);
    
    const groundGeometry = new THREE.PlaneGeometry(100, segmentLength);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: regions[regionIndex].groundColor });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = zPosition + segmentLength / 2;
    ground.position.y = -0.2; // Increased difference between ground and road to prevent bleeding
    ground.receiveShadow = true;
    segment.add(ground);
    
    // Add horizon elements based on current region
    segment.add(createHorizonElements(regions[regionIndex].horizonType, zPosition));
    
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
    
    // Performance optimization - reduce environmental elements for distant segments
    // or when the player is moving fast
    const reduceDetail = Math.abs(zPosition) > 1000 || (speed > baseSpeed * 2);
    
    // Add trees on both sides of the road with REDUCED density
    const isForestRegion = regions[regionIndex].name === 'Forest';
    
    // Add vegetation only on a probability basis (significantly reduced)
    if (Math.random() < (reduceDetail ? 0.15 : 0.25)) { // Reduced from 0.3/0.6 to 0.15/0.25
        // Left side - ensure minimum distance from road
        addVegetation(segment, -1, zPosition, segmentLength, isForestRegion, hasBillboards, reduceDetail);
        
        // Right side - ensure minimum distance from road
        addVegetation(segment, 1, zPosition, segmentLength, isForestRegion, hasBillboards, reduceDetail);
    }
    
    // Add additional random clusters of trees with more variety in specific regions (significantly reduced)
    if (Math.random() < (isForestRegion ? (reduceDetail ? 0.1 : 0.15) : (reduceDetail ? 0.05 : 0.1)) && !hasBillboards) {
        // Reduced tree count
        const treeCount = isForestRegion ? 
                         (reduceDetail ? 1 : 1 + Math.floor(Math.random() * 1)) : // Max 2 for forest
                         1; // Always just 1 for other regions
        const side = Math.random() > 0.5 ? -1 : 1;
        
        for (let i = 0; i < treeCount; i++) {
            const treeGroup = createTree();
            // Place trees at varying distances from the road in clusters
            const distanceFromRoad = 30 + Math.random() * 40; // Moved farther away (was 25+30)
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
    
    // Add rocks in desert region (severely reduced)
    if (regions[regionIndex].name === 'Desert' && Math.random() < (reduceDetail ? 0.07 : 0.15)) { // Reduced from 0.15/0.3
        const rockCount = 1; // Always just 1 rock
        const side = Math.random() > 0.5 ? -1 : 1;
        
        for (let i = 0; i < rockCount; i++) {
            const rock = createRock();
            const distanceFromRoad = 25 + Math.random() * 30; // Moved farther (was 15+25)
            const xPos = side * distanceFromRoad;
            const zPos = zPosition + Math.random() * segmentLength;
            // Vary rock sizes
            const scale = 0.7 + Math.random() * 0.8;
            rock.scale.set(scale, scale, scale);
            rock.position.set(xPos, 0, zPos);
            segment.add(rock);
        }
    }
    
    // Occasional buildings (severely reduced frequency and moved farther away)
    if (Math.random() < (reduceDetail ? 0.01 : 0.03) && !hasBillboards) { // Reduced from 0.08
        const building = createBuilding();
        const side = Math.random() > 0.5 ? -1 : 1;
        const distanceFromRoad = 50 + Math.random() * 50; // Much farther (was 35+40)
        const xPos = side * distanceFromRoad;
        const zPos = zPosition + Math.random() * segmentLength;
        building.position.set(xPos, 0, zPos);
        segment.add(building);
    }
    
    // Add bushes along the roadside (reduced)
    if (Math.random() < (reduceDetail ? 0.15 : 0.3)) { // Reduced from 0.25/0.5
        addRoadsideBushes(segment, zPosition, segmentLength, reduceDetail);
    }
}

// Helper function to add vegetation on a specific side
function addVegetation(segment, side, zPosition, segmentLength, isForestRegion, hasBillboards, reduceDetail = false) {
    // Add a mix of trees and bushes along the road edge - reduced count
    const elementCount = reduceDetail ? 1 : Math.ceil(Math.random() * 1); // Reduced - 1 max
    
    for (let i = 0; i < elementCount; i++) {
        // Decide whether to add a tree or bush
        const isTree = Math.random() < (reduceDetail ? 0.1 : 0.2); // Reduced probability of trees vs bushes
        let element;
        
        // Skip large elements if there are billboards in this segment on this side
        if (hasBillboards && isTree && ((side === -1 && zPosition % 200 < segmentLength) || 
            (side === 1 && (zPosition + 100) % 200 < segmentLength))) {
            continue; // Skip trees near billboards
        }
        
        if (isTree) {
            element = createTree();
            // Significantly increase minimum distance from road
            const distanceFromRoad = 25 + Math.random() * 20; // Moved further from road
            const xPos = side * distanceFromRoad;
            const zPos = zPosition + (i / elementCount) * segmentLength + Math.random() * 20;
            // Randomize tree size
            const scale = 0.7 + Math.random() * 0.6;
            element.scale.set(scale, scale, scale);
            element.position.set(xPos, 0, zPos);
        } else {
            element = createBush();
            // Increase minimum distance from road
            const distanceFromRoad = 15 + Math.random() * 10; // Moved further from road
            const xPos = side * distanceFromRoad;
            const zPos = zPosition + (i / elementCount) * segmentLength + Math.random() * 20;
            element.position.set(xPos, 0, zPos);
        }
        
        segment.add(element);
    }
}

// New function to add small bushes along the immediate roadside
function addRoadsideBushes(segment, zPosition, segmentLength, reduceDetail = false) {
    // Add small bushes/grass clusters very close to the road edge - reduced count
    const bushCount = reduceDetail ? 1 : Math.ceil(Math.random() * 2); // Max 2 instead of 4
    
    for (let i = 0; i < bushCount; i++) {
        // Alternate sides
        const side = i % 2 === 0 ? -1 : 1;
        const bush = createRoadsideBush();
        
        // Place farther from road edge
        const distanceFromRoad = 12 + Math.random() * 3; // Moved farther from road
        const xPos = side * distanceFromRoad;
        // Spread them out more
        const zPos = zPosition + (i / bushCount) * segmentLength + Math.random() * 20;
        
        bush.position.set(xPos, 0, zPos);
        segment.add(bush);
    }
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

// Function to create a bush
function createBush() {
    const bushGroup = new THREE.Group();
    
    // Bush base
    const bushSize = 1 + Math.random() * 1.5;
    const bushGeometry = new THREE.SphereGeometry(bushSize, 8, 6);
    const bushColor = Math.random() > 0.3 ? 0x228B22 : 0x556B2F; // Mix of green shades
    const bushMaterial = new THREE.MeshPhongMaterial({ color: bushColor });
    const bush = new THREE.Mesh(bushGeometry, bushMaterial);
    bush.position.y = bushSize * 0.8;
    bush.scale.y = 0.8;
    bush.castShadow = true;
    bushGroup.add(bush);
    
    // Add some variation with smaller spheres
    const clusters = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < clusters; i++) {
        const smallSize = bushSize * (0.5 + Math.random() * 0.3);
        const smallGeometry = new THREE.SphereGeometry(smallSize, 6, 6);
        const smallBush = new THREE.Mesh(smallGeometry, bushMaterial);
        
        // Position around the main bush
        const angle = Math.random() * Math.PI * 2;
        const distance = bushSize * 0.6;
        smallBush.position.x = Math.cos(angle) * distance;
        smallBush.position.z = Math.sin(angle) * distance;
        smallBush.position.y = bushSize * 0.7;
        smallBush.castShadow = true;
        bushGroup.add(smallBush);
    }
    
    return bushGroup;
}

// Function to create a roadside bush (smaller, more like vegetation clusters)
function createRoadsideBush() {
    const bushGroup = new THREE.Group();
    
    // Create a cluster of small green elements
    const clusterCount = 3 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < clusterCount; i++) {
        // Randomly select geometry type - sphere or cone
        const useSpikes = Math.random() > 0.6;
        
        let geometry;
        if (useSpikes) {
            // Grass-like spikes
            const height = 0.3 + Math.random() * 0.5;
            const radius = 0.1 + Math.random() * 0.2;
            geometry = new THREE.ConeGeometry(radius, height, 5);
        } else {
            // Bush-like clumps
            const size = 0.3 + Math.random() * 0.4;
            geometry = new THREE.SphereGeometry(size, 6, 4);
        }
        
        // Vary the green shades
        const greenShade = Math.random() > 0.5 ? 0x4CAF50 : 0x689F38;
        const material = new THREE.MeshPhongMaterial({ color: greenShade });
        const element = new THREE.Mesh(geometry, material);
        
        // Position in a small cluster
        const radius = 0.5;
        const angle = (i / clusterCount) * Math.PI * 2 + Math.random() * 0.3;
        element.position.x = Math.cos(angle) * radius * Math.random();
        element.position.z = Math.sin(angle) * radius * Math.random();
        element.position.y = useSpikes ? geometry.parameters.height / 2 : geometry.parameters.radius;
        
        // Add some random rotation
        element.rotation.y = Math.random() * Math.PI * 2;
        element.rotation.x = Math.random() * 0.2;
        
        bushGroup.add(element);
    }
    
    return bushGroup;
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
    
    // Ensure building sits exactly on the ground by setting y to half its height
    // The ground in the highway segment is at y=-0.1
    building.position.y = buildingType.height / 2;
    building.castShadow = true;
    buildingGroup.add(building);
    
    // Add a small foundation extending below the building to ensure it appears grounded
    const foundationGeometry = new THREE.BoxGeometry(
        buildingType.width + 2,  // Slightly wider than the building
        0.5,                    // Small height foundation
        buildingType.depth + 2  // Slightly deeper than the building
    );
    const foundationMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.y = -buildingType.height / 2 - 0.25; // Position just below the building
    buildingGroup.add(foundation);
    
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
    let analytics = null;
    
    if (typeof message === 'object') {
        messageType = message.type;
        messageContent = message.content;
        analytics = message.analytics;
    }
    
    // Handle image type
    if (messageType === 'image') {
        return new Promise((resolve) => {
            // For local billboard images, create a styled fallback text
            if (messageContent && messageContent.includes('billboard-images')) {
                // Extract the filename
                const filename = messageContent.split('/').pop().split('.')[0];
                
                // Create styled text fallback for the image
                context.fillStyle = '#ffffff';
                context.font = 'bold 80px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                
                // Add stylized text based on filename
                if (filename === 'freight360') {
                    context.fillText('FREIGHT 360', 512, 200);
                    context.font = 'bold 50px Arial';
                    context.fillText('DIGITAL FREIGHT MATCHING', 512, 300);
                } else if (filename === 'loadpartner') {
                    context.fillText('LOAD PARTNER', 512, 200);
                    context.font = 'bold 50px Arial';
                    context.fillText('CARRIER SOLUTIONS', 512, 300);
                } else if (filename === 'wtt') {
                    context.fillText('WHAT THE TRUCK', 512, 200);
                    context.font = 'bold 50px Arial';
                    context.fillText('INDUSTRY NEWS', 512, 300);
                } else {
                    // Generic fallback
                    context.fillText(filename.toUpperCase(), 512, 200);
                    context.font = 'bold 50px Arial';
                    context.fillText('TRUCKING SERVICES', 512, 300);
                }
                
                const texture = new THREE.CanvasTexture(canvas);
                texture.minFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;
                resolve(texture);
                return;
            }
            
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
    const signGeometry = new THREE.BoxGeometry(21, 10.5, 0.4); // 50% larger (from 14x7 to 21x10.5)
    const message = getWeightedRandomBillboardMessage();
    console.log("Selected billboard message:", message);

    if (message.analytics) {
        // Record analytics event for billboard impression
        if (typeof gtag === 'function') {
            gtag('event', 'billboard_impression', {
                'event_category': 'game_interaction',
                'event_label': message.analytics,
                'non_interaction': true
            });
        } else if (typeof ga === 'function') {
            // Fallback to older analytics method if gtag isn't available
            ga('send', 'event', 'game_interaction', 'billboard_impression', message.analytics);
        } else {
            console.log('Analytics event (not sent):', message.analytics);
        }
    }
    
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
    sign.position.y = 12; // Higher position for larger sign (was 10)
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
        
        const xPos = i === 0 ? -9.75 : 9.75; // Position on either side of sign (adjusted for larger sign, was -6.5/6.5)
        spotHousing.position.set(xPos, 18.1, -0.2); // Moved to top of sign and slightly back (was 13.6)
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
        spotBulb.position.set(xPos, 18, -0.15); // Aligned with housing (was 13.5)
        billboardGroup.add(spotBulb);
    }
    
    // Create small catwalk platform for maintenance - moved behind sign
    const catwalkGeometry = new THREE.BoxGeometry(21, 0.1, 0.6); // Widened to match sign (was 14)
    const catwalkMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const catwalk = new THREE.Mesh(catwalkGeometry, catwalkMaterial);
    catwalk.position.set(0, 6.75, -0.7); // Moved behind sign (slight adjustment)
    billboardGroup.add(catwalk);
    
    // Add railings to catwalk - moved behind sign
    const railingGeometry = new THREE.BoxGeometry(21, 0.5, 0.05); // Widened to match sign (was 14)
    const railingMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const railing = new THREE.Mesh(railingGeometry, railingMaterial);
    railing.position.set(0, 7.05, -0.9); // Moved behind sign (slight adjustment)
    billboardGroup.add(railing);
    
    // Ladder for maintenance access - moved to side of the structure
    const ladderWidth = 0.6;
    const ladderHeight = 10; // Taller ladder for bigger billboard (was 7)
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
    ladderGroup.position.set(8, 4.5, -0.5); // Moved to right side and behind (adjusted for larger sign, was 5.3, 3)
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

    // White background
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, 256, 256);

    // Draw the main circular puck shape 
    context.fillStyle = '#FFFFFF';
    
    // Outer ring (white edge)
    context.beginPath();
    context.arc(128, 128, 110, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.stroke();
    
    // Inner green circular area
    context.beginPath();
    context.arc(128, 128, 90, 0, Math.PI * 2);
    context.fillStyle = '#005C38'; // Dark green like ZYN
    context.fill();
    
    // Green ring around the inner circle
    context.beginPath();
    context.arc(128, 128, 100, 0, Math.PI * 2);
    context.strokeStyle = '#00AA4F'; // Brighter green ring
    context.lineWidth = 4;
    context.stroke();

    // Add "ZAPS" text in large white letters
    context.font = 'bold 50px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#FFFFFF';
    context.fillText('ZAPS', 128, 110);
    
    // Add "WINTERGREEN" text below
    context.font = 'bold 16px Arial';
    context.fillStyle = '#FFFFFF';
    context.fillText('WINTERGREEN', 128, 150);
    
    // Add "6" with "MG" in the bottom right
    context.font = 'bold 30px Arial';
    context.fillText('6', 180, 128);
    context.font = 'bold 12px Arial';
    context.fillText('MG', 180, 145);

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
    
    // Set bright chrome/silver color for the wrench with high contrast against asphalt
    const mainColor = '#E0E8F0'; // Bright silver/chrome
    const outlineColor = '#2B4C7E'; // Dark blue outline for contrast
    const highlightColor = '#FFFFFF'; // White highlight for metallic effect
    const shadowColor = '#0A2463'; // Deep blue shadow
    
    context.lineWidth = 4;
    context.strokeStyle = outlineColor;
    
    // Create a more realistic wrench shape - combination wrench with open-end and box-end
    
    // Start with a gradient fill for metallic look - reduced brightness
    const gradient = context.createLinearGradient(100, 0, 160, 256);
    gradient.addColorStop(0, mainColor);
    gradient.addColorStop(0.3, '#F0F0F0');  // Toned down highlight
    gradient.addColorStop(0.5, mainColor);
    gradient.addColorStop(0.7, shadowColor);
    gradient.addColorStop(1, mainColor);
    context.fillStyle = gradient;
    
    // Draw wrench handle with slight curve
    context.beginPath();
    context.moveTo(118, 85);  // Top of handle, just below open-end
    context.bezierCurveTo(110, 145, 110, 180, 115, 200); // Left curve of handle
    context.lineTo(140, 200); // Bottom width of handle
    context.bezierCurveTo(145, 180, 145, 145, 137, 85); // Right curve of handle
    context.closePath();
    context.fill();
    context.stroke();
    
    // Draw the open-end head (top of wrench)
    context.beginPath();
    // Left outside of open-end
    context.moveTo(118, 85);
    context.bezierCurveTo(100, 70, 85, 60, 90, 40);
    context.lineTo(105, 30);
    // Inside of open-end
    context.lineTo(115, 45);
    context.lineTo(140, 45);
    // Right outside of open-end
    context.lineTo(150, 30);
    context.bezierCurveTo(165, 60, 150, 70, 137, 85);
    context.closePath();
    context.fill();
    context.stroke();
    
    // Draw the box-end (bottom of wrench)
    context.beginPath();
    // Connect from the handle
    context.moveTo(115, 200);
    context.bezierCurveTo(110, 220, 105, 225, 100, 235);
    // Draw the box hexagon shape
    context.lineTo(105, 250);
    context.lineTo(150, 250);
    context.lineTo(155, 235);
    context.bezierCurveTo(150, 225, 145, 220, 140, 200);
    context.closePath();
    context.fill();
    context.stroke();
    
    // Add inner hexagon cutout in the box-end
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.moveTo(119, 232);
    context.lineTo(119, 243);
    context.lineTo(127, 248);
    context.lineTo(137, 243);
    context.lineTo(137, 232);
    context.lineTo(127, 227);
    context.closePath();
    context.fill();
    context.globalCompositeOperation = 'source-over';
    
    // Add highlight for metallic look
    context.fillStyle = 'rgba(255, 255, 255, 0.6)';
    context.beginPath();
    context.moveTo(118, 85);
    context.bezierCurveTo(115, 145, 115, 180, 118, 200);
    context.lineTo(125, 200);
    context.bezierCurveTo(122, 180, 122, 145, 125, 85);
    context.closePath();
    context.fill();
    
    // Add a bright yellow glow around the wrench for visibility
    context.globalCompositeOperation = 'destination-over';
    const glowGradient = context.createRadialGradient(128, 128, 50, 128, 128, 120);
    glowGradient.addColorStop(0, 'rgba(255, 217, 0, 0.46)'); // Gold glow
    glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    context.fillStyle = glowGradient;
    context.fillRect(0, 0, 256, 256);
    
    // Add text indicator
    context.globalCompositeOperation = 'source-over';
    context.font = 'bold 20px Arial';
    context.fillStyle = '#FFA500'; // Orange text
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.strokeText('REPAIR', 128, 160);
    context.fillText('REPAIR', 128, 160);
    
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
            // Changed to hockey puck shape (short cylinder)
            geometry = new THREE.CylinderGeometry(1.0, 1.0, 0.3, 32);
            material = new THREE.MeshPhongMaterial({ map: createZapsTexture(), shininess: 50 });
            break;
        case 'energy':
            geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 16);
            material = new THREE.MeshPhongMaterial({ map: createEnergyTexture(), shininess: 50 });
            break;
        case 'wrench':
            // Use a plane geometry instead of box to better display the detailed texture
            geometry = new THREE.PlaneGeometry(1.54, 3.08); // 10% larger than original 1.4 x 2.8
            material = new THREE.MeshPhongMaterial({ 
                map: createWrenchTexture(), 
                transparent: true, 
                shininess: 100,
                emissive: 0xFFD700,
                emissiveIntensity: 0.2
            });
            // Create a second plane rotated 90 degrees for visibility from all angles
            const secondGeometry = new THREE.PlaneGeometry(1.54, 3.08); // 10% larger than original 1.4 x 2.8
            const secondMaterial = new THREE.MeshPhongMaterial({ 
                map: createWrenchTexture(), 
                transparent: true, 
                shininess: 100,
                emissive: 0xFFD700,
                emissiveIntensity: 0.2
            });
            const secondPlane = new THREE.Mesh(secondGeometry, secondMaterial);
            secondPlane.rotation.y = Math.PI / 2;
            powerUpGroup.add(secondPlane);
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
    
    // For ZAPS, add custom spin speed but don't rotate here (handled in animation loop)
    if (type === 'zaps') {
        powerUpMesh.userData.spinSpeed = 0.02;
    }
    
    powerUpGroup.add(powerUpMesh);
    
    // Choose a random lane (-1, 0, 1) and use the lanePositions array to place in center of lane
    const laneIndex = Math.floor(Math.random() * 3);
    const lane = laneIndex - 1; // Convert to -1, 0, 1
    
    // Position the power-up in the lane with adjusted height based on type
    let yPosition = 2; // Default height
    if (type === 'wrench') {
        yPosition = 3; // Higher position specifically for wrench
    }
    
    powerUpGroup.position.set(lanePositions[laneIndex], yPosition, zPosition);
    
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
    
    // Initialize clouds
    const clouds = createClouds();
    clouds.userData = { isCloudGroup: true };
    clouds.position.z = -400; // Position clouds in the background
    scene.add(clouds);
}

// Add a property to store active timeouts and intervals with powerups
let activePowerupTimeouts = {};

function applyPowerUp(type) {
    switch (type) {
        case 'zaps':
            // Check if ZAPS is already active
            const existingZapsIndex = activePowerups.findIndex(p => p.type === 'zaps');
            
            if (existingZapsIndex !== -1) {
                // ZAPS already active, reset the timer
                console.log("ZAPS refreshed! Timer reset to 15 seconds");
                
                // Get the existing powerup and its ID
                const existingZaps = activePowerups[existingZapsIndex];
                const zapsId = existingZaps.id;
                
                // Clear existing timeout and interval
                if (activePowerupTimeouts[zapsId]) {
                    clearTimeout(activePowerupTimeouts[zapsId].timeout);
                    clearInterval(activePowerupTimeouts[zapsId].interval);
                }
                
                // Reset the start time and remaining time
                existingZaps.startTime = Date.now();
                existingZaps.remainingTime = 15000;
                
                // Set a new interval to update the remaining time
                const newZapsInterval = setInterval(() => {
                    // Find this powerup in the active list
                    const index = activePowerups.findIndex(p => p.id === zapsId);
                    if (index !== -1) {
                        // Update remaining time
                        const elapsed = Date.now() - activePowerups[index].startTime;
                        activePowerups[index].remainingTime = Math.max(0, activePowerups[index].duration - elapsed);
                        
                        // Update the UI
                        updateActivePowerupsUI();
                    }
                }, 1000);
                
                // Set a new timeout to disable the effect after 15 seconds
                const newZapsTimeout = setTimeout(() => {
                    isZapsActive = false;
                    isInvincible = false;
                    earningMultiplier = earningMultiplier / 1.5; // Restore original multiplier
                    truck.remove(existingZaps.effect);
                    console.log("ZAPS effect ended!");
                    
                    // Remove from active powerups
                    const index = activePowerups.findIndex(p => p.id === zapsId);
                    if (index !== -1) {
                        activePowerups.splice(index, 1);
                    }
                    
                    // Clear the interval and remove from active timeouts
                    clearInterval(newZapsInterval);
                    delete activePowerupTimeouts[zapsId];
                    
                    // Update the UI
                    updateActivePowerupsUI();
                }, 15000);
                
                // Store the new interval and timeout
                activePowerupTimeouts[zapsId] = {
                    interval: newZapsInterval,
                    timeout: newZapsTimeout
                };
                
                // Update the UI
                updateActivePowerupsUI();
            } else {
                // New ZAPS powerup
                isZapsActive = true;
                isInvincible = true;
                
                // Increase earnings while active
                const oldEarningMultiplier = earningMultiplier;
                earningMultiplier = earningMultiplier * 1.5;
                
                // Create visual effect for invincibility
                const auraEffect = createInvincibilityAura();
                truck.add(auraEffect);
                
                console.log("ZAPS activated! Player is invincible and earning 1.5x for 15 seconds");
                
                // Create a unique ID for this powerup instance
                const zapsId = Date.now() + Math.random();
                
                // Add to active powerups
                const zapsPowerup = {
                    id: zapsId,
                    type: 'zaps',
                    startTime: Date.now(),
                    duration: 15000,
                    remainingTime: 15000,
                    effect: auraEffect
                };
                activePowerups.push(zapsPowerup);
                
                // Update the powerups UI
                updateActivePowerupsUI();
                
                // Set an interval to update the remaining time
                const zapsInterval = setInterval(() => {
                    // Find this powerup in the active list
                    const index = activePowerups.findIndex(p => p.id === zapsId);
                    if (index !== -1) {
                        // Update remaining time
                        const elapsed = Date.now() - activePowerups[index].startTime;
                        activePowerups[index].remainingTime = Math.max(0, activePowerups[index].duration - elapsed);
                        
                        // Update the UI
                        updateActivePowerupsUI();
                    }
                }, 1000);
                
                // Set a timeout to disable the effect after 15 seconds
                const zapsTimeout = setTimeout(() => {
                    isZapsActive = false;
                    isInvincible = false;
                    earningMultiplier = oldEarningMultiplier;
                    truck.remove(auraEffect);
                    console.log("ZAPS effect ended!");
                    
                    // Remove from active powerups
                    const index = activePowerups.findIndex(p => p.id === zapsId);
                    if (index !== -1) {
                        activePowerups.splice(index, 1);
                    }
                    
                    // Clear the interval and remove from active timeouts
                    clearInterval(zapsInterval);
                    delete activePowerupTimeouts[zapsId];
                    
                    // Update the UI
                    updateActivePowerupsUI();
                }, 15000);
                
                // Store the interval and timeout
                activePowerupTimeouts[zapsId] = {
                    interval: zapsInterval,
                    timeout: zapsTimeout
                };
            }
            break;
            
        case 'energy':
            // Check if Energy is already active
            const existingEnergyIndex = activePowerups.findIndex(p => p.type === 'energy');
            
            if (existingEnergyIndex !== -1) {
                // Energy already active, reset the timer
                console.log("Energy refreshed! Timer reset to 12 seconds");
                
                // Get the existing powerup and its ID
                const existingEnergy = activePowerups[existingEnergyIndex];
                const energyId = existingEnergy.id;
                
                // Clear existing timeout and interval
                if (activePowerupTimeouts[energyId]) {
                    clearTimeout(activePowerupTimeouts[energyId].timeout);
                    clearInterval(activePowerupTimeouts[energyId].interval);
                }
                
                // Reset the start time and remaining time
                existingEnergy.startTime = Date.now();
                existingEnergy.remainingTime = 12000;
                
                // Store current speed in case it changed
                const currentSpeed = speed;
                
                // Set a new interval to update the remaining time
                const newEnergyInterval = setInterval(() => {
                    // Find this powerup in the active list
                    const index = activePowerups.findIndex(p => p.id === energyId);
                    if (index !== -1) {
                        // Update remaining time
                        const elapsed = Date.now() - activePowerups[index].startTime;
                        activePowerups[index].remainingTime = Math.max(0, activePowerups[index].duration - elapsed);
                        
                        // Update the UI
                        updateActivePowerupsUI();
                    }
                }, 1000);
                
                // Set a new timeout to disable the effect after 12 seconds
                const newEnergyTimeout = setTimeout(() => {
                    if (gameStarted && !inTruckstop) {
                        speed = currentSpeed / 1.5; // Return to the speed before the power-up
                        console.log("Energy speed boost ended!");
                        
                        // Remove from active powerups
                        const index = activePowerups.findIndex(p => p.id === energyId);
                        if (index !== -1) {
                            activePowerups.splice(index, 1);
                        }
                        
                        // Clear the interval and remove from active timeouts
                        clearInterval(newEnergyInterval);
                        delete activePowerupTimeouts[energyId];
                        
                        // Update the UI
                        updateActivePowerupsUI();
                    }
                }, 12000);
                
                // Store the new interval and timeout
                activePowerupTimeouts[energyId] = {
                    interval: newEnergyInterval,
                    timeout: newEnergyTimeout
                };
                
                // Update the UI
                updateActivePowerupsUI();
            } else {
                // Energy now speeds up the truck
                console.log("Energy drink consumed! Speed boost activated!");
                
                // Store current speed for restoration later
                const currentSpeed = speed;
                // Boost speed by 50%
                speed = Math.min(currentSpeed * 1.5, baseSpeed * maxSpeedMultiplier);
                
                // Create a unique ID for this powerup instance
                const energyId = Date.now() + Math.random();
                
                // Add to active powerups
                const energyPowerup = {
                    id: energyId,
                    type: 'energy',
                    startTime: Date.now(),
                    duration: 12000,
                    remainingTime: 12000
                };
                activePowerups.push(energyPowerup);
                
                // Update the powerups UI
                updateActivePowerupsUI();
                
                // Set an interval to update the remaining time
                const energyInterval = setInterval(() => {
                    // Find this powerup in the active list
                    const index = activePowerups.findIndex(p => p.id === energyId);
                    if (index !== -1) {
                        // Update remaining time
                        const elapsed = Date.now() - activePowerups[index].startTime;
                        activePowerups[index].remainingTime = Math.max(0, activePowerups[index].duration - elapsed);
                        
                        // Update the UI
                        updateActivePowerupsUI();
                    }
                }, 1000);
                
                // Set a timeout to return to normal speed after 12 seconds
                const energyTimeout = setTimeout(() => {
                    if (gameStarted && !inTruckstop) {
                        speed = currentSpeed; // Return to the speed before the power-up
                        console.log("Energy speed boost ended!");
                        
                        // Remove from active powerups
                        const index = activePowerups.findIndex(p => p.id === energyId);
                        if (index !== -1) {
                            activePowerups.splice(index, 1);
                        }
                        
                        // Clear the interval and remove from active timeouts
                        clearInterval(energyInterval);
                        delete activePowerupTimeouts[energyId];
                        
                        // Update the UI
                        updateActivePowerupsUI();
                    }
                }, 12000);
                
                // Store the interval and timeout
                activePowerupTimeouts[energyId] = {
                    interval: energyInterval,
                    timeout: energyTimeout
                };
            }
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

function displayInGameMessage(message) {
    // Get or create the alert box container
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '20px';
        alertContainer.style.left = '50%';
        alertContainer.style.transform = 'translateX(-50%)';
        alertContainer.style.zIndex = '1000';
        alertContainer.style.display = 'flex';
        alertContainer.style.flexDirection = 'column';
        alertContainer.style.gap = '10px';
        alertContainer.style.alignItems = 'center';
        alertContainer.style.width = 'auto';
        alertContainer.style.maxWidth = '80%';
        document.body.appendChild(alertContainer);
    }

    // Create the message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'game-message'; // Add a class for easier styling
    messageDiv.style.background = 'rgba(0,0,0,0.9)';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '20px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.fontSize = '24px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.zIndex = '1001';
    messageDiv.style.width = '100%';
    messageDiv.style.boxSizing = 'border-box';
    messageDiv.innerHTML = message;
    
    // Add the message to the container
    alertContainer.appendChild(messageDiv);
    
    // Remove the message after timeout
    setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
            alertContainer.removeChild(messageDiv);
            
            // If no more messages, remove the container too
            if (alertContainer.children.length === 0) {
                document.body.removeChild(alertContainer);
            }
        }
    }, 4000);
}

function applyObstacleEffect(type) {
    if (isInvincible) return;
    
    // Store current speed for restoration later
    const currentSpeed = speed;
    
    switch (type) {
        case 'doubleBroker':
            money = Math.max(0, money - 200);
            displayInGameMessage("Double broker stole your load! -$200");
            break;
        case 'lotLizard':
            // Create a separate penalty function for the obstacle version
            // Instead of calling applyLotLizardPenalty() which is for the truck stop
            money = Math.max(0, money - 50);
            health -= 10;
            displayInGameMessage("Lot lizard caused distraction! -$50 and -10 health");
            break;
        case 'lowBridge':
            health -= 100;
            // speed = currentSpeed * 0.7; // Reduce to 70% of current speed
            // setTimeout(() => {
            //     if (gameStarted && !inTruckstop) {
            //         speed = currentSpeed; // Return to the speed before the obstacle
            //     }
            // }, 5000);
            displayInGameMessage("Hit low bridge!");
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
                displayInGameMessage("DOT inspection! -$100 and speed reduced for 8 seconds");
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
        displayInGameMessage("Already refueling!");
        return;
    }
    
    // If fuel is already full
    if (fuel >= 95) {
        displayInGameMessage("Your tank is already full!");
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
                displayInGameMessage("Refueling complete!");
                console.log("Refueling complete!");
            }
        }, 500); // Add fuel every 0.5 seconds
        
        console.log(`Refueling started. Paid $${refuelCost}`);
    } else {
        // Not enough money
        displayInGameMessage("Not enough money to refuel!");
        console.log(`Not enough money to refuel. Need $${refuelCost}, have $${Math.floor(money)}`);
    }
}

function buyRollerDogs() {
    console.log("Attempting to buy Roller Dogs...");
    
    // Check if health is already full
    if (health >= 95) {
        displayInGameMessage("Your health is already full!");
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
        displayInGameMessage(`Bought Roller Dogs! Health increased by ${healthBoost}.`);
        console.log(`Bought Roller Dogs for $${rollerDogsCost}. Health increased by ${healthBoost}.`);
    } else {
        // Not enough money
        displayInGameMessage("Not enough money to buy Roller Dogs!");
        console.log(`Not enough money for Roller Dogs. Need $${rollerDogsCost}, have $${Math.floor(money)}`);
    }
}

function buyBluetooth() {
    console.log("Attempting to buy Bluetooth...");
    
    // Check if already has Bluetooth
    if (hasBluetooth) {
        displayInGameMessage("You already have Bluetooth installed!");
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
        displayInGameMessage("Bluetooth purchased! Earnings increased by 20%");
    } else {
        // Not enough money
        displayInGameMessage("Not enough money to buy Bluetooth!");
        console.log(`Not enough money for Bluetooth. Need $${bluetoothCost}, have $${Math.floor(money)}`);
    }
}

function buyDEFDelete() {
    console.log("Attempting to buy DEF Delete...");
    
    // Check if already has DEF Delete
    if (hasDEFDelete) {
        displayInGameMessage("You already have DEF Delete installed!");
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
        displayInGameMessage("DEF Delete installed! Fuel consumption reduced by 25%");
    } else {
        // Not enough money
        displayInGameMessage("Not enough money to buy DEF Delete!");
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
            
            #powerups-container {
                font-size: 12px !important;
                padding: 8px !important;
                top: 105px !important;
                right: 10px !important;
                max-width: 150px !important;
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

// Function to fetch leaderboard data
function fetchLeaderboardData() {
    if (!window.firebaseRefs) {
        console.error("Firebase references not available");
        return;
    }
    
    const { ref } = window.firebaseRefs;
    const leaderboardRef = ref(window.firebaseDatabase, 'leaderboard');
    
    // Check if we're using the game page Firebase references or leaderboard page references
    if (window.firebaseRefs.onValue) {
        // If onValue is available (like in leaderboard.html), use it
        window.firebaseRefs.onValue(leaderboardRef, processLeaderboardData, { onlyOnce: true });
    } else {
        // If onValue is not available (like in index.html), use a one-time fetch technique
        console.log("Using alternative method to fetch leaderboard data");
        
        // Use the Firebase REST API to get the data once
        // Try to get the database URL from firebaseConfig if available
        let dbUrl = 'https://freight-frenzy-default-rtdb.firebaseio.com/leaderboard.json';
        
        // If we have a databaseURL in the config, use that instead
        if (window.firebaseConfig && window.firebaseConfig.databaseURL) {
            dbUrl = `${window.firebaseConfig.databaseURL}/leaderboard.json`;
        }
        
        fetch(dbUrl)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    processLeaderboardSnapshot({ 
                        exists: () => true,
                        forEach: callback => {
                            Object.keys(data).forEach(key => {
                                callback({
                                    val: () => data[key]
                                });
                            });
                        }
                    });
                } else {
                    console.log("No leaderboard entries found");
                }
            })
            .catch(error => {
                console.error("Error fetching leaderboard data:", error);
            });
    }
}

// Separate function to process leaderboard data
function processLeaderboardData(snapshot) {
    processLeaderboardSnapshot(snapshot);
}

// Function to process the leaderboard snapshot regardless of how it was retrieved
function processLeaderboardSnapshot(snapshot) {
    leaderboardData = [];
    
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const score = childSnapshot.val();
            leaderboardData.push(score);
        });
        
        console.log(`Loaded ${leaderboardData.length} leaderboard entries`);
        
        // If the game is already started, update the upcoming crashed trucks
        if (gameStarted) {
            upcomingCrashedTrucks = [...leaderboardData]
                .map(entry => entry.distance)
                .filter(distance => distance > distanceTraveled) // Only future distances
                .sort((a, b) => a - b); // Sort in ascending order
        }
    } else {
        console.log("No leaderboard entries found");
    }
}

// Function to create a crashed truck at a specific distance
function createCrashedTruck(distance, playerName) {
    // Create a group for the crashed truck
    const crashedTruckGroup = new THREE.Group();
    
    // Create the crashed truck using the same function that creates player trucks
    // but we'll modify it to look crashed
    const crashedTruck = createTruck();
    
    // Apply damage/crash effects:
    // 1. Tilt the truck (as if it crashed off the road) - using more subtle angles
    crashedTruck.rotation.z = (Math.random() - 0.5) * 0.3; // Less extreme tilt
    crashedTruck.rotation.y = Math.PI / 4 * (Math.random() > 0.5 ? 1 : -1); // Turn toward or away from road
    
    // 2. Always position to the side of the road (not on it)
    // Randomly choose left or right side, but with more distance from center
    const side = Math.random() > 0.5 ? -1 : 1;
    const offsetX = side * (15 + Math.random() * 5); // 15-20 units from center - well off the road
    
    // 3. Add some vertical offset (as if it's partially in a ditch)
    crashedTruck.position.y = -0.5 - Math.random() * 0.8; // Less extreme sinking
    
    // 4. Scale down the truck slightly to indicate distance perspective
    crashedTruck.scale.set(0.9, 0.9, 0.9);
    
    // Add the truck to the group
    crashedTruckGroup.add(crashedTruck);
    
    // Set the group's X position here (not the individual truck)
    // This way all children (including the truck) inherit this position
    crashedTruckGroup.position.x = offsetX;
    
    // Create a simple text sprite for the player name and distance
    // This avoids the 3D font loading which can cause issues
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    // Make the background fully transparent
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw text with a slight shadow for readability
    context.font = 'Bold 36px Arial';
    context.textAlign = 'center';
    context.fillStyle = '#FFFF00';
    context.strokeStyle = '#000000';
    context.lineWidth = 3;
    context.strokeText(playerName, 256, 50);
    context.fillText(playerName, 256, 50);
    
    context.font = 'Bold 32px Arial';
    context.strokeText(`${distance}m`, 256, 90);
    context.fillText(`${distance}m`, 256, 90);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        alphaTest: 0.1,
        sizeAttenuation: true // Enable size attenuation so it scales with distance
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(20, 7, 1); // 300% larger for better visibility
    
    // Create a separate group for the text that always faces the camera
    const textGroup = new THREE.Group();
    textGroup.position.set(0, 6, 0); // Position high above the crashed truck
    textGroup.add(sprite);
    
    // Add the text group to the main group
    crashedTruckGroup.add(textGroup);
    
    // Add subtle smoke/debris particles for effect (fewer particles, less movement)
    const particleCount = 10; // Reduced from 20
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        particlePositions[i3] = (Math.random() - 0.5) * 2; // x - smaller spread
        particlePositions[i3 + 1] = Math.random() * 1.5; // y - lower height
        particlePositions[i3 + 2] = (Math.random() - 0.5) * 2; // z - smaller spread
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x888888,
        size: 0.15, // Smaller particles
        transparent: true,
        opacity: 0.5 // More subtle
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    
    // Position particles near the truck
    particles.position.set(0, 1, 0);
    crashedTruck.add(particles);
    
    // Animate the smoke particles - more subtle movement
    const animateSmoke = function() {
        if (!particles.parent) return; // Stop if removed from scene
        
        const positions = particles.geometry.attributes.position.array;
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // Move particle up slowly
            positions[i3 + 1] += 0.005; // Slower rise
            
            // Reset particle if it goes too high
            if (positions[i3 + 1] > 2) {
                positions[i3 + 1] = 0;
            }
            
            // Very slight random movement
            positions[i3] += (Math.random() - 0.5) * 0.01; // Reduced jitter
            positions[i3 + 2] += (Math.random() - 0.5) * 0.01; // Reduced jitter
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
        requestAnimationFrame(animateSmoke);
    };
    
    animateSmoke();
    
    // Add tag to identify this as a crashed leaderboard truck
    crashedTruckGroup.userData = {
        isCrashedLeaderboardTruck: true,
        distance: distance,
        playerName: playerName
    };
    
    return crashedTruckGroup;
}

// Function to select an item based on weights
function getWeightedRandomItem(items) {
    // Calculate total weight
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    
    // Get a random value between 0 and totalWeight
    let random = Math.random() * totalWeight;
    
    // Find the item that corresponds to the random value
    for (const item of items) {
        random -= item.weight;
        if (random <= 0) {
            return item.type;
        }
    }
    
    // Fallback (should never reach here if weights are positive)
    return items[0].type;
}

// Function to set the weight for a specific powerup type
function setPowerUpWeight(powerUpType, weight) {
    const powerUp = powerUpTypes.find(item => item.type === powerUpType);
    if (powerUp) {
        powerUp.weight = Math.max(0, weight); // Ensure weight is non-negative
        console.log(`Updated ${powerUpType} weight to ${weight}`);
    } else {
        console.error(`PowerUp type ${powerUpType} not found`);
    }
}

// Function to set the weight for a specific obstacle type
function setObstacleWeight(obstacleType, weight) {
    const obstacle = obstacleTypes.find(item => item.type === obstacleType);
    if (obstacle) {
        obstacle.weight = Math.max(0, weight); // Ensure weight is non-negative
        console.log(`Updated ${obstacleType} weight to ${weight}`);
    } else {
        console.error(`Obstacle type ${obstacleType} not found`);
    }
}

// Function to get current weights for all powerups and obstacles
function getSpawnWeights() {
    console.log("PowerUp weights:", powerUpTypes.map(p => `${p.type}: ${p.weight}`).join(', '));
    console.log("Obstacle weights:", obstacleTypes.map(o => `${o.type}: ${o.weight}`).join(', '));
    return {
        powerUps: Object.fromEntries(powerUpTypes.map(p => [p.type, p.weight])),
        obstacles: Object.fromEntries(obstacleTypes.map(o => [o.type, o.weight]))
    };
}
