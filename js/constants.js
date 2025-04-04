// Game constants
export const billboardMessages = [
    { weight: 1, type: 'text', content: 'HELL IS REAL' },
    { weight: 1, type: 'text', content: 'REST AREA 10 MILES' },
    { weight: 1, type: 'text', content: 'GAS FOOD LODGING' },
    { weight: 1, type: 'text', content: 'BROKER TRANSPARENCY NOW!' },
    { weight: 1, type: 'text', content: 'Your Ad Here' },
    { weight: 1, type: 'text', content: 'Strong Solo Sergey Wanted' },
    { weight: 1, type: 'text', content: 'Lip Pillows and Freedom' },
    { weight: 1, type: 'text', content: 'SAY NO TO CHEAP FREIGHT' },
    { weight: 1.1, type: 'image', content: './billboard-images/freight360.png', analytics: 'freight360-billboard'},
    { weight: 1.1, type: 'image', content: './billboard-images/loadpartner.png', analytics: 'loadpartner-billboard'},
    { weight: 1.2, type: 'image', content: './billboard-images/wtt.jpg', analytics: 'whatthetruck-billboard'},
    { weight: 1.2, type: 'image', content: './billboard-images/scrm.png', analytics: 'scrm-billboard', bgColor: "#ffffff"},
    { weight: 1.2, type: 'image', content: './billboard-images/yms.png', analytics: 'yms-billboard', bgColor: "#f9e231"},
    { weight: 1.2, type: 'image', content: './billboard-images/shimmi.jpg', analytics: 'shimmi-billboard', bgColor: "#ffffff"},
    { weight: 1.2, type: 'image', content: './billboard-images/velite.png', analytics: 'velite-billboard'},
];

// Environment settings
export const regions = [
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

export const powerUpTypes = [
    { type: 'zaps', weight: 5 },
    { type: 'energy', weight: 5 },
    { type: 'wrench', weight: 2 },
    { type: 'fuelCan', weight: 4 }
];

export const obstacleTypes = [
    { type: 'doubleBroker', weight: 2 },
    { type: 'lotLizard', weight: 2 },
    { type: 'lowBridge', weight: 1 },
    { type: 'dotOfficer', weight: 2 }
];

// Game configuration
export const config = {
    segmentLength: 50,
    visibleSegments: 10,
    laneWidth: 4,
    lanePositions: [-4, 0, 4], // Centers of each lane
    truckStopInterval: 2000,
    baseSpeed: 10,
    speedIncreaseRate: 0.0007,
    maxSpeedMultiplier: 3.5,
    truckstopTimeLimit: 30 // seconds before lot lizard appears
}; 