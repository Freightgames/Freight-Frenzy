import { config, regions } from './constants.js';

// Game state 
const gameState = {
    // Game status
    gameStarted: false,
    isPaused: false,
    inTruckstop: false,
    
    // Player stats
    health: 100,
    fuel: 100,
    money: 0,
    distanceTraveled: 0,
    
    // Movement
    speed: config.baseSpeed,
    lane: 0,
    baseSpeed: config.baseSpeed,
    
    // Powerups and effects
    isInvincible: false,
    isZapsActive: false,
    activePowerups: [],
    activePowerupTimeouts: {},
    
    // Game difficulty
    difficultyLevel: 'medium',
    earningMultiplier: 1,
    fuelConsumptionRate: 1,
    
    // Environment
    regionIndex: 0,
    segments: [],
    lastSegmentZ: 0,
    
    // Truck stop
    nextTruckStopDistance: config.truckStopInterval,
    truckStop: null,
    truckstopTimer: 0,
    lotLizardWarned: false,
    lotLizardVisible: false,
    lotLizard: null,
    
    // Upgrades
    hasBluetooth: false,
    hasDEFDelete: false,
    isRefueling: false,
    
    // Vehicle selection
    selectedTruckType: 'flipFlopSpecial',
    selectedTrailerType: 'dryVan',
    
    // Spawn timers
    spawnTimer: 0,
    
    // Leaderboard crashed trucks
    leaderboardData: [],
    placedCrashedTrucks: new Set(),
    upcomingCrashedTrucks: [],
    lastCrashedTruckPlacementDistance: 0,
    minDistanceForNextCrashedTruck: 50 + Math.floor(Math.random() * 51),
    
    // Set the game difficulty
    setDifficulty(level) {
        console.log("Setting difficulty to:", level);
        this.difficultyLevel = level;
        switch (level) {
            case 'easy':
                this.baseSpeed = 8;
                this.earningMultiplier = 1;
                this.speedIncreaseRate = 0.0005; // Slower speed increase for easy mode
                break;
            case 'medium':
                this.baseSpeed = 10;
                this.earningMultiplier = 2;
                this.speedIncreaseRate = 0.001; // Medium speed increase
                break;
            case 'hard':
                this.baseSpeed = 12;
                this.earningMultiplier = 3;
                this.speedIncreaseRate = 0.0015; // Faster speed increase for hard mode
                break;
        }
        this.speed = this.baseSpeed;
    },
    
    // Reset the game state
    reset() {
        this.gameStarted = false;
        this.inTruckstop = false;
        this.isPaused = false;
        this.health = 100;
        this.fuel = 100;
        this.money = 0;
        this.lane = 0;
        this.speed = this.baseSpeed;
        this.distanceTraveled = 0;
        this.regionIndex = 0;
        this.nextTruckStopDistance = config.truckStopInterval;
        this.hasBluetooth = false;
        this.hasDEFDelete = false;
        this.fuelConsumptionRate = 1.0;
        this.earningMultiplier = 1.0;
        this.isZapsActive = false;
        this.isInvincible = false;
        this.activePowerups = [];
        this.activePowerupTimeouts = {};
        this.placedCrashedTrucks.clear();
        this.lastCrashedTruckPlacementDistance = 0;
        this.minDistanceForNextCrashedTruck = 50 + Math.floor(Math.random() * 51);
    }
};

export default gameState; 