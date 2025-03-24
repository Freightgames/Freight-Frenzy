// Game Constants and Configuration

/**
 * Vehicle properties for trucks and trailers
 */
export const VEHICLE_PROPERTIES = {
  trucks: {
    flipFlopSpecial: {
      name: "Flip Flop Special",
      description: "Modern aerodynamic Volvo-style truck. Fuel efficient but less power.",
      fuelEfficiency: 1.2, // Better fuel efficiency (multiplier)
      power: 0.9, // Slightly less power
      handling: 1.1, // Better handling
      durability: 1.0 // Standard durability
    },
    oldTimer: {
      name: "Old Timer",
      description: "Classic Mack with a long hood. More power but less efficient.",
      fuelEfficiency: 0.8, // Worse fuel efficiency 
      power: 1.2, // More power
      handling: 0.9, // Slightly worse handling
      durability: 1.2 // Better durability
    },
    strongSoloSergey: {
      name: "Strong Solo Sergey",
      description: "Worn but reliable Freightliner. Balanced stats with character.",
      fuelEfficiency: 1.0, // Standard fuel efficiency
      power: 1.0, // Standard power
      handling: 1.0, // Standard handling
      durability: 1.1 // Slightly better durability
    }
  }
};

/**
 * Trailer properties and configurations
 */
export const TRAILER_PROPERTIES = {
  dryVan: {
    name: "Dry Van",
    description: "Standard enclosed trailer. Balanced weight and earnings.",
    dimensions: {
      length: 53,
      width: 8.5,
      height: 13.5
    },
    weight: 1.0, // Standard weight factor
    earningFactor: 1.0, // Standard earning rate
    colors: ["white", "#e63946", "#457b9d", "#1d3557"]
  },
  flatbed: {
    name: "Flatbed",
    description: "Open trailer with exposed cargo. Lighter but pays less.",
    dimensions: {
      length: 48,
      width: 8.5,
      height: 4
    },
    weight: 0.8, // Lighter than dry van
    earningFactor: 0.9, // Pays slightly less
    colors: ["#6c757d", "#adb5bd", "#495057", "#343a40"]
  }
};

/**
 * Game difficulty settings
 */
export const DIFFICULTY_SETTINGS = {
  easy: {
    name: "Easy",
    fuelConsumption: 0.8, // Lower fuel consumption
    obstacleFrequency: 0.7, // Fewer obstacles
    damageMultiplier: 0.7, // Less damage
    earningsMultiplier: 0.8, // Lower earnings
    truckstopsFrequency: 1.3 // More frequent truckstops
  },
  normal: {
    name: "Normal",
    fuelConsumption: 1.0, // Standard fuel consumption
    obstacleFrequency: 1.0, // Standard obstacles
    damageMultiplier: 1.0, // Standard damage
    earningsMultiplier: 1.0, // Standard earnings
    truckstopsFrequency: 1.0 // Standard truckstops
  },
  hard: {
    name: "Hard",
    fuelConsumption: 1.2, // Higher fuel consumption
    obstacleFrequency: 1.3, // More obstacles
    damageMultiplier: 1.3, // More damage
    earningsMultiplier: 1.2, // Higher earnings
    truckstopsFrequency: 0.7 // Less frequent truckstops
  }
};

/**
 * Game settings and mechanics
 */
export const GAME_SETTINGS = {
  // Player stats
  MAX_HEALTH: 100,
  MAX_FUEL: 100,
  INITIAL_MONEY: 500,
  
  // Game mechanics
  BASE_SPEED: 60, // mph
  MAX_SPEED: 80, // mph
  ACCELERATION_RATE: 2, // mph per second
  DECELERATION_RATE: 5, // mph per second
  BASE_FUEL_CONSUMPTION: 0.2, // fuel per mile
  LANE_WIDTH:
  4, // width of a lane in world units
  ROAD_WIDTH: 12, // total road width in world units (3 lanes)
  
  // Environment settings
  RENDER_DISTANCE: 1000, // how far ahead to render road
  OBSTACLE_SPAWN_DISTANCE: 800, // distance ahead where obstacles spawn
  OBSTACLE_DESPAWN_DISTANCE: -200, // distance behind where obstacles are removed
  POWERUP_CHANCE: 0.2, // probability of a powerup spawning
  
  // Economy settings
  BASE_RATE_PER_MILE: 2.5, // base earnings per mile
  DAMAGE_REPAIR_COST: 2, // cost per health point to repair
  
  // Truckstop settings
  MIN_DISTANCE_BETWEEN_TRUCKSTOPS: 50, // minimum miles between truckstops
  MAX_DISTANCE_BETWEEN_TRUCKSTOPS: 150 // maximum miles between truckstops
};

/**
 * Powerup types and effects
 */
export const POWERUPS = {
  coffee: {
    name: "Coffee",
    duration: 20, // seconds
    effect: "Increases max speed by 20%",
    icon: "☕",
    color: "#6f4e37",
    speedMultiplier: 1.2,
    fuelMultiplier: 1.0
  },
  energyDrink: {
    name: "Energy Drink",
    duration: 15, // seconds
    effect: "Increases max speed by 30%, but increases fuel consumption by 20%",
    icon: "⚡",
    color: "#ffcc00",
    speedMultiplier: 1.3,
    fuelMultiplier: 1.2
  },
  cruise: {
    name: "Cruise Control",
    duration: 30, // seconds
    effect: "Reduces fuel consumption by 30%",
    icon: "🛞",
    color: "#4CAF50",
    speedMultiplier: 1.0,
    fuelMultiplier: 0.7
  }
};

/**
 * Obstacle types and properties
 */
export const OBSTACLES = {
  pothole: {
    name: "Pothole",
    damage: 10,
    width: 1.5,
    height: 1.5,
    depth: 0.5,
    color: "#424242",
    avoidable: true,
    probability: 0.3
  },
  debris: {
    name: "Road Debris",
    damage: 5,
    width: 2,
    height: 1,
    depth: 0.3,
    color: "#7e7e7e",
    avoidable: true,
    probability: 0.4
  },
  roadwork: {
    name: "Roadwork",
    damage: 0, // doesn't cause damage but blocks a lane
    width: 4,
    height: 4,
    depth: 2,
    color: "#f9a825",
    avoidable: true,
    blocksLane: true,
    probability: 0.15
  },
  trafficJam: {
    name: "Traffic Jam",
    damage: 20, // high damage if you hit it
    width: 6,
    height: 2,
    depth: 2,
    color: "#e53935",
    avoidable: true,
    blocksLane: true,
    slowsTraffic: true,
    probability: 0.1
  },
  brokenTruck: {
    name: "Broken Down Truck",
    damage: 30, // very high damage
    width: 8,
    height: 3,
    depth: 3,
    color: "#1565c0",
    avoidable: true,
    blocksLane: true,
    probability: 0.05
  }
};

/**
 * Truckstop configuration
 */
export const TRUCKSTOP = {
  name: "Big Rig Rest Stop",
  fuelPrice: 3.5, // dollars per fuel unit
  // Minimum and maximum distance between truckstops (in meters)
  MIN_DISTANCE_BETWEEN_TRUCKSTOPS: 3000,
  MAX_DISTANCE_BETWEEN_TRUCKSTOPS: 7000,
  shopItems: {
    rollerDogs: {
      name: "Roller Dogs",
      price: 10,
      healthBoost: 20,
      description: "Gas station hot dogs. Questionable, but filling."
    },
    bluetooth: {
      name: "Bluetooth Upgrade",
      price: 100,
      earningsBoost: 0.2, // 20% earnings boost
      description: "Better dispatching means more profitable hauls."
    },
    defDelete: {
      name: "DEF Delete Kit",
      price: 200,
      fuelEfficiency: 0.2, // 20% fuel efficiency boost
      description: "Don't tell the EPA, but this will save you fuel."
    }
  }
};

/**
 * Pricing constants
 */
export const PRICES = {
  // Repair cost (fixed price)
  REPAIR_COST: 250.00,
  
  // Fuel cost per gallon
  FUEL_COST_PER_GALLON: 3.99
};

/**
 * Audio settings and sound effects
 */
export const AUDIO = {
  musicTracks: [
    "audio/music/country_drive.mp3",
    "audio/music/highway_cruisin.mp3",
    "audio/music/open_road.mp3"
  ],
  soundEffects: {
    engine: "audio/sfx/engine.mp3",
    horn: "audio/sfx/horn.mp3",
    crash: "audio/sfx/crash.mp3",
    powerup: "audio/sfx/powerup.mp3",
    fuelLow: "audio/sfx/fuel_low.mp3",
    truckstop: "audio/sfx/truckstop.mp3"
  },
  defaultVolume: 0.5
}; 